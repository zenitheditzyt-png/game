import * as THREE from 'three';
import { AvatarConfig, DEFAULT_AVATAR } from '../types/game';
import { getFaceTexture, getStudsTexture } from './proceduralTextures';

export interface DebrisPiece {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  angularVelocity: THREE.Vector3;
}

export class RobloxCharacter {
  public root: THREE.Group;
  public headMesh!: THREE.Mesh;
  public torsoMesh!: THREE.Mesh;
  public leftArmGroup!: THREE.Group;
  public rightArmGroup!: THREE.Group;
  public leftLegGroup!: THREE.Group;
  public rightLegGroup!: THREE.Group;
  public leftArmMesh!: THREE.Mesh;
  public rightArmMesh!: THREE.Mesh;
  public leftLegMesh!: THREE.Mesh;
  public rightLegMesh!: THREE.Mesh;
  public hatGroup!: THREE.Group;
  public coilMesh: THREE.Group | null = null;

  public config: AvatarConfig;
  public isDead: boolean = false;
  public debrisPieces: DebrisPiece[] = [];

  private walkCycle: number = 0;
  private currentFaceType: string = 'smile';

  constructor(config: AvatarConfig = DEFAULT_AVATAR) {
    this.config = { ...config };
    this.root = new THREE.Group();
    this.buildCharacter();
  }

