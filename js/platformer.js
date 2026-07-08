import { W, H, clamp, aabb } from './utils.js';
import { drawSprite } from './assets.js';

export class PlatformerSystem {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.player = { x: 60, y: 400, w: 24, h: 32, vx: 0, vy: 0, onGround: false };
    this.platforms = [];
    this.pits = [];
    this.movingPlatforms = [];
    this.goal = null;
    this.cameraX = 0;
    this.levelWidth = 2400;
    this.gravity = 900;
    this.jumpForce = -380;
    this.moveSpeed = 200;
    this.hr = null;
    this.hrTimer = 0;
    this.survivalMode = false;
    this.survivalTimer = 0;
    this.onWin = null;
    this.onFall = null;
    this.spawnX = 60;
    this.spawnY = 400;
    this.bullets = [];
    this.bulletTimer = 0;
  }

  start(config = {}) {
    this.reset();
    this.platforms = config.platforms || [];
    this.pits = config.pits || [];
    this.movingPlatforms = config.movingPlatforms || [];
    this.goal = config.goal || null;
    this.levelWidth = config.levelWidth || 2400;
    this.hr = config.hr || null;
    this.survivalMode = config.survivalMode || false;
    this.survivalTimer = config.survivalTime || 10;
    this.onWin = config.onWin || null;
    this.onFall = config.onFall || null;
    this.spawnX = config.spawnX ?? 60;
    this.spawnY = config.spawnY ?? 400;
    this.player.x = this.spawnX;
    this.player.y = this.spawnY;
    this.cameraX = 0;
  }

  update(dt) {
    const inp = this.game.input;
    const p = this.player;

    if (inp.isDown('a') || inp.isDown('left')) p.vx = -this.moveSpeed;
    else if (inp.isDown('d') || inp.isDown('right')) p.vx = this.moveSpeed;
    else p.vx = 0;

    if ((inp.consumePressed('space') || inp.consumePressed('w') || inp.consumePressed('up')) && p.onGround) {
      p.vy = this.jumpForce;
      p.onGround = false;
    }

    p.vy += this.gravity * dt;
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.onGround = false;

    p.x = clamp(p.x, 0, this.levelWidth - p.w);

    for (const mp of this.movingPlatforms) {
      mp.x += mp.vx * dt;
      if (mp.minX !== undefined && (mp.x < mp.minX || mp.x > mp.maxX)) mp.vx *= -1;
    }

    const allPlatforms = [...this.platforms, ...this.movingPlatforms];
    for (const plat of allPlatforms) {
      if (this.resolvePlatform(p, plat, dt)) p.onGround = true;
    }

    for (const pit of this.pits) {
      if (aabb(p.x, p.y + p.h - 4, p.w, 4, pit.x, pit.y, pit.w, pit.h)) {
        this.game.damage(3);
        this.game.renderer.shake(7, 0.3);
        this.game.renderer.popText('-3', p.x - this.cameraX + p.w / 2, p.y - 10, '#ff5555');
        p.x = this.spawnX;
        p.y = this.spawnY;
        p.vy = 0;
        if (this.onFall) this.onFall();
      }
    }

    if (p.y > H + 50) {
      this.game.damage(3);
      this.game.renderer.shake(7, 0.3);
      p.x = this.spawnX;
      p.y = this.spawnY;
      p.vy = 0;
    }

    if (this.goal && aabb(p.x, p.y, p.w, p.h, this.goal.x, this.goal.y, this.goal.w, this.goal.h)) {
      if (this.onWin) this.onWin();
      this.goal = null;
    }

    if (this.survivalMode) {
      this.survivalTimer -= dt;
      this.bulletTimer += dt;
      if (this.bulletTimer > 0.8) {
        this.bulletTimer = 0;
        this.bullets.push({ x: this.cameraX + W + 10, y: 200 + Math.random() * 200, w: 10, h: 10, vx: -200, vy: 0 });
      }
      for (const b of this.bullets) {
        b.x += b.vx * dt;
        if (aabb(p.x, p.y, p.w, p.h, b.x, b.y, b.w, b.h)) {
          this.game.damage(2);
          this.game.renderer.shake(5, 0.2);
          b.x = -100;
        }
      }
      this.bullets = this.bullets.filter(b => b.x > this.cameraX - 50);
      if (this.survivalTimer <= 0 && this.onWin) this.onWin();
    }

    if (this.hr) {
      this.hrTimer += dt;
      if (this.hrTimer > 5) { this.hrTimer = 0; this.hr.showBubble = true; this.hr.bubbleTimer = 2; }
      if (this.hr.bubbleTimer > 0) this.hr.bubbleTimer -= dt;
      else this.hr.showBubble = false;
    }

    this.cameraX = clamp(p.x - W / 3, 0, Math.max(0, this.levelWidth - W));
  }

  resolvePlatform(p, plat, dt = 0.016) {
    const prevY = p.y - p.vy * dt;
    if (!aabb(p.x, p.y, p.w, p.h, plat.x, plat.y, plat.w, plat.h)) return false;
    if (prevY + p.h <= plat.y + 6 && p.vy >= 0) {
      p.y = plat.y - p.h;
      p.vy = 0;
      if (plat.vx) p.x += plat.vx * dt;
      return true;
    }
    return false;
  }

  draw(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    if (this.survivalMode) { sky.addColorStop(0, '#3a0d2a'); sky.addColorStop(1, '#12040d'); }
    else { sky.addColorStop(0, '#3b2568'); sky.addColorStop(1, '#1a1030'); }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // parallax stars/dust
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let i = 0; i < 40; i++) {
      const sx = (i * 137 - this.cameraX * 0.3) % (W + 40);
      const sy = (i * 53) % H;
      ctx.fillRect(sx < 0 ? sx + W + 40 : sx, sy, 2, 2);
    }

    const sh = this.game.renderer.shakeOffset();
    ctx.save();
    ctx.translate(-this.cameraX + sh.x, sh.y);

    for (const pit of this.pits) {
      const pg = ctx.createLinearGradient(0, pit.y, 0, pit.y + pit.h);
      pg.addColorStop(0, '#1a0d18'); pg.addColorStop(1, '#000');
      ctx.fillStyle = pg;
      ctx.fillRect(pit.x, pit.y, pit.w, pit.h);
      // hazard stripes at the rim
      ctx.fillStyle = '#ff4444';
      for (let sx = pit.x; sx < pit.x + pit.w; sx += 16) ctx.fillRect(sx, pit.y, 8, 4);
      ctx.fillStyle = '#ff6666';
      ctx.font = '11px system-ui';
      ctx.fillText(pit.label || 'Luka w CV', pit.x + 6, pit.y + 22);
    }

    for (const plat of [...this.platforms, ...this.movingPlatforms]) {
      const base = plat.color || '#4a6741';
      ctx.fillStyle = base;
      ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
      // lit top edge + shaded underside
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(plat.x, plat.y, plat.w, 3);
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.fillRect(plat.x, plat.y + plat.h - 3, plat.w, 3);
      if (plat.label) {
        ctx.fillStyle = '#222';
        ctx.font = 'bold 11px system-ui';
        ctx.fillText(plat.label, plat.x + 5, plat.y + 13);
      }
    }

    if (this.goal) {
      const gx = this.goal.x, gy = this.goal.y;
      ctx.save();
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 16;
      ctx.fillStyle = '#caa'; ctx.fillRect(gx, gy - 40, 4, this.goal.h + 40); // pole
      ctx.fillStyle = '#ffcc00';
      ctx.beginPath(); ctx.moveTo(gx + 4, gy - 40); ctx.lineTo(gx + 34, gy - 30); ctx.lineTo(gx + 4, gy - 20); ctx.closePath(); ctx.fill();
      ctx.restore();
      ctx.fillStyle = '#000'; ctx.font = 'bold 10px system-ui'; ctx.fillText('META', gx + 8, gy - 27);
    }

    if (this.hr) {
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(this.hr.x + this.hr.w / 2, this.hr.y + this.hr.h, this.hr.w * 0.5, 6, 0, 0, Math.PI * 2); ctx.fill();
      drawSprite(ctx, 'enemies/hr', this.hr.x, this.hr.y, this.hr.w, this.hr.h);
      if (this.hr.showBubble) {
        ctx.fillStyle = '#fff';
        ctx.fillRect(this.hr.x - 10, this.hr.y - 52, 210, 40);
        ctx.strokeStyle = '#999'; ctx.strokeRect(this.hr.x - 10, this.hr.y - 52, 210, 40);
        ctx.fillStyle = '#000';
        ctx.font = '12px system-ui';
        ctx.fillText('Gdzie Pan się widzi za 5 lat?', this.hr.x - 4, this.hr.y - 27);
      }
    }

    for (const b of this.bullets) {
      ctx.save();
      ctx.shadowColor = '#ff00ff'; ctx.shadowBlur = 8;
      ctx.fillStyle = '#ff55ff'; ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.restore();
    }

    const p = this.player;
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(p.x + p.w / 2, p.y + p.h, p.w * 0.5, 4, 0, 0, Math.PI * 2); ctx.fill();
    drawSprite(ctx, 'sprites/gienek', p.x, p.y, p.w, p.h);

    ctx.restore();

    if (this.survivalMode) {
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(W / 2 - 90, 12, 180, 30);
      ctx.strokeStyle = '#ff6688'; ctx.strokeRect(W / 2 - 90, 12, 180, 30);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`Przetrwaj: ${Math.ceil(this.survivalTimer)}s`, W / 2, 33);
      ctx.textAlign = 'left';
    }
  }
}
