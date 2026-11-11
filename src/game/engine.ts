import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  GamePlace, 
  PartData, 
  GameState, 
  StudioTool, 
  PlayerStats, 
  AvatarConfig, 
  PartShape,
  PartBehavior,
  CommandAction,
  WeatherEvent,
  SkyTheme,
  StageDifficulty
} from '../types/game';
import { RobloxCharacter } from './character';
import { ParticleSystem } from './particleSystem';
import { WeatherSystem } from './weatherParticles';
import { 
  getBaseplateTexture, 
  getConveyorTexture, 
  getSpawnPadTexture, 
  getStudsTexture, 
  setMaxAnisotropy 
} from './proceduralTextures';
import { sounds } from '../audio/soundManager';
import { getDifficultyForStage, getRobuxRewardForStage } from './templates';

export interface EngineCallbacks {
  onStatsUpdate: (stats: PlayerStats) => void;
  onSelectPart: (part: PartData | null) => void;
  onStateChange: (state: GameState) => void;
  onPartsModified: (parts: PartData[]) => void;
  onHistoryChange: (canUndo: boolean, canRedo: boolean) => void;
  onStageCleared: (stage: number, rewardRobux: number, difficulty: StageDifficulty) => void;
}

export class RobloxGameEngine {
  public container: HTMLElement;
  public renderer!: THREE.WebGLRenderer;
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public character!: RobloxCharacter;
  public particleSystem!: ParticleSystem;
  public weatherSystem!: WeatherSystem;

  private isSoftwareGl: boolean = false;
  private animationFrameId: number = 0;
  private clock: THREE.Clock = new THREE.Clock();
  
  // Game state
  public gameState: GameState = 'title';
  public currentPlace!: GamePlace;
  public activeTool: StudioTool = 'select';
  public selectedPartId: string | null = null;
  public selectedMesh: THREE.Object3D | null = null;
  public selectionBox: THREE.BoxHelper | null = null;

  // Undo / Redo Command History
  private undoStack: CommandAction[] = [];
  private redoStack: CommandAction[] = [];

  // Shift Lock
  public isShiftLockActive: boolean = false;

  // Player stats
  public stats: PlayerStats = {
    health: 100,
    maxHealth: 100,
    coins: (() => {
      try {
        const raw = localStorage.getItem('blox_player_robux');
        if (raw !== null) {
          const parsed = parseInt(raw, 10);
          if (!isNaN(parsed)) return Math.max(0, parsed);
        }
      } catch {}
      return 50;
    })(),
    stage: 1,
    maxStages: 20,
    deaths: 0,
    elapsedSeconds: 0,
    hasGravityCoil: false,
    hasSpeedCoil: false,
    difficulty: 'Easy',
    godMode: false,
    flyMode: false,
    infiniteJump: false,
    speedMultiplier: 1.0,
  };

  private currentCheckpoint: [number, number, number] = [0, 1.5, 0];

  // Physics & Kinematics
  private playerVelocity: THREE.Vector3 = new THREE.Vector3();
  private isGrounded: boolean = false;
  private coyoteTimer: number = 0;
  private jumpBufferTimer: number = 0;
  private speedBoostTimer: number = 0;
  private respawnTimer: number = 0;
  private screenShake: number = 0;

  // Camera settings
  private cameraDistance: number = 10;
  private targetCameraDistance: number = 10;
  private cameraPitch: number = 0.35;
  private cameraYaw: number = 0;
  private isRightMouseDown: boolean = false;
  private mousePrevX: number = 0;
  private mousePrevY: number = 0;

  // Title screen camera orbit
  private titleOrbitAngle: number = 0;

  // Studio Free-cam
  private studioCamPos: THREE.Vector3 = new THREE.Vector3(0, 15, 25);
  private studioCamTarget: THREE.Vector3 = new THREE.Vector3(0, 5, 0);

  // Mesh & Part mapping
  private partMeshes: Map<string, THREE.Mesh> = new Map();
  private disappearingTimers: Map<string, { state: 'idle' | 'fading' | 'hidden'; timer: number; origY: number }> = new Map();

  // Inputs
  private keysHeld: { [key: string]: boolean } = {};
  public callbacks: EngineCallbacks;

  // Raycasting
  private raycaster = new THREE.Raycaster();
  private mousePos = new THREE.Vector2();

  // Pre-allocated math helpers to eliminate GC
  private _moveVec = new THREE.Vector3();
  private _camForward = new THREE.Vector3();
  private _camRight = new THREE.Vector3();
  private _playerBox = new THREE.Box3();
  private _partBox = new THREE.Box3();

  constructor(container: HTMLElement, place: GamePlace, avatarConfig: AvatarConfig, callbacks: EngineCallbacks) {
    this.container = container;
    this.currentPlace = JSON.parse(JSON.stringify(place));
    this.callbacks = callbacks;

    this.initWebGL();
    this.initScene();
    this.initCharacter(avatarConfig);
    this.loadPlace(this.currentPlace);
    this.initInputs();
    this.startLoop();
  }

  private initWebGL() {
    const probeGl = document.createElement('canvas').getContext('webgl2');
    if (!probeGl) {
      this.isSoftwareGl = true;
    } else {
      const ext = probeGl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : probeGl.RENDERER;
      const gpu = String(probeGl.getParameter(param));
      probeGl.getExtension('WEBGL_lose_context')?.loseContext();
      this.isSoftwareGl = /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    }

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: false,
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.borderStyle = 'groove';

    this.container.appendChild(this.renderer.domElement);
    setMaxAnisotropy(this.renderer);
  }

  private initScene() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#38bdf8');
    this.scene.fog = new THREE.FogExp2('#93c5fd', 0.0035);

    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    this.camera = new THREE.PerspectiveCamera(65, width / height, 0.1, 1000);

    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3-point lighting rig
    const keyLight = new THREE.DirectionalLight('#fffbeb', 1.8);
    keyLight.position.set(40, 70, 30);
    keyLight.castShadow = !this.isSoftwareGl;
    if (keyLight.shadow) {
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      const d = 70;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    this.scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight('#bae6fd', '#334155', 0.85);
    this.scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight('#ffffff', 0.25);
    this.scene.add(ambientLight);

    // Particle system & Weather system
    this.particleSystem = new ParticleSystem(this.scene);
    this.weatherSystem = new WeatherSystem(this.scene, keyLight);

    // Selection helper for Studio Mode
    this.selectionBox = new THREE.BoxHelper(new THREE.Mesh(), 0x38bdf8);
    this.selectionBox.visible = false;
    this.scene.add(this.selectionBox);

    // Studio base grid helper
    const gridHelper = new THREE.GridHelper(300, 150, 0x0284c7, 0x64748b);
    gridHelper.position.y = -0.01;
    this.scene.add(gridHelper);
  }

