import { W, H } from './utils.js';

export class CrawlScreen {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.lines = [];
    this.scrollY = H + 100;
    this.speed = 42;
    this.onComplete = null;
    this.done = false;
    this.waitTimer = 0;
  }

  start(lines, onComplete, speed = 42) {
    this.lines = lines;
    this.scrollY = H + 80;
    this.speed = speed;
    this.onComplete = onComplete || null;
    this.active = true;
    this.done = false;
    this.waitTimer = 0;
  }

  update(dt) {
    if (!this.active) return;
    if (!this.done) {
      this.scrollY -= this.speed * dt;
      const totalH = this.lines.length * 36 + 200;
      if (this.scrollY < -totalH) {
        this.done = true;
        this.waitTimer = 1.5;
      }
    } else {
      this.waitTimer -= dt;
      if (this.waitTimer <= 0) {
        this.active = false;
        if (this.onComplete) this.onComplete();
      }
    }
    if (this.game.input.consumePressed('space')) {
      this.scrollY -= 200;
    }
  }

  draw(ctx) {
    if (!this.active) return;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    ctx.save();
    const cx = W / 2;
    const top = H * 0.12;
    const bottom = H * 0.88;
    ctx.beginPath();
    ctx.moveTo(0, top);
    ctx.lineTo(W, top);
    ctx.lineTo(W * 0.72, bottom);
    ctx.lineTo(W * 0.28, bottom);
    ctx.closePath();
    ctx.clip();
    ctx.translate(cx, this.scrollY);
    ctx.scale(1, 0.82);
    ctx.textAlign = 'center';
    let y = 0;
    for (const line of this.lines) {
      const isTitle = line === this.lines[0] || line === 'B-DAY STORY';
      ctx.fillStyle = isTitle ? '#FFE81F' : '#E2C96B';
      ctx.font = isTitle ? 'bold 28px system-ui' : '18px system-ui';
      ctx.fillText(line, 0, y);
      y += isTitle ? 48 : 32;
    }
    ctx.restore();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.font = '12px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText('[SPACJA] przyspiesz', W / 2, H - 16);
    ctx.textAlign = 'left';
  }
}
