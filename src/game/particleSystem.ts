import * as THREE from 'three';

interface Particle {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  color: THREE.Color;
  size: number;
  life: number;
  maxLife: number;
}

export class ParticleSystem {
  private particles: Particle[] = [];
  private geometry: THREE.BufferGeometry;
  private material: THREE.PointsMaterial;
  private points: THREE.Points;
  private maxParticles = 600;

  private posArray: Float32Array;
  private colorArray: Float32Array;

  constructor(scene: THREE.Scene) {
    this.geometry = new THREE.BufferGeometry();
    this.posArray = new Float32Array(this.maxParticles * 3);
    this.colorArray = new Float32Array(this.maxParticles * 3);

    this.geometry.setAttribute('position', new THREE.BufferAttribute(this.posArray, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(this.colorArray, 3));

    // Create circular soft point texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.7)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 32);

    const texture = new THREE.CanvasTexture(canvas);

    this.material = new THREE.PointsMaterial({
      size: 0.35,
      map: texture,
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    this.points = new THREE.Points(this.geometry, this.material);
    this.points.frustumCulled = false;
    scene.add(this.points);
  }

  public emitSparkles(pos: THREE.Vector3, count: number = 30, colorHex: string = '#22c55e') {
    const col = new THREE.Color(colorHex);
    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 2.5;
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 0.2, (Math.random() - 0.5) * 0.8)),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed * 0.5,
          2.0 + Math.random() * 3.5,
          Math.sin(angle) * speed * 0.5
        ),
        color: col.clone(),
        size: 0.3 + Math.random() * 0.3,
        life: 0,
        maxLife: 0.8 + Math.random() * 0.6,
      });
    }
  }

  public emitLavaDeath(pos: THREE.Vector3) {
    const red = new THREE.Color('#ef4444');
    const orange = new THREE.Color('#f97316');
    for (let i = 0; i < 45; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const speed = 3.0 + Math.random() * 4.0;
      const angle = Math.random() * Math.PI * 2;
      const vAngle = (Math.random() - 0.5) * Math.PI;
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3(0, 1.0, 0)),
        velocity: new THREE.Vector3(
          Math.cos(angle) * Math.cos(vAngle) * speed,
          Math.sin(vAngle) * speed + 3.0,
          Math.sin(angle) * Math.cos(vAngle) * speed
        ),
        color: Math.random() > 0.5 ? red.clone() : orange.clone(),
        size: 0.4 + Math.random() * 0.4,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.5,
      });
    }
  }

  public emitJumpPuff(pos: THREE.Vector3) {
    const white = new THREE.Color('#e2e8f0');
    for (let i = 0; i < 12; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.8 + Math.random() * 1.2;
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3(0, 0.05, 0)),
        velocity: new THREE.Vector3(Math.cos(angle) * speed, 0.4 + Math.random() * 0.6, Math.sin(angle) * speed),
        color: white.clone(),
        size: 0.25,
        life: 0,
        maxLife: 0.35 + Math.random() * 0.2,
      });
    }
  }

  public emitConfetti(pos: THREE.Vector3) {
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    for (let i = 0; i < 70; i++) {
      if (this.particles.length >= this.maxParticles) break;
      const angle = Math.random() * Math.PI * 2;
      const speed = 4.0 + Math.random() * 6.0;
      const col = new THREE.Color(colors[Math.floor(Math.random() * colors.length)]);
      this.particles.push({
        position: pos.clone().add(new THREE.Vector3(0, 2.0, 0)),
        velocity: new THREE.Vector3(
          Math.cos(angle) * speed * 0.7,
          5.0 + Math.random() * 6.0,
          Math.sin(angle) * speed * 0.7
        ),
        color: col,
        size: 0.35 + Math.random() * 0.3,
        life: 0,
        maxLife: 1.8 + Math.random() * 1.2,
      });
    }
  }

  public update(delta: number) {
    let pIdx = 0;
    const gravity = -9.8;

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.life += delta;

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
        continue;
      }

      // Physics
      p.velocity.y += gravity * delta * 0.5;
      p.position.addScaledVector(p.velocity, delta);

      // Fade color
      const alpha = 1 - p.life / p.maxLife;

      this.posArray[pIdx * 3] = p.position.x;
      this.posArray[pIdx * 3 + 1] = p.position.y;
      this.posArray[pIdx * 3 + 2] = p.position.z;

      this.colorArray[pIdx * 3] = p.color.r * alpha;
      this.colorArray[pIdx * 3 + 1] = p.color.g * alpha;
      this.colorArray[pIdx * 3 + 2] = p.color.b * alpha;

      pIdx++;
    }

    // Hide remainder of buffer
    for (let i = pIdx; i < this.maxParticles; i++) {
      this.posArray[i * 3] = 0;
      this.posArray[i * 3 + 1] = -9999;
      this.posArray[i * 3 + 2] = 0;
    }

    this.geometry.attributes.position.needsUpdate = true;
    this.geometry.attributes.color.needsUpdate = true;
  }

  public dispose(scene: THREE.Scene) {
    scene.remove(this.points);
    this.geometry.dispose();
    this.material.dispose();
  }
}