  private initCharacter(avatarConfig: AvatarConfig) {
    this.character = new RobloxCharacter(avatarConfig);
    this.scene.add(this.character.root);
    this.currentCheckpoint = [...this.currentPlace.spawnPoint];
    this.character.root.position.set(this.currentCheckpoint[0], this.currentCheckpoint[1], this.currentCheckpoint[2]);
  }

  public loadPlace(place: GamePlace) {
    this.currentPlace = JSON.parse(JSON.stringify(place));

    // Clear existing part meshes
    this.partMeshes.forEach((mesh) => {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });
    this.partMeshes.clear();
    this.disappearingTimers.clear();
    this.undoStack = [];
    this.redoStack = [];
    this.notifyHistoryChange();

    this.currentCheckpoint = [...this.currentPlace.spawnPoint];
    this.stats.stage = 1;
    this.stats.deaths = 0;
    this.stats.elapsedSeconds = 0;
    this.stats.hasGravityCoil = false;
    this.stats.hasSpeedCoil = false;
    this.stats.difficulty = getDifficultyForStage(1);

    const checkpointParts = place.parts.filter(p => p.behavior === 'checkpoint');
    this.stats.maxStages = Math.max(checkpointParts.length, 1);
    this.callbacks.onStatsUpdate({ ...this.stats });

    place.parts.forEach((part) => {
      this.createPartMesh(part);
    });

    this.character.respawn(this.currentCheckpoint, this.scene);
  }

