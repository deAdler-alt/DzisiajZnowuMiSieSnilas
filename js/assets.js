const ASSET_MANIFEST = {
  'sprites/gienek': 'assets/sprites/gienek.png',
  'enemies/toxic': 'assets/sprites/enemies/toxic.png',
  'enemies/rektor': 'assets/sprites/enemies/rektor.png',
  'enemies/kac': 'assets/sprites/enemies/kac.png',
  'enemies/hr': 'assets/sprites/enemies/hr.png',
  'ui/title-bg': 'assets/ui/title-bg.png',
  'ui/birthday-cake': 'assets/ui/birthday-cake.png',
  'ui/heart-orange': 'assets/ui/heart-orange.png',
  'portraits/gienek': 'assets/portraits/gienek.png',
  'portraits/rektor': 'assets/portraits/rektor.png',
  'portraits/toxic': 'assets/portraits/toxic.png',
  'portraits/kac': 'assets/portraits/kac.png',
  'portraits/hr': 'assets/portraits/hr.png',
};

const PORTRAIT_MAP = {
  Gienek: 'portraits/gienek',
  'Toxic Gracz': 'portraits/toxic',
  'Toxic Gracz LoL': 'portraits/toxic',
  'J.M. Rektor': 'portraits/rektor',
  Rektor: 'portraits/rektor',
  'Potężny Kac': 'portraits/kac',
  HR: 'portraits/hr',
  Rekruter: 'portraits/hr',
  System: null,
};

const FALLBACK_COLORS = {
  'sprites/gienek': '#00ccff',
  'enemies/toxic': '#ff3333',
  'enemies/rektor': '#6633aa',
  'enemies/kac': '#88ff44',
  'enemies/hr': '#888888',
};

const images = {};
let loadProgress = 0;

export function getPortraitForSpeaker(speaker) {
  return PORTRAIT_MAP[speaker] || null;
}

export function getLoadProgress() {
  return loadProgress;
}

export function loadAll(onProgress) {
  const entries = Object.entries(ASSET_MANIFEST);
  let loaded = 0;
  const promises = entries.map(([id, src]) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { images[id] = img; loaded++; loadProgress = loaded / entries.length; if (onProgress) onProgress(loadProgress); resolve(); };
    img.onerror = () => { loaded++; loadProgress = loaded / entries.length; if (onProgress) onProgress(loadProgress); resolve(); };
    img.src = src;
  }));
  return Promise.all(promises);
}

export function getImage(id) {
  return images[id] || null;
}

export function drawSprite(ctx, id, x, y, w, h) {
  const img = images[id];
  if (img) {
    ctx.drawImage(img, x, y, w, h);
    return true;
  }
  ctx.fillStyle = FALLBACK_COLORS[id] || '#888';
  ctx.fillRect(x, y, w, h);
  return false;
}

export function drawPortrait(ctx, speaker, x, y, size) {
  const id = getPortraitForSpeaker(speaker);
  if (id) return drawSprite(ctx, id, x, y, size, size);
  ctx.fillStyle = '#444';
  ctx.fillRect(x, y, size, size);
  ctx.fillStyle = '#aaa';
  ctx.font = `${size * 0.35}px system-ui`;
  ctx.textAlign = 'center';
  ctx.fillText('?', x + size / 2, y + size * 0.6);
  ctx.textAlign = 'left';
  return false;
}