  private buildCharacter() {
    // Clear root
    while (this.root.children.length > 0) {
      this.root.remove(this.root.children[0]);
    }

    const scale = 0.5; // Scale down to reasonable Three.js units (approx 2.5m tall)

    // Materials
    const headMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.headColor),
      roughness: 0.4,
      metalness: 0.1,
    });

    const torsoMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.torsoColor),
      roughness: 0.5,
      metalness: 0.1,
    });

    const leftArmMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.leftArmColor),
      roughness: 0.4,
      metalness: 0.1,
    });

    const rightArmMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.rightArmColor),
      roughness: 0.4,
      metalness: 0.1,
    });

    const leftLegMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.leftLegColor),
      roughness: 0.5,
      metalness: 0.1,
    });

    const rightLegMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(this.config.rightLegColor),
      roughness: 0.5,
      metalness: 0.1,
    });

    // 1. Torso: 2.0 wide, 2.0 high, 1.0 deep (scaled by 0.5)
    const torsoGeo = new THREE.BoxGeometry(2.0 * scale, 2.0 * scale, 1.0 * scale);
    this.torsoMesh = new THREE.Mesh(torsoGeo, torsoMat);
    this.torsoMesh.position.set(0, 2.0 * scale, 0);
    this.torsoMesh.castShadow = true;
    this.torsoMesh.receiveShadow = true;
    this.root.add(this.torsoMesh);

    // 2. Head: 1.25 x 1.25 x 1.25
    // Roblox head has cylinder-ish beveled shape or classic block with rounded edges
    const headGeo = new THREE.CylinderGeometry(0.7 * scale, 0.7 * scale, 1.25 * scale, 16);
    
    // Multi-material for head: side has face decal on front
    const faceTex = getFaceTexture(this.config.faceType);
    this.currentFaceType = this.config.faceType;
    
    // Front face plane attached to head
    this.headMesh = new THREE.Mesh(headGeo, headMat);
    this.headMesh.position.set(0, 1.65 * scale, 0);
    this.headMesh.castShadow = true;
    this.torsoMesh.add(this.headMesh);

    // Face Decal plane
    const facePlaneGeo = new THREE.PlaneGeometry(1.0 * scale, 1.0 * scale);
    const facePlaneMat = new THREE.MeshBasicMaterial({
      map: faceTex,
      transparent: true,
      depthWrite: false,
    });
    const facePlane = new THREE.Mesh(facePlaneGeo, facePlaneMat);
    facePlane.position.set(0, 0, 0.71 * scale);
    this.headMesh.add(facePlane);

    // Head top stud
    const studGeo = new THREE.CylinderGeometry(0.3 * scale, 0.3 * scale, 0.25 * scale, 12);
    const studMesh = new THREE.Mesh(studGeo, headMat);
    studMesh.position.set(0, 0.65 * scale, 0);
    this.headMesh.add(studMesh);

    // 3. Left Arm (Group for shoulder pivot)
    this.leftArmGroup = new THREE.Group();
    this.leftArmGroup.position.set(1.5 * scale, 0.85 * scale, 0); // Shoulder socket
    this.torsoMesh.add(this.leftArmGroup);

    const armGeo = new THREE.BoxGeometry(1.0 * scale, 2.0 * scale, 1.0 * scale);
    this.leftArmMesh = new THREE.Mesh(armGeo, leftArmMat);
    this.leftArmMesh.position.set(0, -0.85 * scale, 0); // Center relative to pivot
    this.leftArmMesh.castShadow = true;
    this.leftArmGroup.add(this.leftArmMesh);

    // 4. Right Arm (Group for shoulder pivot)
    this.rightArmGroup = new THREE.Group();
    this.rightArmGroup.position.set(-1.5 * scale, 0.85 * scale, 0);
    this.torsoMesh.add(this.rightArmGroup);

    this.rightArmMesh = new THREE.Mesh(armGeo, rightArmMat);
    this.rightArmMesh.position.set(0, -0.85 * scale, 0);
    this.rightArmMesh.castShadow = true;
    this.rightArmGroup.add(this.rightArmMesh);

    // 5. Left Leg (Group for hip pivot)
    this.leftLegGroup = new THREE.Group();
    this.leftLegGroup.position.set(0.5 * scale, -1.0 * scale, 0);
    this.torsoMesh.add(this.leftLegGroup);

    const legGeo = new THREE.BoxGeometry(1.0 * scale, 2.0 * scale, 1.0 * scale);
    this.leftLegMesh = new THREE.Mesh(legGeo, leftLegMat);
    this.leftLegMesh.position.set(0, -1.0 * scale, 0);
    this.leftLegMesh.castShadow = true;
    this.leftLegMesh.receiveShadow = true;
    this.leftLegGroup.add(this.leftLegMesh);

    // 6. Right Leg (Group for hip pivot)
    this.rightLegGroup = new THREE.Group();
    this.rightLegGroup.position.set(-0.5 * scale, -1.0 * scale, 0);
    this.torsoMesh.add(this.rightLegGroup);

    this.rightLegMesh = new THREE.Mesh(legGeo, rightLegMat);
    this.rightLegMesh.position.set(0, -1.0 * scale, 0);
    this.rightLegMesh.castShadow = true;
    this.rightLegMesh.receiveShadow = true;
    this.rightLegGroup.add(this.rightLegMesh);

    // 7. Hat / Accessories
    this.hatGroup = new THREE.Group();
    this.headMesh.add(this.hatGroup);
    this.updateHat();
  }

  public updateHat() {
    while (this.hatGroup.children.length > 0) {
      this.hatGroup.remove(this.hatGroup.children[0]);
    }

    const scale = 0.5;

    if (this.config.hatType === 'baseball_cap') {
      // Classic red/black Roblox cap
      const domeGeo = new THREE.SphereGeometry(0.75 * scale, 16, 8, 0, Math.PI * 2, 0, Math.PI * 0.5);
      const capMat = new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.6 });
      const dome = new THREE.Mesh(domeGeo, capMat);
      dome.position.set(0, 0.45 * scale, 0);
      this.hatGroup.add(dome);

      // Visor
      const visorGeo = new THREE.BoxGeometry(1.1 * scale, 0.1 * scale, 0.8 * scale);
      const visorMat = new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5 });
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 0.45 * scale, 0.6 * scale);
      visor.rotation.x = 0.15;
      this.hatGroup.add(visor);

    } else if (this.config.hatType === 'golden_crown') {
      // Golden King's Crown
      const crownMat = new THREE.MeshStandardMaterial({
        color: '#fbbf24',
        metalness: 0.85,
        roughness: 0.2,
      });
      const bandGeo = new THREE.CylinderGeometry(0.78 * scale, 0.78 * scale, 0.3 * scale, 16);
      const band = new THREE.Mesh(bandGeo, crownMat);
      band.position.set(0, 0.65 * scale, 0);
      this.hatGroup.add(band);

      // Crown spikes
      for (let i = 0; i < 5; i++) {
        const spikeGeo = new THREE.ConeGeometry(0.18 * scale, 0.45 * scale, 4);
        const spike = new THREE.Mesh(spikeGeo, crownMat);
        const angle = (i / 5) * Math.PI * 2;
        spike.position.set(Math.sin(angle) * 0.72 * scale, 0.9 * scale, Math.cos(angle) * 0.72 * scale);
        this.hatGroup.add(spike);
      }

    } else if (this.config.hatType === 'ninja_headband') {
      const bandMat = new THREE.MeshStandardMaterial({ color: '#18181b', roughness: 0.8 });
      const bandGeo = new THREE.CylinderGeometry(0.74 * scale, 0.74 * scale, 0.25 * scale, 16);
      const band = new THREE.Mesh(bandGeo, bandMat);
      band.position.set(0, 0.35 * scale, 0);
      this.hatGroup.add(band);

      // Tails behind head
      const tailGeo = new THREE.BoxGeometry(0.2 * scale, 0.05 * scale, 0.8 * scale);
      const tail = new THREE.Mesh(tailGeo, bandMat);
      tail.position.set(0, 0.35 * scale, -0.9 * scale);
      tail.rotation.x = -0.5;
      this.hatGroup.add(tail);

    } else if (this.config.hatType === 'blox_visor') {
      const visorMat = new THREE.MeshStandardMaterial({
        color: '#06b6d4',
        emissive: '#0891b2',
        emissiveIntensity: 0.8,
        transparent: true,
        opacity: 0.85,
      });
      const visorGeo = new THREE.BoxGeometry(1.2 * scale, 0.3 * scale, 0.5 * scale);
      const visor = new THREE.Mesh(visorGeo, visorMat);
      visor.position.set(0, 0.15 * scale, 0.65 * scale);
      this.hatGroup.add(visor);
    }
  }

  public setCoil(type: 'none' | 'speed' | 'gravity') {
    if (this.coilMesh) {
      this.rightArmMesh.remove(this.coilMesh);
      this.coilMesh = null;
    }

    if (type === 'none') return;

    const scale = 0.5;
    const coilGroup = new THREE.Group();
    const isSpeed = type === 'speed';

    const color = isSpeed ? '#06b6d4' : '#a855f7';
    const coilMat = new THREE.MeshStandardMaterial({
      color: color,
      emissive: color,
      emissiveIntensity: 0.7,
      metalness: 0.5,
      roughness: 0.3,
    });

    // Spiral curve coil geometry
    const points: THREE.Vector3[] = [];
    const loops = 4;
    const height = 1.2 * scale;
    const radius = 0.25 * scale;
    for (let i = 0; i <= 60; i++) {
      const t = i / 60;
      const angle = t * Math.PI * 2 * loops;
      points.push(new THREE.Vector3(Math.cos(angle) * radius, (t - 0.5) * height, Math.sin(angle) * radius));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const tubeGeo = new THREE.TubeGeometry(curve, 40, 0.06 * scale, 8, false);
    const coilTube = new THREE.Mesh(tubeGeo, coilMat);
    coilGroup.add(coilTube);

    // Grip handle
    const handleGeo = new THREE.CylinderGeometry(0.08 * scale, 0.08 * scale, 1.4 * scale, 8);
    const handleMat = new THREE.MeshStandardMaterial({ color: '#334155', metalness: 0.8 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    coilGroup.add(handle);

    coilGroup.position.set(0, -0.9 * scale, 0.4 * scale);
    coilGroup.rotation.x = Math.PI * 0.5;
    this.rightArmMesh.add(coilGroup);
    this.coilMesh = coilGroup;
  }

  public updateConfig(newConfig: Partial<AvatarConfig>) {
    Object.assign(this.config, newConfig);
    this.buildCharacter();
  }

  /**
   * Animate the character based on current velocity and grounded state
   */
  public updateAnimation(delta: number, isMoving: boolean, isGrounded: boolean, speed: number) {
    if (this.isDead) return;

    if (!isGrounded) {
      // In air / jumping animation
      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, -2.4, 12, delta);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, -2.4, 12, delta);
      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, 0.5, 12, delta);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, -0.4, 12, delta);
      return;
    }

    if (isMoving) {
      // Running animation
      const animSpeed = Math.min(speed * 1.4, 18);
      this.walkCycle += delta * animSpeed;

      const swing = Math.sin(this.walkCycle) * 0.85;

      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, swing, 18, delta);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, -swing, 18, delta);
      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, -swing, 18, delta);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, swing, 18, delta);

      // Subtle torso bobbing
      this.torsoMesh.position.y = 2.0 * 0.5 + Math.abs(Math.sin(this.walkCycle * 2)) * 0.08;
    } else {
      // Idle pose
      this.walkCycle += delta * 1.8;
      const breathe = Math.sin(this.walkCycle) * 0.04;

      this.leftArmGroup.rotation.x = THREE.MathUtils.damp(this.leftArmGroup.rotation.x, 0, 10, delta);
      this.rightArmGroup.rotation.x = THREE.MathUtils.damp(this.rightArmGroup.rotation.x, 0, 10, delta);
      this.leftLegGroup.rotation.x = THREE.MathUtils.damp(this.leftLegGroup.rotation.x, 0, 10, delta);
      this.rightLegGroup.rotation.x = THREE.MathUtils.damp(this.rightLegGroup.rotation.x, 0, 10, delta);

      this.torsoMesh.position.y = 2.0 * 0.5 + breathe;
    }
  }

  /**
   * Break apart into individual physics debris ("OOF!" death effect)
   */
  public triggerDeathRagdoll(scene: THREE.Scene): DebrisPiece[] {
    if (this.isDead) return [];
    this.isDead = true;

    this.root.visible = false;
    const pieces: DebrisPiece[] = [];
    const scale = 0.5;

    const parts = [
      { geo: new THREE.CylinderGeometry(0.7 * scale, 0.7 * scale, 1.25 * scale, 16), col: this.config.headColor, pos: new THREE.Vector3(0, 2.8 * scale, 0) },
      { geo: new THREE.BoxGeometry(2.0 * scale, 2.0 * scale, 1.0 * scale), col: this.config.torsoColor, pos: new THREE.Vector3(0, 2.0 * scale, 0) },
      { geo: new THREE.BoxGeometry(1.0 * scale, 2.0 * scale, 1.0 * scale), col: this.config.leftArmColor, pos: new THREE.Vector3(1.5 * scale, 2.0 * scale, 0) },
      { geo: new THREE.BoxGeometry(1.0 * scale, 2.0 * scale, 1.0 * scale), col: this.config.rightArmColor, pos: new THREE.Vector3(-1.5 * scale, 2.0 * scale, 0) },
      { geo: new THREE.BoxGeometry(1.0 * scale, 2.0 * scale, 1.0 * scale), col: this.config.leftLegColor, pos: new THREE.Vector3(0.5 * scale, 1.0 * scale, 0) },
      { geo: new THREE.BoxGeometry(1.0 * scale, 2.0 * scale, 1.0 * scale), col: this.config.rightLegColor, pos: new THREE.Vector3(-0.5 * scale, 1.0 * scale, 0) },
    ];

    const currentPos = this.root.position;

    parts.forEach((p) => {
      const mat = new THREE.MeshStandardMaterial({
        color: p.col,
        roughness: 0.5,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(p.geo, mat);
      mesh.position.copy(currentPos).add(p.pos);
      mesh.castShadow = true;
      scene.add(mesh);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 8,
        4 + Math.random() * 6,
        (Math.random() - 0.5) * 8
      );

      const angVel = new THREE.Vector3(
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 12
      );

      pieces.push({ mesh, velocity: vel, angularVelocity: angVel });
    });

    this.debrisPieces = pieces;
    return pieces;
  }

  public respawn(spawnPoint: [number, number, number], scene: THREE.Scene) {
    // Remove debris from scene
    this.debrisPieces.forEach((p) => {
      scene.remove(p.mesh);
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    });
    this.debrisPieces = [];

    // Reset character
    this.isDead = false;
    this.root.visible = true;
    this.root.position.set(spawnPoint[0], spawnPoint[1], spawnPoint[2]);
    this.root.rotation.set(0, 0, 0);

    // Reset joints
    this.leftArmGroup.rotation.set(0, 0, 0);
    this.rightArmGroup.rotation.set(0, 0, 0);
    this.leftLegGroup.rotation.set(0, 0, 0);
    this.rightLegGroup.rotation.set(0, 0, 0);
  }
}
