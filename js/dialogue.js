import { W, H, UI_MARGIN } from './utils.js';
import { drawPortrait } from './assets.js';

export class Dialogue {
  constructor(game) {
    this.game = game;
    this.active = false;
    this.lines = [];
    this.index = 0;
    this.charIndex = 0;
    this.timer = 0;
    this.speed = 0.028;
    this.onComplete = null;
    this.speaker = '';
    this.blipCounter = 0;
  }

  show(lines, onComplete) {
    this.lines = Array.isArray(lines) ? lines : [{ speaker: '', text: lines }];
    this.lines = this.lines.map(l => typeof l === 'string' ? { speaker: '', text: l } : l);
    this.index = 0;
    this.charIndex = 0;
    this.timer = 0;
    this.active = true;
    this.onComplete = onComplete || null;
    this.speaker = this.lines[0]?.speaker || '';
    this.game.paused = true;
    this.blipCounter = 0;
  }

  get currentLine() {
    const line = this.lines[this.index];
    if (!line) return '';
    return line.text.slice(0, Math.floor(this.charIndex));
  }

  get isComplete() {
    const line = this.lines[this.index];
    return this.charIndex >= (line?.text?.length || 0);
  }

  update(dt) {
    if (!this.active) return;
    const line = this.lines[this.index];
    const text = line?.text || '';
    if (!this.isComplete) {
      this.timer += dt;
      while (this.timer >= this.speed && this.charIndex < text.length) {
        this.timer -= this.speed;
        this.charIndex++;
        this.blipCounter++;
        if (this.blipCounter % 3 === 0) this.game.audio?.playSfx('dialogue_blip');
      }
    }
    if (this.game.input.consumePressed('space') || this.game.input.consumePressed('enter')) {
      this.game.audio?.playSfx('select');
      if (!this.isComplete) {
        this.charIndex = text.length;
      } else {
        this.index++;
        if (this.index >= this.lines.length) {
          this.active = false;
          this.game.paused = false;
          const cb = this.onComplete;
          this.onComplete = null;
          if (cb) cb();
        } else {
          this.charIndex = 0;
          this.timer = 0;
          this.speaker = this.lines[this.index]?.speaker || '';
        }
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;
    const portraitSize = 96;
    const boxH = 150;
    const y = H - boxH - UI_MARGIN;
    const boxW = W - UI_MARGIN * 2;
    ctx.fillStyle = 'rgba(6,8,16,0.92)';
    ctx.fillRect(UI_MARGIN, y, boxW, boxH);
    ctx.save();
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 12;
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 3;
    ctx.strokeRect(UI_MARGIN, y, boxW, boxH);
    ctx.restore();
    const textX = UI_MARGIN + (this.speaker ? portraitSize + 20 : 14);
    const textW = boxW - (this.speaker ? portraitSize + 34 : 28);
    if (this.speaker) {
      drawPortrait(ctx, this.speaker, UI_MARGIN + 10, y + 12, portraitSize);
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 15px system-ui';
      ctx.fillText(this.speaker, textX, y + 28);
    }
    ctx.fillStyle = '#ffffff';
    ctx.font = '17px system-ui';
    this._wrapText(ctx, this.currentLine, textX, y + (this.speaker ? 50 : 34), textW, 22);
    if (this.isComplete) {
      ctx.fillStyle = '#888';
      ctx.font = '13px system-ui';
      ctx.fillText('[SPACJA] kontynuuj', textX, y + boxH - 14);
    }
  }

  _wrapText(ctx, text, x, y, maxW, lineH) {
    const words = text.split(' ');
    let line = '';
    let cy = y;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, cy);
        line = word;
        cy += lineH;
        if (cy > y + lineH * 4) break;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, cy);
  }
}
