import * as THREE from 'three';
import { WeatherEvent, SkyTheme } from '../types/game';

export class WeatherSystem {
  public weather: WeatherEvent = 'normal';
  public skyTheme: SkyTheme = 'day';

  private rainPoints: THREE.Points;
  private snowPoints: THREE.Points;
  private starsPoints: THREE.Points;
  private emberPoints: THREE.Points;
  private cloudsGroup: THREE.Group;
  public risingLavaMesh: THREE.Mesh;

  private rainGeo: THREE.BufferGeometry;
  private snowGeo: THREE.BufferGeometry;
  private emberGeo: THREE.BufferGeometry;
  private rainPos: Float32Array;
  private snowPos: Float32Array;
  private emberPos: Float32Array;

  private maxRain = 1600;
  private maxSnow = 1400;
  private maxEmbers = 400;

  // Lightning effect for rain
  private lightningTimer: number = 0;
  private isLightningFlash: boolean = false;

  constructor(private scene: THREE.Scene, private keyLight?: THREE.DirectionalLight) {
    // 1. Procedural 3D Roblox Voxel Clouds
    this.cloudsGroup = new THREE.Group();
    this.buildVoxelClouds();
    scene.add(this.cloudsGroup);

    // 2. Heavy Rain Particles
    this.rainGeo = new THREE.BufferGeometry();
    this.rainPos = new Float32Array(this.maxRain * 3);
    for (let i = 0; i < this.maxRain; i++) {
      this.rainPos[i * 3] = (Math.random() - 0.5) * 220;
      this.rainPos[i * 3 + 1] = Math.random() * 90;
      this.rainPos[i * 3 + 2] = (Math.random() - 0.5) * 450 - 150;
    }
    this.rainGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.75,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
    });
    this.rainPoints = new THREE.Points(this.rainGeo, rainMat);
    this.rainPoints.visible = false;
    scene.add(this.rainPoints);

    // 3. Dense Swirling Snow Particles
    this.snowGeo = new THREE.BufferGeometry();
    this.snowPos = new Float32Array(this.maxSnow * 3);
    for (let i = 0; i < this.maxSnow; i++) {
      this.snowPos[i * 3] = (Math.random() - 0.5) * 220;
      this.snowPos[i * 3 + 1] = Math.random() * 90;
      this.snowPos[i * 3 + 2] = (Math.random() - 0.5) * 450 - 150;
    }
    this.snowGeo.setAttribute('position', new THREE.BufferAttribute(this.snowPos, 3));

    // Circular soft snowflake texture
    const snowCanvas = document.createElement('canvas');
    snowCanvas.width = 32;
    snowCanvas.height = 32;
    const sctx = snowCanvas.getContext('2d')!;
    const sgrad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    sgrad.addColorStop(0, 'rgba(255,255,255,1)');
    sgrad.addColorStop(0.6, 'rgba(240,249,255,0.8)');
    sgrad.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = sgrad;
    sctx.fillRect(0, 0, 32, 32);
    const snowTexture = new THREE.CanvasTexture(snowCanvas);

    const snowMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.1,
      map: snowTexture,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.snowPoints = new THREE.Points(this.snowGeo, snowMat);
    this.snowPoints.visible = false;
    scene.add(this.snowPoints);

    // 4. Fiery Ash Embers (For Rising Lava Event)
    this.emberGeo = new THREE.BufferGeometry();
    this.emberPos = new Float32Array(this.maxEmbers * 3);
    for (let i = 0; i < this.maxEmbers; i++) {
      this.emberPos[i * 3] = (Math.random() - 0.5) * 180;
      this.emberPos[i * 3 + 1] = -5 + Math.random() * 40;
      this.emberPos[i * 3 + 2] = (Math.random() - 0.5) * 450 - 150;
    }
    this.emberGeo.setAttribute('position', new THREE.BufferAttribute(this.emberPos, 3));
    const emberMat = new THREE.PointsMaterial({
      color: 0xf97316,
      size: 0.9,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.emberPoints = new THREE.Points(this.emberGeo, emberMat);
    this.emberPoints.visible = false;
    scene.add(this.emberPoints);

    // 5. Starry Night Sky Particles
    const starsGeo = new THREE.BufferGeometry();
    const starCount = 800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1) * 0.5;
      const r = 380;
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.cos(phi) + 20;
      starPos[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starsGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starsMat = new THREE.PointsMaterial({
      color: 0xfef08a,
      size: 1.4,
      transparent: true,
      opacity: 0.9,
    });
    this.starsPoints = new THREE.Points(starsGeo, starsMat);
    this.starsPoints.visible = false;
    scene.add(this.starsPoints);

    // 6. Physical Rising Lava Plane
    const lavaGeo = new THREE.PlaneGeometry(300, 600);
    const lavaMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      emissive: 0xff0033,
      emissiveIntensity: 1.8,
      roughness: 0.2,
      metalness: 0.3,
    });
    this.risingLavaMesh = new THREE.Mesh(lavaGeo, lavaMat);
    this.risingLavaMesh.rotation.x = -Math.PI / 2;
    this.risingLavaMesh.position.set(0, -15, -250);
    this.risingLavaMesh.visible = false;
    scene.add(this.risingLavaMesh);
  }

  private buildVoxelClouds() {
    const cloudMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.85,
      metalness: 0.05,
      transparent: true,
      opacity: 0.9,
    });

    for (let c = 0; c < 20; c++) {
      const singleCloud = new THREE.Group();
      const numBlocks = 6 + Math.floor(Math.random() * 7);

      for (let b = 0; b < numBlocks; b++) {
        const sx = 8 + Math.random() * 10;
        const sy = 3 + Math.random() * 2.5;
        const sz = 8 + Math.random() * 10;
        const boxGeo = new THREE.BoxGeometry(sx, sy, sz);
        const mesh = new THREE.Mesh(boxGeo, cloudMat);
        mesh.position.set(
          (Math.random() - 0.5) * 18,
          (Math.random() - 0.5) * 2,
          (Math.random() - 0.5) * 18
        );
        singleCloud.add(mesh);
      }

      singleCloud.position.set(
        (Math.random() - 0.5) * 380,
        55 + Math.random() * 25,
        (Math.random() - 0.5) * 500 - 150
      );
      this.cloudsGroup.add(singleCloud);
    }
  }

  /**
   * Automatically transforms the entire sky, atmosphere, fog, and particle systems to match the event!
   */
  public setWeather(event: WeatherEvent) {
    this.weather = event;

    // Reset visibility of all systems
    this.rainPoints.visible = false;
    this.snowPoints.visible = false;
    this.emberPoints.visible = false;
    this.starsPoints.visible = false;
    this.risingLavaMesh.visible = false;
    this.cloudsGroup.visible = true;

    if (event === 'snow_cold') {
      // 1. BLIZZARD SNOW EVENT: Frosty cyan-grey blizzard sky, dense snow swirling
      this.scene.background = new THREE.Color('#94a3b8');
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color('#cbd5e1');
        (this.scene.fog as THREE.FogExp2).density = 0.007;
      }
      this.snowPoints.visible = true;
      if (this.keyLight) {
        this.keyLight.color = new THREE.Color('#e0f2fe');
        this.keyLight.intensity = 1.2;
      }
    } else if (event === 'rain_slippery') {
      // 2. SLIPPERY RAIN STORM: Dark stormy navy sky, pouring rain & lightning flashes
      this.scene.background = new THREE.Color('#0f172a');
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color('#1e293b');
        (this.scene.fog as THREE.FogExp2).density = 0.006;
      }
      this.rainPoints.visible = true;
      if (this.keyLight) {
        this.keyLight.color = new THREE.Color('#94a3b8');
        this.keyLight.intensity = 1.0;
      }
    } else if (event === 'low_gravity') {
      // 3. ZERO GRAVITY COSMIC: Deep cosmic space galaxy nebula with stars
      this.scene.background = new THREE.Color('#050510');
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color('#3b0764');
        (this.scene.fog as THREE.FogExp2).density = 0.004;
      }
      this.starsPoints.visible = true;
      this.cloudsGroup.visible = false;
      if (this.keyLight) {
        this.keyLight.color = new THREE.Color('#c084fc');
        this.keyLight.intensity = 1.5;
      }
    } else if (event === 'rising_lava') {
      // 4. VOLCANIC RISING LAVA: Apocalyptic fiery crimson volcanic sky with rising embers
      this.scene.background = new THREE.Color('#450a0a');
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color('#7c2d12');
        (this.scene.fog as THREE.FogExp2).density = 0.0055;
      }
      this.emberPoints.visible = true;
      this.risingLavaMesh.visible = true;
      this.risingLavaMesh.position.y = -8; // Start below and rise!
      if (this.keyLight) {
        this.keyLight.color = new THREE.Color('#f97316');
        this.keyLight.intensity = 1.6;
      }
    } else if (event === 'speed_rush') {
      // 5. HYPER SPEED RUSH: Electrifying Emerald Aurora sky
      this.scene.background = new THREE.Color('#022c22');
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color('#065f46');
        (this.scene.fog as THREE.FogExp2).density = 0.0045;
      }
      this.starsPoints.visible = true;
      if (this.keyLight) {
        this.keyLight.color = new THREE.Color('#34d399');
        this.keyLight.intensity = 2.0;
      }
    } else {
      // 6. CLEAR / NORMAL: Restores clean cheerful Roblox blue daytime sky
      this.scene.background = new THREE.Color('#38bdf8');
      if (this.scene.fog) {
        this.scene.fog.color = new THREE.Color('#93c5fd');
        (this.scene.fog as THREE.FogExp2).density = 0.0035;
      }
      if (this.keyLight) {
        this.keyLight.color = new THREE.Color('#fffbeb');
        this.keyLight.intensity = 1.8;
      }
    }
  }

  public setSkyTheme(theme: SkyTheme) {
    this.skyTheme = theme;
    if (this.weather !== 'normal') return; // Custom weather event overrides sky theme

    if (theme === 'day') {
      this.scene.background = new THREE.Color('#38bdf8');
      if (this.scene.fog) this.scene.fog.color = new THREE.Color('#93c5fd');
      this.starsPoints.visible = false;
      this.cloudsGroup.visible = true;
    } else if (theme === 'sunset') {
      this.scene.background = new THREE.Color('#fb923c');
      if (this.scene.fog) this.scene.fog.color = new THREE.Color('#fdba74');
      this.starsPoints.visible = false;
      this.cloudsGroup.visible = true;
    } else if (theme === 'night') {
      this.scene.background = new THREE.Color('#090d16');
      if (this.scene.fog) this.scene.fog.color = new THREE.Color('#0f172a');
      this.starsPoints.visible = true;
      this.cloudsGroup.visible = false;
    } else if (theme === 'twilight') {
      this.scene.background = new THREE.Color('#6366f1');
      if (this.scene.fog) this.scene.fog.color = new THREE.Color('#818cf8');
      this.starsPoints.visible = true;
      this.cloudsGroup.visible = true;
    }
  }

  public update(dt: number, playerZ: number) {
    // 1. Drift clouds across the sky
    if (this.cloudsGroup.visible) {
      this.cloudsGroup.children.forEach((cloud) => {
        cloud.position.x += dt * 3.8;
        if (cloud.position.x > 220) {
          cloud.position.x = -220;
        }
      });
    }

    // 2. Animate Heavy Rain
    if (this.rainPoints.visible) {
      for (let i = 0; i < this.maxRain; i++) {
        this.rainPos[i * 3 + 1] -= dt * 75;
        this.rainPos[i * 3] += dt * 5;
        if (this.rainPos[i * 3 + 1] < -5) {
          this.rainPos[i * 3 + 1] = 85;
          this.rainPos[i * 3] = (Math.random() - 0.5) * 180;
          this.rainPos[i * 3 + 2] = playerZ + (Math.random() - 0.5) * 180;
        }
      }
      this.rainGeo.attributes.position.needsUpdate = true;

      // Occasional lightning flash
      this.lightningTimer += dt;
      if (this.lightningTimer > 5.5 + Math.random() * 4) {
        this.lightningTimer = 0;
        this.isLightningFlash = true;
        if (this.keyLight) this.keyLight.intensity = 3.5;
        setTimeout(() => {
          this.isLightningFlash = false;
          if (this.keyLight) this.keyLight.intensity = 1.0;
        }, 120);
      }
    }

    // 3. Animate Swirling Blizzard Snow
    if (this.snowPoints.visible) {
      for (let i = 0; i < this.maxSnow; i++) {
        this.snowPos[i * 3 + 1] -= dt * 16;
        this.snowPos[i * 3] += Math.sin(this.snowPos[i * 3 + 1] * 0.15 + i) * dt * 8;
        if (this.snowPos[i * 3 + 1] < -5) {
          this.snowPos[i * 3 + 1] = 85;
          this.snowPos[i * 3] = (Math.random() - 0.5) * 180;
          this.snowPos[i * 3 + 2] = playerZ + (Math.random() - 0.5) * 180;
        }
      }
      this.snowGeo.attributes.position.needsUpdate = true;
    }

    // 4. Animate Rising Volcanic Ash Embers & Rising Lava
    if (this.emberPoints.visible) {
      for (let i = 0; i < this.maxEmbers; i++) {
        this.emberPos[i * 3 + 1] += dt * 12; // Rise upwards
        this.emberPos[i * 3] += Math.sin(this.emberPos[i * 3 + 1] * 0.2) * dt * 4;
        if (this.emberPos[i * 3 + 1] > 60) {
          this.emberPos[i * 3 + 1] = -5;
          this.emberPos[i * 3] = (Math.random() - 0.5) * 160;
          this.emberPos[i * 3 + 2] = playerZ + (Math.random() - 0.5) * 180;
        }
      }
      this.emberGeo.attributes.position.needsUpdate = true;

      // Rising lava plane climbs up slowly!
      if (this.risingLavaMesh.visible && this.risingLavaMesh.position.y < 42) {
        this.risingLavaMesh.position.y += dt * 0.45; // Slowly rises
      }
    }
  }

  public dispose() {
    this.scene.remove(this.cloudsGroup);
    this.scene.remove(this.rainPoints);
    this.scene.remove(this.snowPoints);
    this.scene.remove(this.emberPoints);
    this.scene.remove(this.starsPoints);
    this.scene.remove(this.risingLavaMesh);
    this.rainGeo.dispose();
    this.snowGeo.dispose();
    this.emberGeo.dispose();
    this.risingLavaMesh.geometry.dispose();
  }
}
