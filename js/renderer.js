import { W, H, UI_MARGIN, fitText, GameState } from './utils.js';

export class Renderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.flashColor = null;
    this.flashAlpha = 0;
    this.fadeAlpha = 0;
    this.fadeTarget = 0;
    this.fadeSpeed = 2;
  }

  clear(bg = '#1a1a2e') {
    const { ctx } = this;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  drawHUD(game) {
    if (game.gameState === GameState.TITLE_SCREEN || game.gameState === GameState.INTRO_CRAWL
      || game.gameState === GameState.CREDITS || game.gameState === GameState.LOADING) return;
    const { ctx } = this;
    const hudH = 52;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(0, 0, W, hudH);
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 13px system-ui';
    ctx.fillText(`HP: ${game.hp}/${game.maxHp}`, UI_MARGIN, 18);
    ctx.fillStyle = '#ffcc00';
    ctx.fillText(`Pokój: ${game.roomIndex + 1}/5`, 110, 18);
    const items = [];
    if (game.inventory.tabletka) items.push(`Tabletka x${game.inventory.tabletka}`);
    if (game.inventory.pepsi) items.push(`Pepsi x${game.inventory.pepsi}`);
    ctx.fillStyle = '#ccc';
    ctx.font = '12px system-ui';
    ctx.fillText(fitText(ctx, items.join(' | ') || 'Brak przedmiotów', W - 220), UI_MARGIN, 38);
    const keys = [];
    if (game.keys.pierwszyTurniej) keys.push('Turniej');
    if (game.keys.pierwszaPraca) keys.push('Praca');
    if (game.keys.najlepszaImpreza) keys.push('Impreza');
    if (keys.length) {
      ctx.fillStyle = '#ff66ff';
      ctx.font = '11px system-ui';
      const keyText = 'Klucze: ' + keys.join(' · ');
      ctx.fillText(fitText(ctx, keyText, W - UI_MARGIN * 2), UI_MARGIN, H - 8);
    }
  }

  drawRoomTitle(title) {
    const { ctx } = this;
    const tw = Math.min(360, W - 40);
    ctx.fillStyle = 'rgba(0,0,0,0.55)';
    ctx.fillRect(W / 2 - tw / 2, 56, tw, 28);
    ctx.strokeStyle = '#ff00ff';
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - tw / 2, 56, tw, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 14px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(fitText(ctx, title, tw - 16), W / 2, 75);
    ctx.textAlign = 'left';
  }

  drawText(text, x, y, color = '#fff', size = 16, align = 'left') {
    const { ctx } = this;
    ctx.fillStyle = color;
    ctx.font = `${size}px system-ui`;
    ctx.textAlign = align;
    ctx.fillText(text, x, y);
    ctx.textAlign = 'left';
  }

  flash(color, duration = 0.4) {
    this.flashColor = color;
    this.flashAlpha = 1;
    this.flashDuration = duration;
    this.flashTimer = 0;
  }

  setFade(target) {
    this.fadeTarget = target;
  }

  update(dt) {
    if (this.flashAlpha > 0) {
      this.flashTimer += dt;
      this.flashAlpha = Math.max(0, 1 - this.flashTimer / this.flashDuration);
    }
    if (this.fadeAlpha !== this.fadeTarget) {
      const dir = this.fadeTarget > this.fadeAlpha ? 1 : -1;
      this.fadeAlpha += dir * this.fadeSpeed * dt;
      if (dir > 0) this.fadeAlpha = Math.min(this.fadeAlpha, this.fadeTarget);
      else this.fadeAlpha = Math.max(this.fadeAlpha, this.fadeTarget);
    }
  }

  drawOverlays() {
    const { ctx } = this;
    if (this.flashAlpha > 0 && this.flashColor) {
      ctx.fillStyle = this.flashColor;
      ctx.globalAlpha = this.flashAlpha * 0.6;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
    if (this.fadeAlpha > 0) {
      ctx.fillStyle = '#000';
      ctx.globalAlpha = this.fadeAlpha;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }
  }

  drawNeonBox(x, y, w, h, color = '#00ffcc') {
    const { ctx } = this;
    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(x + 4, y + 4, w - 8, h - 8);
  }
}
