import * as THREE from 'three';

/**
 * Procedural Canvas Textures for Roblox Studio Aesthetics
 * Guaranteed zero external 404 dependencies, SRGBColorSpace compliant.
 */

// Cached textures to prevent re-creation
const textureCache = new Map<string, THREE.CanvasTexture>();

export function getStudsTexture(color: string = '#808080'): THREE.CanvasTexture {
  const cacheKey = `studs_${color}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Fill base color
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 128, 128);

  // Subtle border grid lines
  ctx.strokeStyle = 'rgba(0,0,0,0.15)';
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, 128, 128);

  // Draw 4 circular studs (2x2 grid)
  const centers = [
    [32, 32],
    [96, 32],
    [32, 96],
    [96, 96],
  ];

  centers.forEach(([cx, cy]) => {
    // Outer drop shadow
    ctx.beginPath();
    ctx.arc(cx, cy + 2, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.22)';
    ctx.fill();

    // Stud body (slightly lighter than base)
    ctx.beginPath();
    ctx.arc(cx, cy, 16, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.fill();

    // Inner bevel highlight
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 13, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.18)';
    ctx.fill();

    // Center circular recess
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.12)';
    ctx.fill();

    // Center tiny dot
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.25)';
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function getBaseplateTexture(): THREE.CanvasTexture {
  const cacheKey = 'baseplate';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Classic Roblox dark slate gray checkered grid
  ctx.fillStyle = '#4b5563';
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = '#374151';
  ctx.fillRect(0, 0, 128, 128);
  ctx.fillRect(128, 128, 128, 128);

  // Stud points
  for (let x = 16; x < 256; x += 32) {
    for (let y = 16; y < 256; y += 32) {
      ctx.beginPath();
      ctx.arc(x, y + 1, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0,0,0,0.25)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.fill();
    }
  }

  // Grid line borders
  ctx.strokeStyle = 'rgba(0,0,0,0.3)';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, 256, 256);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(32, 32);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function getSpawnPadTexture(): THREE.CanvasTexture {
  const cacheKey = 'spawnpad';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 0, 256, 256);

  // Outer ring
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.arc(128, 128, 100, 0, Math.PI * 2);
  ctx.stroke();

  // Inner ring
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(128, 128, 60, 0, Math.PI * 2);
  ctx.stroke();

  // Center bullseye
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(128, 128, 26, 0, Math.PI * 2);
  ctx.fill();

  // Crosshair brackets
  ctx.strokeStyle = '#f8fafc';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(128, 15); ctx.lineTo(128, 55);
  ctx.moveTo(128, 201); ctx.lineTo(128, 241);
  ctx.moveTo(15, 128); ctx.lineTo(55, 128);
  ctx.moveTo(201, 128); ctx.lineTo(241, 128);
  ctx.stroke();

  // "SPAWN" text
  ctx.font = 'bold 24px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('SPAWN', 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function getConveyorTexture(): THREE.CanvasTexture {
  const cacheKey = 'conveyor';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Dark industrial background
  ctx.fillStyle = '#1e1e1e';
  ctx.fillRect(0, 0, 128, 128);

  // Chevron forward arrows in vibrant neon yellow
  ctx.fillStyle = '#eab308';
  for (let y = 0; y < 128; y += 42) {
    ctx.beginPath();
    ctx.moveTo(16, y + 36);
    ctx.lineTo(64, y + 10);
    ctx.lineTo(112, y + 36);
    ctx.lineTo(96, y + 42);
    ctx.lineTo(64, y + 24);
    ctx.lineTo(32, y + 42);
    ctx.closePath();
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 3);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function getFaceTexture(type: 'smile' | 'chill' | 'cool' | 'epic'): THREE.CanvasTexture {
  const cacheKey = `face_${type}`;
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Transparent background
  ctx.clearRect(0, 0, 256, 256);

  if (type === 'smile') {
    // Classic Roblox two black pill eyes and wide curved smile
    ctx.fillStyle = '#000000';
    // Left eye
    ctx.beginPath();
    ctx.ellipse(82, 100, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    // Right eye
    ctx.beginPath();
    ctx.ellipse(174, 100, 16, 26, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye glints
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(77, 92, 5, 0, Math.PI * 2);
    ctx.arc(169, 92, 5, 0, Math.PI * 2);
    ctx.fill();

    // Smile
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 138, 48, 0.15 * Math.PI, 0.85 * Math.PI, false);
    ctx.stroke();

  } else if (type === 'chill') {
    // Half closed relaxed eyes
    ctx.fillStyle = '#000000';
    ctx.fillRect(66, 102, 34, 12);
    ctx.fillRect(156, 102, 34, 12);

    // Smug half smile
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(110, 160);
    ctx.quadraticCurveTo(150, 175, 175, 145);
    ctx.stroke();

  } else if (type === 'cool') {
    // Cool pixel sunglasses
    ctx.fillStyle = '#111827';
    // Glasses bridge
    ctx.fillRect(60, 85, 136, 12);
    // Left lens
    ctx.fillRect(52, 95, 66, 42);
    // Right lens
    ctx.fillRect(138, 95, 66, 42);

    // Gloss glare on lenses
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.moveTo(60, 130); ctx.lineTo(100, 95); ctx.lineTo(110, 95); ctx.lineTo(70, 130); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(146, 130); ctx.lineTo(186, 95); ctx.lineTo(196, 95); ctx.lineTo(156, 130); ctx.fill();

    // Smirk
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#000000';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(128, 148, 32, 0.2 * Math.PI, 0.8 * Math.PI, false);
    ctx.stroke();

  } else if (type === 'epic') {
    // Wide open hyper mouth and big eyes
    ctx.fillStyle = '#000000';
    ctx.beginPath();
    ctx.arc(80, 95, 20, 0, Math.PI * 2);
    ctx.arc(176, 95, 20, 0, Math.PI * 2);
    ctx.fill();

    // Big happy open mouth with red tongue
    ctx.beginPath();
    ctx.arc(128, 140, 52, 0, Math.PI, false);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(128, 168, 30, 0, Math.PI, false);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

export function setMaxAnisotropy(renderer: THREE.WebGLRenderer) {
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  textureCache.forEach((tex) => {
    tex.anisotropy = maxAniso;
  });
}