  private createPartMesh(part: PartData): THREE.Mesh {
    let geo: THREE.BufferGeometry;

    if (part.shape === 'sphere') {
      geo = new THREE.SphereGeometry(part.size[0] / 2, 24, 16);
    } else if (part.shape === 'cylinder') {
      geo = new THREE.CylinderGeometry(part.size[0] / 2, part.size[0] / 2, part.size[1], 24);
    } else if (part.shape === 'wedge') {
      geo = this.createWedgeGeometry(part.size[0], part.size[1], part.size[2]);
    } else {
      geo = new THREE.BoxGeometry(part.size[0], part.size[1], part.size[2]);
    }

    let mat: THREE.Material;
    const color = new THREE.Color(part.color);

    if (part.material === 'Neon' || part.behavior === 'kill') {
      mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 1.25,
        roughness: 0.1,
        metalness: 0.1,
      });
    } else if (part.material === 'Glass') {
      mat = new THREE.MeshPhysicalMaterial({
        color: color,
        transparent: true,
        opacity: part.transparency > 0 ? 1 - part.transparency : 0.65,
        roughness: 0.1,
        metalness: 0.1,
        clearcoat: 1.0,
      });
    } else if (part.material === 'Forcefield') {
      mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: color,
        emissiveIntensity: 0.9,
        transparent: true,
        opacity: 0.7,
        wireframe: true,
      });
    } else {
      const isSpawn = part.behavior === 'checkpoint' && part.behaviorParam === 1;
      const isConveyor = part.behavior === 'conveyor';

      let tex: THREE.Texture | null = null;
      if (isSpawn) {
        tex = getSpawnPadTexture();
      } else if (isConveyor) {
        tex = getConveyorTexture();
      } else if (part.material === 'Plastic') {
        tex = getStudsTexture(part.color);
      }

      mat = new THREE.MeshStandardMaterial({
        color: color,
        map: tex,
        roughness: part.material === 'SmoothPlastic' ? 0.25 : 0.6,
        metalness: part.reflectance || 0.1,
        transparent: part.transparency > 0,
        opacity: 1 - part.transparency,
      });
    }

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(part.position[0], part.position[1], part.position[2]);
    mesh.rotation.set(
      THREE.MathUtils.degToRad(part.rotation[0]),
      THREE.MathUtils.degToRad(part.rotation[1]),
      THREE.MathUtils.degToRad(part.rotation[2])
    );
    mesh.castShadow = !this.isSoftwareGl && part.transparency < 0.5;
    mesh.receiveShadow = !this.isSoftwareGl;
    mesh.userData = { partId: part.id, partData: part };

    // Nice Visual Add-ons for Obby Blocks
    if (part.behavior === 'kill') {
      // Radiant white-hot laser beam border
      const wireGeo = new THREE.EdgesGeometry(geo);
      const wireMat = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
      const wire = new THREE.LineSegments(wireGeo, wireMat);
      mesh.add(wire);
    } else if (part.behavior === 'checkpoint') {
      // Floating glowing stage diamond marker
      const haloGeo = new THREE.OctahedronGeometry(0.65, 0);
      const haloMat = new THREE.MeshStandardMaterial({
        color: 0x22c55e,
        emissive: 0x22c55e,
        emissiveIntensity: 1.5,
        metalness: 0.8,
        roughness: 0.2,
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      halo.position.set(0, 2.2, 0);
      halo.name = 'checkpoint_halo';
      mesh.add(halo);
    } else if (part.behavior === 'trampoline') {
      // Glowing cyan super-bounce ring on top
      const ringGeo = new THREE.TorusGeometry(part.size[0] / 2 * 0.9, 0.1, 8, 24);
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 1.5,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = part.size[1] / 2 + 0.02;
      mesh.add(ringMesh);
    }

    this.scene.add(mesh);
    this.partMeshes.set(part.id, mesh);

    return mesh;
  }

  private createWedgeGeometry(w: number, h: number, d: number): THREE.BufferGeometry {
    const geo = new THREE.BufferGeometry();
    const hw = w / 2;
    const hh = h / 2;
    const hd = d / 2;

    const vertices = new Float32Array([
      -hw, -hh, -hd,   hw, -hh, -hd,   hw, -hh,  hd,
      -hw, -hh, -hd,   hw, -hh,  hd,  -hw, -hh,  hd,
      -hw, -hh, -hd,  -hw,  hh, -hd,   hw,  hh, -hd,
      -hw, -hh, -hd,   hw,  hh, -hd,   hw, -hh, -hd,
      -hw, -hh,  hd,   hw, -hh,  hd,   hw,  hh, -hd,
      -hw, -hh,  hd,   hw,  hh, -hd,  -hw,  hh, -hd,
      -hw, -hh, -hd,  -hw, -hh,  hd,  -hw,  hh, -hd,
       hw, -hh, -hd,   hw,  hh, -hd,   hw, -hh,  hd,
    ]);

    geo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    geo.computeVertexNormals();
    return geo;
  }

  // --- UNDO / REDO COMMAND HISTORY ---
  private notifyHistoryChange() {
    this.callbacks.onHistoryChange(this.undoStack.length > 0, this.redoStack.length > 0);
  }

  public undo() {
    if (this.undoStack.length === 0) return;
    const cmd = this.undoStack.pop()!;

    if (cmd.type === 'add') {
      // Revert adding: delete the part
      this.executeDeletePart(cmd.partId);
      this.redoStack.push(cmd);
    } else if (cmd.type === 'delete') {
      // Revert deletion: restore part
      if (cmd.beforeData) {
        this.currentPlace.parts.push(cmd.beforeData);
        this.createPartMesh(cmd.beforeData);
        this.selectPart(cmd.beforeData.id);
        this.redoStack.push(cmd);
      }
    } else if (cmd.type === 'modify') {
      // Revert modification: restore beforeData
      if (cmd.beforeData) {
        this.executeUpdatePart(cmd.partId, cmd.beforeData);
        this.redoStack.push(cmd);
      }
    }

    sounds.playUndo();
    this.notifyHistoryChange();
    this.callbacks.onPartsModified(this.currentPlace.parts);
  }

  public redo() {
    if (this.redoStack.length === 0) return;
    const cmd = this.redoStack.pop()!;

    if (cmd.type === 'add') {
      if (cmd.afterData) {
        this.currentPlace.parts.push(cmd.afterData);
        this.createPartMesh(cmd.afterData);
        this.selectPart(cmd.afterData.id);
        this.undoStack.push(cmd);
      }
    } else if (cmd.type === 'delete') {
      this.executeDeletePart(cmd.partId);
      this.undoStack.push(cmd);
    } else if (cmd.type === 'modify') {
      if (cmd.afterData) {
        this.executeUpdatePart(cmd.partId, cmd.afterData);
        this.undoStack.push(cmd);
      }
    }

    sounds.playRedo();
    this.notifyHistoryChange();
    this.callbacks.onPartsModified(this.currentPlace.parts);
  }

  // --- STUDIO EDITING METHODS WITH HISTORY ---
  public addPart(shape: PartShape, behavior: PartBehavior = 'none', customProps: Partial<PartData> = {}): PartData {
    const id = 'part_' + Math.random().toString(36).substring(2, 9);
    
    let spawnPos: [number, number, number] = [0, 2, 0];
    if (this.gameState === 'studio') {
      spawnPos = [
        Math.round(this.studioCamTarget.x),
        Math.max(1, Math.round(this.studioCamTarget.y)),
        Math.round(this.studioCamTarget.z)
      ];
    } else {
      spawnPos = [
        Math.round(this.character.root.position.x),
        Math.round(this.character.root.position.y + 1),
        Math.round(this.character.root.position.z - 4)
      ];
    }

    const newPart: PartData = {
      id,
      name: `${shape.charAt(0).toUpperCase() + shape.slice(1)} ${this.currentPlace.parts.length + 1}`,
      shape,
      position: spawnPos,
      size: [3, 1, 3],
      rotation: [0, 0, 0],
      color: behavior === 'kill' ? '#ff0033' : behavior === 'checkpoint' ? '#22c55e' : '#3b82f6',
      material: behavior === 'kill' || behavior === 'checkpoint' ? 'Neon' : 'Plastic',
      transparency: 0,
      reflectance: 0.1,
      canCollide: behavior !== 'kill' && behavior !== 'coin',
      anchored: true,
      behavior,
      ...customProps,
    };

    this.currentPlace.parts.push(newPart);
    this.createPartMesh(newPart);
    this.selectPart(id);

    // Record undo
    this.undoStack.push({
      type: 'add',
      partId: id,
      afterData: JSON.parse(JSON.stringify(newPart)),
    });
    this.redoStack = [];
    this.notifyHistoryChange();

    this.callbacks.onPartsModified(this.currentPlace.parts);
    sounds.playStudioSnap();
    return newPart;
  }

  public updatePart(partId: string, updates: Partial<PartData>) {
    const part = this.currentPlace.parts.find(p => p.id === partId);
    if (!part) return;

    const beforeData = JSON.parse(JSON.stringify(part));
    this.executeUpdatePart(partId, updates);
    const afterData = JSON.parse(JSON.stringify(part));

    // Record undo
    this.undoStack.push({
      type: 'modify',
      partId,
      beforeData,
      afterData,
    });
    this.redoStack = [];
    this.notifyHistoryChange();

    this.callbacks.onPartsModified(this.currentPlace.parts);
  }

  private executeUpdatePart(partId: string, updates: Partial<PartData>) {
    const part = this.currentPlace.parts.find(p => p.id === partId);
    if (!part) return;

    Object.assign(part, updates);

    const oldMesh = this.partMeshes.get(partId);
    if (oldMesh) {
      this.scene.remove(oldMesh);
      oldMesh.geometry.dispose();
      if (Array.isArray(oldMesh.material)) {
        oldMesh.material.forEach(m => m.dispose());
      } else {
        oldMesh.material.dispose();
      }
      this.partMeshes.delete(partId);
    }

    const newMesh = this.createPartMesh(part);
    if (this.selectedPartId === partId) {
      this.selectedMesh = newMesh;
      if (this.selectionBox) {
        this.selectionBox.setFromObject(newMesh);
        this.selectionBox.visible = true;
      }
    }
  }

  public deletePart(partId: string) {
    const part = this.currentPlace.parts.find(p => p.id === partId);
    if (!part) return;

    const beforeData = JSON.parse(JSON.stringify(part));
    this.executeDeletePart(partId);

    // Record undo
    this.undoStack.push({
      type: 'delete',
      partId,
      beforeData,
    });
    this.redoStack = [];
    this.notifyHistoryChange();

    sounds.playStudioDelete();
    this.callbacks.onPartsModified(this.currentPlace.parts);
  }

  private executeDeletePart(partId: string) {
    const index = this.currentPlace.parts.findIndex(p => p.id === partId);
    if (index === -1) return;

    this.currentPlace.parts.splice(index, 1);
    const mesh = this.partMeshes.get(partId);
    if (mesh) {
      this.scene.remove(mesh);
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
      this.partMeshes.delete(partId);
    }

    if (this.selectedPartId === partId) {
      this.selectPart(null);
    }
  }

  public duplicateSelectedPart() {
    if (!this.selectedPartId) return;
    const part = this.currentPlace.parts.find(p => p.id === this.selectedPartId);
    if (!part) return;

    const cloned: PartData = JSON.parse(JSON.stringify(part));
    cloned.id = 'part_' + Math.random().toString(36).substring(2, 9);
    cloned.name = part.name + ' (Copy)';
    cloned.position[0] += 2;
    cloned.position[2] += 2;

    this.currentPlace.parts.push(cloned);
    this.createPartMesh(cloned);
    this.selectPart(cloned.id);

    this.undoStack.push({
      type: 'add',
      partId: cloned.id,
      afterData: JSON.parse(JSON.stringify(cloned)),
    });
    this.redoStack = [];
    this.notifyHistoryChange();

    this.callbacks.onPartsModified(this.currentPlace.parts);
    sounds.playStudioSnap();
  }

  public selectPart(partId: string | null) {
    this.selectedPartId = partId;
    if (!partId) {
      this.selectedMesh = null;
      if (this.selectionBox) this.selectionBox.visible = false;
      this.callbacks.onSelectPart(null);
      return;
    }

    const mesh = this.partMeshes.get(partId);
    const partData = this.currentPlace.parts.find(p => p.id === partId);
    if (mesh && partData) {
      this.selectedMesh = mesh;
      if (this.selectionBox) {
        this.selectionBox.setFromObject(mesh);
        this.selectionBox.visible = true;
      }
      this.callbacks.onSelectPart(partData);
    }
  }

  // --- SHIFT LOCK ---
  public toggleShiftLock(): boolean {
    this.isShiftLockActive = !this.isShiftLockActive;
    sounds.playStudioSnap();
    return this.isShiftLockActive;
  }

  // --- ADMIN COMMANDS ---
  public setGodMode(enabled: boolean) {
    this.stats.godMode = enabled;
    this.callbacks.onStatsUpdate({ ...this.stats });
    sounds.playCheckpoint();
  }

  public setFlyMode(enabled: boolean) {
    this.stats.flyMode = enabled;
    this.callbacks.onStatsUpdate({ ...this.stats });
    sounds.playCheckpoint();
  }

  public setInfiniteJump(enabled: boolean) {
    this.stats.infiniteJump = enabled;
    this.callbacks.onStatsUpdate({ ...this.stats });
    sounds.playCheckpoint();
  }

  public setSpeedMultiplier(mult: number) {
    this.stats.speedMultiplier = mult;
    this.callbacks.onStatsUpdate({ ...this.stats });
    sounds.playSpeedBoost();
  }

  public addRobux(amount: number) {
    this.stats.coins += amount;
    this.callbacks.onStatsUpdate({ ...this.stats });
    sounds.playBigRobux();
  }

  public teleportToStage(stageNum: number) {
    // Find checkpoint part for stageNum
    const checkPart = this.currentPlace.parts.find(
      p => p.behavior === 'checkpoint' && p.behaviorParam === stageNum
    );

    if (checkPart) {
      this.currentCheckpoint = [checkPart.position[0], checkPart.position[1] + 1.5, checkPart.position[2]];
      this.character.root.position.set(this.currentCheckpoint[0], this.currentCheckpoint[1], this.currentCheckpoint[2]);
      this.playerVelocity.set(0, 0, 0);
      this.stats.stage = stageNum;
      this.stats.difficulty = getDifficultyForStage(stageNum);
      this.particleSystem.emitSparkles(this.character.root.position, 50, '#38bdf8');
      sounds.playAdminWarp();
      this.callbacks.onStatsUpdate({ ...this.stats });
    }
  }

  public setWeatherEvent(event: WeatherEvent) {
    this.weatherSystem.setWeather(event);
    sounds.playCheckpoint();
  }

  public setSkyTheme(theme: SkyTheme) {
    this.weatherSystem.setSkyTheme(theme);
    sounds.playStudioSnap();
  }

  // --- INPUT HANDLING ---
  private initInputs() {
    window.addEventListener('keydown', (e) => {
      this.keysHeld[e.code] = true;

      // Ctrl+Z Undo & Ctrl+Y Redo
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyZ') {
        e.preventDefault();
        if (e.shiftKey) {
          this.redo();
        } else {
          this.undo();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.code === 'KeyY') {
        e.preventDefault();
        this.redo();
      }

      // Shift Lock toggle via Left Shift (when in playing mode)
      if (e.code === 'ShiftLeft' && this.gameState === 'playing') {
        // Toggle Shift Lock
        this.toggleShiftLock();
      }

      if (e.code === 'KeyF' && this.gameState === 'studio' && this.selectedMesh) {
        this.studioCamTarget.copy(this.selectedMesh.position);
      }
      if (e.code === 'KeyD' && (e.ctrlKey || e.metaKey) && this.gameState === 'studio') {
        e.preventDefault();
        this.duplicateSelectedPart();
      }
      if (e.code === 'Delete' || e.code === 'Backspace') {
        if (this.gameState === 'studio' && this.selectedPartId) {
          const tag = (document.activeElement?.tagName || '').toLowerCase();
          if (tag !== 'input' && tag !== 'textarea') {
            e.preventDefault();
            this.deletePart(this.selectedPartId);
          }
        }
      }
      if (e.code === 'KeyR' && this.gameState === 'playing') {
        this.triggerDeath();
      }
      if (e.code === 'KeyM') {
        sounds.toggleBgm();
      }
      if (e.code === 'Space') {
        this.jumpBufferTimer = 0.2;
        if (this.stats.infiniteJump && this.gameState === 'playing') {
          this.playerVelocity.y = 16.0;
          sounds.playJump();
        }
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keysHeld[e.code] = false;
    });

    window.addEventListener('blur', () => {
      this.keysHeld = {};
    });

    const dom = this.renderer.domElement;

    dom.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = true;
        this.mousePrevX = e.clientX;
        this.mousePrevY = e.clientY;
      } else if (e.button === 0 && this.gameState === 'studio') {
        const rect = dom.getBoundingClientRect();
        this.mousePos.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mousePos.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mousePos, this.camera);
        const meshes = Array.from(this.partMeshes.values());
        const intersects = this.raycaster.intersectObjects(meshes, false);

        if (intersects.length > 0) {
          const hit = intersects[0].object as THREE.Mesh;
          const partId = hit.userData.partId;
          this.selectPart(partId);
          sounds.playStudioSnap();
        } else {
          this.selectPart(null);
        }
      }
    });

    window.addEventListener('mousemove', (e) => {
      // In Shift Lock mode, moving mouse rotates camera even without right-clicking!
      if (this.isShiftLockActive && this.gameState === 'playing') {
        const dx = e.movementX || (e.clientX - this.mousePrevX);
        const dy = e.movementY || (e.clientY - this.mousePrevY);
        this.mousePrevX = e.clientX;
        this.mousePrevY = e.clientY;

        this.cameraYaw -= dx * 0.004;
        this.cameraPitch = Math.max(-0.2, Math.min(1.4, this.cameraPitch + dy * 0.004));
      } else if (this.isRightMouseDown) {
        const dx = e.clientX - this.mousePrevX;
        const dy = e.clientY - this.mousePrevY;
        this.mousePrevX = e.clientX;
        this.mousePrevY = e.clientY;

        this.cameraYaw -= dx * 0.006;
        this.cameraPitch = Math.max(-0.2, Math.min(1.4, this.cameraPitch + dy * 0.006));
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) {
        this.isRightMouseDown = false;
      }
    });

    dom.addEventListener('contextmenu', (e) => e.preventDefault());

    dom.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.targetCameraDistance = Math.max(2, Math.min(30, this.targetCameraDistance + e.deltaY * 0.015));
    }, { passive: false });

    window.addEventListener('resize', () => {
      if (!this.container || !this.renderer) return;
      const w = this.container.clientWidth;
      const h = this.container.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    });
  }

  public setVirtualMovement(x: number, z: number) {
    this._moveVec.set(x, 0, z);
  }

  public triggerJump() {
    this.jumpBufferTimer = 0.2;
    if (this.stats.infiniteJump && this.gameState === 'playing') {
      this.playerVelocity.y = 16.0;
      sounds.playJump();
    }
  }

  // --- GAME STATE TRANSITIONS ---
  public setGameState(newState: GameState) {
    this.gameState = newState;
    if (newState === 'playing') {
      this.character.root.visible = !this.character.isDead;
      if (this.selectionBox) this.selectionBox.visible = false;
    } else if (newState === 'studio') {
      this.isShiftLockActive = false;
      this.studioCamPos.set(this.character.root.position.x, this.character.root.position.y + 12, this.character.root.position.z + 18);
      this.studioCamTarget.copy(this.character.root.position);
    }
    this.callbacks.onStateChange(newState);
  }

  public triggerDeath() {
    if (this.character.isDead) return;
    if (this.stats.godMode) {
      // In God mode, don't die!
      this.playerVelocity.y = 15;
      return;
    }

    sounds.playOof();
    this.particleSystem.emitLavaDeath(this.character.root.position);
    this.character.triggerDeathRagdoll(this.scene);
    this.screenShake = 1.0;
    this.respawnTimer = 1.4;

    this.stats.deaths++;
    this.stats.health = 0;
    this.callbacks.onStatsUpdate({ ...this.stats });
  }

  // --- CORE GAME LOOP ---
  private startLoop() {
    const tick = () => {
      const rawDt = this.clock.getDelta();
      const dt = Math.min(rawDt, 0.05);

      this.update(dt);
      this.render();

      this.animationFrameId = requestAnimationFrame(tick);
    };

    this.animationFrameId = requestAnimationFrame(tick);
  }

  private update(dt: number) {
    this.particleSystem.update(dt);
    this.weatherSystem.update(dt, this.character.root.position.z);

    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 2.5);
    }

    if (this.gameState === 'studio' && this.selectedMesh && this.selectionBox) {
      this.selectionBox.setFromObject(this.selectedMesh);
    }

    if (this.gameState === 'title') {
      this.updateTitleMode(dt);
      return;
    }

    if (this.gameState === 'studio') {
      this.updateStudioMode(dt);
      this.updateDynamicBlocks(dt);
      return;
    }

    if (this.gameState === 'playing') {
      this.updatePlayingMode(dt);
      this.updateDynamicBlocks(dt);
      return;
    }
  }

  private updateTitleMode(dt: number) {
    this.titleOrbitAngle += dt * 0.25;
    const radius = 28;
    const focusY = 8;
    this.camera.position.set(
      Math.sin(this.titleOrbitAngle) * radius,
      14 + Math.sin(this.titleOrbitAngle * 0.5) * 4,
      Math.cos(this.titleOrbitAngle) * radius - 20
    );
    this.camera.lookAt(0, focusY, -20);
    this.character.updateAnimation(dt, false, true, 0);
  }

  private updateStudioMode(dt: number) {
    const flySpeed = (this.keysHeld['ShiftLeft'] || this.keysHeld['ShiftRight'] ? 35 : 18) * dt;

    this._camForward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
    this._camRight.set(1, 0, 0).applyQuaternion(this.camera.quaternion);

    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) {
      this.studioCamPos.addScaledVector(this._camForward, flySpeed);
      this.studioCamTarget.addScaledVector(this._camForward, flySpeed);
    }
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) {
      this.studioCamPos.addScaledVector(this._camForward, -flySpeed);
      this.studioCamTarget.addScaledVector(this._camForward, -flySpeed);
    }
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) {
      this.studioCamPos.addScaledVector(this._camRight, -flySpeed);
      this.studioCamTarget.addScaledVector(this._camRight, -flySpeed);
    }
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) {
      this.studioCamPos.addScaledVector(this._camRight, flySpeed);
      this.studioCamTarget.addScaledVector(this._camRight, flySpeed);
    }
    if (this.keysHeld['KeyE']) {
      this.studioCamPos.y += flySpeed;
      this.studioCamTarget.y += flySpeed;
    }
    if (this.keysHeld['KeyQ']) {
      this.studioCamPos.y -= flySpeed;
      this.studioCamTarget.y -= flySpeed;
    }

    this.camera.position.copy(this.studioCamPos);
    this.camera.lookAt(this.studioCamTarget);
  }

  private updatePlayingMode(dt: number) {
    this.stats.elapsedSeconds += dt;

    if (this.character.isDead) {
      this.respawnTimer -= dt;

      this.character.debrisPieces.forEach((piece) => {
        piece.velocity.y -= 25 * dt;
        piece.mesh.position.addScaledVector(piece.velocity, dt);
        piece.mesh.rotation.x += piece.angularVelocity.x * dt;
        piece.mesh.rotation.y += piece.angularVelocity.y * dt;
        piece.mesh.rotation.z += piece.angularVelocity.z * dt;

        if (piece.mesh.position.y < -0.2) {
          piece.mesh.position.y = -0.2;
          piece.velocity.y = -piece.velocity.y * 0.4;
          piece.velocity.x *= 0.8;
          piece.velocity.z *= 0.8;
        }
      });

      if (this.respawnTimer <= 0) {
        this.character.respawn(this.currentCheckpoint, this.scene);
        this.playerVelocity.set(0, 0, 0);
        this.stats.health = 100;
        this.callbacks.onStatsUpdate({ ...this.stats });
      }
      this.updateCameraFollow(dt);
      return;
    }

    // Cooldown timers
    if (this.coyoteTimer > 0) this.coyoteTimer -= dt;
    if (this.jumpBufferTimer > 0) this.jumpBufferTimer -= dt;
    if (this.speedBoostTimer > 0) this.speedBoostTimer -= dt;

    // FLY MODE (Admin)
    if (this.stats.flyMode) {
      const flySpeed = 24.0 * dt * (this.stats.speedMultiplier || 1.0);
      this._camForward.set(0, 0, -1).applyQuaternion(this.camera.quaternion);
      this._camRight.set(1, 0, 0).applyQuaternion(this.camera.quaternion);

      if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) this.character.root.position.addScaledVector(this._camForward, flySpeed);
      if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) this.character.root.position.addScaledVector(this._camForward, -flySpeed);
      if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) this.character.root.position.addScaledVector(this._camRight, -flySpeed);
      if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) this.character.root.position.addScaledVector(this._camRight, flySpeed);
      if (this.keysHeld['Space']) this.character.root.position.y += flySpeed;
      if (this.keysHeld['KeyC'] || this.keysHeld['ShiftRight']) this.character.root.position.y -= flySpeed;

      this.updateCameraFollow(dt);
      return;
    }

    // Movement calculation
    let moveX = 0;
    let moveZ = 0;

    if (this.keysHeld['KeyW'] || this.keysHeld['ArrowUp']) moveZ -= 1;
    if (this.keysHeld['KeyS'] || this.keysHeld['ArrowDown']) moveZ += 1;
    if (this.keysHeld['KeyA'] || this.keysHeld['ArrowLeft']) moveX -= 1;
    if (this.keysHeld['KeyD'] || this.keysHeld['ArrowRight']) moveX += 1;

    if (this._moveVec.lengthSq() > 0.01) {
      moveX = this._moveVec.x;
      moveZ = this._moveVec.z;
    }

    const inputLength = Math.hypot(moveX, moveZ);
    const isMoving = inputLength > 0.1;

    // Speed modifiers
    const isSprint = this.keysHeld['ShiftLeft'] || this.keysHeld['ShiftRight'];
    let moveSpeed = 9.0;
    if (isSprint && !this.isShiftLockActive) moveSpeed = 14.0;
    if (this.stats.hasSpeedCoil) moveSpeed *= 1.8;
    if (this.speedBoostTimer > 0) moveSpeed *= 2.2;
    if (this.weatherSystem.weather === 'speed_rush') moveSpeed *= 2.5;
    if (this.stats.speedMultiplier) moveSpeed *= this.stats.speedMultiplier;

    // Direction relative to camera yaw
    if (isMoving) {
      const angle = Math.atan2(moveX, moveZ) + this.cameraYaw;
      const targetVelX = Math.sin(angle) * moveSpeed;
      const targetVelZ = Math.cos(angle) * moveSpeed;

      // In Rain Storm, lower friction -> slippery sliding mechanics!
      const isRainSlippery = this.weatherSystem.weather === 'rain_slippery';
      const accel = isRainSlippery ? 4 : (this.isGrounded ? 22 : 8);

      this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, targetVelX, accel, dt);
      this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, targetVelZ, accel, dt);

      // In Shift Lock, avatar faces camera forward directly; otherwise faces travel direction
      if (this.isShiftLockActive) {
        this.character.root.rotation.y = THREE.MathUtils.damp(this.character.root.rotation.y, this.cameraYaw + Math.PI, 24, dt);
      } else {
        const currentRotY = this.character.root.rotation.y;
        this.character.root.rotation.y = THREE.MathUtils.damp(currentRotY, angle + Math.PI, 18, dt);
      }
    } else {
      const isRainSlippery = this.weatherSystem.weather === 'rain_slippery';
      const friction = isRainSlippery ? 1.5 : (this.isGrounded ? 24 : 3);
      this.playerVelocity.x = THREE.MathUtils.damp(this.playerVelocity.x, 0, friction, dt);
      this.playerVelocity.z = THREE.MathUtils.damp(this.playerVelocity.z, 0, friction, dt);

      if (this.isShiftLockActive) {
        this.character.root.rotation.y = THREE.MathUtils.damp(this.character.root.rotation.y, this.cameraYaw + Math.PI, 24, dt);
      }
    }

    // Jump Physics
    const canJump = this.isGrounded || this.coyoteTimer > 0 || this.stats.infiniteJump;
    if (this.jumpBufferTimer > 0 && canJump) {
      let jumpPower = 15.0;
      if (this.stats.hasGravityCoil) jumpPower = 25.5;
      if (this.weatherSystem.weather === 'low_gravity') jumpPower = 26.0;
      this.playerVelocity.y = jumpPower;
      this.isGrounded = false;
      this.coyoteTimer = 0;
      this.jumpBufferTimer = 0;
      sounds.playJump();
      this.particleSystem.emitJumpPuff(this.character.root.position);
    }

    // Gravity calculation
    let gravity = this.stats.hasGravityCoil ? -16 : -this.currentPlace.gravity;
    if (this.weatherSystem.weather === 'low_gravity') gravity = -10.0;
    this.playerVelocity.y += gravity * dt;

    this.handlePhysicsAndCollisions(dt);

    if (this.character.root.position.y < -22) {
      this.triggerDeath();
    }

    if (this.isGrounded && isMoving && Math.random() < dt * 4) {
      sounds.playStep();
    }

    const currentSpeed = Math.hypot(this.playerVelocity.x, this.playerVelocity.z);
    this.character.updateAnimation(dt, isMoving, this.isGrounded, currentSpeed);

    this.updateCameraFollow(dt);
  }

  private handlePhysicsAndCollisions(dt: number) {
    const charRoot = this.character.root;
    const playerRadius = 0.5;
    const playerHeight = 2.4;

    charRoot.position.x += this.playerVelocity.x * dt;
    this.resolveAxisCollision('x', playerRadius, playerHeight);

    charRoot.position.z += this.playerVelocity.z * dt;
    this.resolveAxisCollision('z', playerRadius, playerHeight);

    const wasGrounded = this.isGrounded;
    this.isGrounded = false;
    charRoot.position.y += this.playerVelocity.y * dt;

    this._playerBox.min.set(
      charRoot.position.x - playerRadius,
      charRoot.position.y,
      charRoot.position.z - playerRadius
    );
    this._playerBox.max.set(
      charRoot.position.x + playerRadius,
      charRoot.position.y + playerHeight,
      charRoot.position.z + playerRadius
    );

    for (const [partId, mesh] of this.partMeshes.entries()) {
      const part = mesh.userData.partData as PartData;
      
      const disState = this.disappearingTimers.get(partId);
      if (disState && disState.state === 'hidden') continue;

      this._partBox.setFromObject(mesh);

      if (this._playerBox.intersectsBox(this._partBox)) {
        this.handleBlockTrigger(part, mesh);

        if (!part.canCollide) continue;

        if (this.playerVelocity.y < 0 && charRoot.position.y >= this._partBox.max.y - 0.45) {
          charRoot.position.y = this._partBox.max.y;
          this.playerVelocity.y = 0;
          this.isGrounded = true;
          this.coyoteTimer = 0.15;

          if (!wasGrounded) {
            sounds.playLand();
          }

          if (part.behavior === 'disappearing' && (!disState || disState.state === 'idle')) {
            this.disappearingTimers.set(partId, { state: 'fading', timer: 0.6, origY: mesh.position.y });
          }

          if (part.behavior === 'conveyor') {
            const pushSpeed = (part.behaviorParam || 8.0);
            charRoot.position.z -= pushSpeed * dt;
          }
        } else if (this.playerVelocity.y > 0 && charRoot.position.y + playerHeight <= this._partBox.min.y + 0.45) {
          charRoot.position.y = this._partBox.min.y - playerHeight;
          this.playerVelocity.y = 0;
        }
      }
    }
  }

  private resolveAxisCollision(axis: 'x' | 'z', radius: number, height: number) {
    const charRoot = this.character.root;
    this._playerBox.min.set(
      charRoot.position.x - radius,
      charRoot.position.y + 0.1,
      charRoot.position.z - radius
    );
    this._playerBox.max.set(
      charRoot.position.x + radius,
      charRoot.position.y + height,
      charRoot.position.z + radius
    );

    for (const [partId, mesh] of this.partMeshes.entries()) {
      const part = mesh.userData.partData as PartData;
      if (!part.canCollide) continue;

      const disState = this.disappearingTimers.get(partId);
      if (disState && disState.state === 'hidden') continue;

      this._partBox.setFromObject(mesh);

      if (this._playerBox.intersectsBox(this._partBox)) {
        const stepDiff = this._partBox.max.y - charRoot.position.y;
        if (stepDiff > 0 && stepDiff <= 0.6 && this.isGrounded) {
          charRoot.position.y = this._partBox.max.y;
          continue;
        }

        if (axis === 'x') {
          if (this.playerVelocity.x > 0) {
            charRoot.position.x = this._partBox.min.x - radius;
          } else if (this.playerVelocity.x < 0) {
            charRoot.position.x = this._partBox.max.x + radius;
          }
          this.playerVelocity.x = 0;
        } else if (axis === 'z') {
          if (this.playerVelocity.z > 0) {
            charRoot.position.z = this._partBox.min.z - radius;
          } else if (this.playerVelocity.z < 0) {
            charRoot.position.z = this._partBox.max.z + radius;
          }
          this.playerVelocity.z = 0;
        }
      }
    }
  }

  private handleBlockTrigger(part: PartData, mesh: THREE.Mesh) {
    if (part.behavior === 'kill') {
      this.triggerDeath();
      return;
    }

    if (part.behavior === 'checkpoint') {
      const stageNum = part.behaviorParam || 1;
      if (stageNum > this.stats.stage) {
        const prevStage = this.stats.stage;
        this.stats.stage = stageNum;
        this.stats.difficulty = getDifficultyForStage(stageNum);
        this.currentCheckpoint = [part.position[0], part.position[1] + 1.5, part.position[2]];

        // Progressive Robux Reward!
        const earnedRobux = getRobuxRewardForStage(stageNum);
        this.stats.coins += earnedRobux;

        sounds.playStageComplete();
        this.particleSystem.emitSparkles(mesh.position, 45, '#22c55e');

        this.callbacks.onStatsUpdate({ ...this.stats });
        this.callbacks.onStageCleared(stageNum, earnedRobux, this.stats.difficulty);
      }
      return;
    }

    if (part.behavior === 'trampoline') {
      const bounceVel = part.behaviorParam || 22.0;
      this.playerVelocity.y = bounceVel;
      this.isGrounded = false;
      sounds.playBounce();
      this.particleSystem.emitSparkles(mesh.position, 25, '#06b6d4');
      return;
    }

    if (part.behavior === 'speed_boost') {
      this.speedBoostTimer = 2.5;
      sounds.playSpeedBoost();
      this.particleSystem.emitSparkles(mesh.position, 20, '#eab308');
      return;
    }

    if (part.behavior === 'speed_coil') {
      if (!this.stats.hasSpeedCoil) {
        this.stats.hasSpeedCoil = true;
        this.character.setCoil('speed');
        sounds.playCheckpoint();
        mesh.visible = false;
        this.particleSystem.emitSparkles(mesh.position, 35, '#06b6d4');
        this.callbacks.onStatsUpdate({ ...this.stats });
      }
      return;
    }

    if (part.behavior === 'gravity_coil') {
      if (!this.stats.hasGravityCoil) {
        this.stats.hasGravityCoil = true;
        this.character.setCoil('gravity');
        sounds.playCheckpoint();
        mesh.visible = false;
        this.particleSystem.emitSparkles(mesh.position, 35, '#a855f7');
        this.callbacks.onStatsUpdate({ ...this.stats });
      }
      return;
    }

    if (part.behavior === 'coin') {
      if (mesh.visible) {
        mesh.visible = false;
        this.stats.coins += 10;
        sounds.playCoin();
        this.particleSystem.emitSparkles(mesh.position, 30, '#fbbf24');
        this.callbacks.onStatsUpdate({ ...this.stats });
      }
      return;
    }

    if (part.behavior === 'win_door') {
      if (this.gameState === 'playing') {
        const grandBonus = 100;
        this.stats.coins += grandBonus;
        sounds.playVictory();
        this.particleSystem.emitConfetti(mesh.position);
        this.callbacks.onStatsUpdate({ ...this.stats });
        this.setGameState('victory');
      }
      return;
    }
  }

  private updateDynamicBlocks(dt: number) {
    for (const [, mesh] of this.partMeshes.entries()) {
      const part = mesh.userData.partData as PartData;

      if (part.behavior === 'spinner') {
        const speed = part.behaviorParam || 1.8;
        mesh.rotation.y += speed * dt;
      } else if (part.behavior === 'coin' && mesh.visible) {
        mesh.rotation.z += 3.0 * dt;
        mesh.position.y = part.position[1] + Math.sin(this.stats.elapsedSeconds * 4) * 0.15;
      } else if (part.behavior === 'checkpoint') {
        const halo = mesh.getObjectByName('checkpoint_halo');
        if (halo) {
          halo.rotation.y += 2.2 * dt;
          halo.rotation.z += 1.1 * dt;
          halo.position.y = 2.2 + Math.sin(this.stats.elapsedSeconds * 3.5) * 0.25;
        }
      } else if (part.behavior === 'conveyor') {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat && mat.map) {
          mat.map.offset.y -= (part.behaviorParam || 8.0) * dt * 0.15;
        }
      } else if (part.behavior === 'kill') {
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.emissiveIntensity = 1.35 + Math.sin(this.stats.elapsedSeconds * 6) * 0.35;
        }
      }
    }

    for (const [partId, state] of this.disappearingTimers.entries()) {
      const mesh = this.partMeshes.get(partId);
      if (!mesh) continue;

      if (state.state === 'fading') {
        state.timer -= dt;
        mesh.position.x = mesh.userData.partData.position[0] + (Math.random() - 0.5) * 0.15;
        (mesh.material as THREE.Material).opacity = Math.max(0, state.timer / 0.6);

        if (state.timer <= 0) {
          state.state = 'hidden';
          state.timer = 2.8;
          mesh.visible = false;
        }
      } else if (state.state === 'hidden') {
        state.timer -= dt;
        if (state.timer <= 0) {
          state.state = 'idle';
          mesh.visible = true;
          mesh.position.x = mesh.userData.partData.position[0];
          (mesh.material as THREE.Material).opacity = 1 - (mesh.userData.partData.transparency || 0);
          sounds.playStudioSnap();
        }
      }
    }
  }

  private updateCameraFollow(dt: number) {
    this.cameraDistance = THREE.MathUtils.damp(this.cameraDistance, this.targetCameraDistance, 12, dt);

    const charPos = this.character.root.position;
    const targetLookAt = new THREE.Vector3(charPos.x, charPos.y + 1.8, charPos.z);

    // In Shift Lock mode, slightly offset camera over the right shoulder (classic Roblox Shift Lock camera!)
    if (this.isShiftLockActive) {
      const rightX = Math.cos(this.cameraYaw) * 1.4;
      const rightZ = -Math.sin(this.cameraYaw) * 1.4;
      targetLookAt.x += rightX;
      targetLookAt.z += rightZ;
    }

    const camX = targetLookAt.x + Math.sin(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;
    const camY = targetLookAt.y + Math.sin(this.cameraPitch) * this.cameraDistance;
    const camZ = targetLookAt.z + Math.cos(this.cameraYaw) * Math.cos(this.cameraPitch) * this.cameraDistance;

    let shakeX = 0;
    let shakeY = 0;
    if (this.screenShake > 0) {
      shakeX = (Math.random() - 0.5) * this.screenShake * 0.6;
      shakeY = (Math.random() - 0.5) * this.screenShake * 0.6;
    }

    this.camera.position.set(camX + shakeX, camY + shakeY, camZ);
    this.camera.lookAt(targetLookAt);
  }

  private render() {
    this.renderer.render(this.scene, this.camera);
  }

  public dispose() {
    cancelAnimationFrame(this.animationFrameId);
    sounds.stopBgm();

    this.partMeshes.forEach((mesh) => {
      mesh.geometry.dispose();
      if (Array.isArray(mesh.material)) {
        mesh.material.forEach(m => m.dispose());
      } else {
        mesh.material.dispose();
      }
    });

    this.particleSystem.dispose(this.scene);
    this.weatherSystem.dispose();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
