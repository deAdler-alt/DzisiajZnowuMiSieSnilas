export const GameState = {
  LOADING: 'LOADING',
  TITLE_SCREEN: 'TITLE_SCREEN',
  INTRO_CRAWL: 'INTRO_CRAWL',
  EXPLORATION_TOPDOWN: 'EXPLORATION_TOPDOWN',
  COMBAT_BULLETHELL: 'COMBAT_BULLETHELL',
  PLATFORMER_2D: 'PLATFORMER_2D',
  QTE_MODE: 'QTE_MODE',
  ENDING: 'ENDING',
  CREDITS: 'CREDITS',
};

export const W = 800;
export const H = 600;
export const UI_MARGIN = 12;

export function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function randInt(min, max) {
  return Math.floor(rand(min, max + 1));
}

export function aabb(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

export function fitText(ctx, text, maxW) {
  if (ctx.measureText(text).width <= maxW) return text;
  let t = text;
  while (t.length > 3 && ctx.measureText(t + '…').width > maxW) t = t.slice(0, -1);
  return t + '…';
}
