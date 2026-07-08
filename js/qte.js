import { W, H, randInt, GameState } from './utils.js';
import { drawSprite } from './assets.js';

export const QTEMode = {
  SMITE: 'SMITE',
  HANGOVER: 'HANGOVER',
  FINAL: 'FINAL',
};

const KEY_LABELS = { w: 'W', a: 'A', s: 'S', d: 'D', space: 'SPACJA' };

export class QTESystem {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.mode = null;
    this.active = false;
    this.onWin = null;
    this.onFail = null;
    this.charge = 0;
    this.chargeSpeed = 0.7;
    this.greenStart = 0.55;
    this.greenEnd = 0.72;
    this.smiteAttempted = false;
    this.currentKey = null;
    this.keyTimer = 0;
    this.keyLimit = 0.85;
    this.round = 0;
    this.maxRounds = 8;
    this.enemyHp = 20;
    this.strobeTimer = 0;
    this.strobeOn = false;
    this.sequence = [];
    this.sequenceIndex = 0;
    this.sequenceTimer = 0;
    this.finalPhase = false;
    this.finalPrompt = '';
    this.message = '';
    this.messageTimer = 0;
  }

  start(mode, config = {}) {
    this.reset();
    this.mode = mode;
    this.active = true;
    this.onWin = config.onWin || null;
    this.onFail = config.onFail || null;
    this.maxRounds = config.maxRounds || 8;
    this.enemyHp = config.enemyHp || 20;
    this.game.gameState = GameState.QTE_MODE;
    if (mode === QTEMode.HANGOVER) this.nextKey();
    if (mode === QTEMode.FINAL) this.startFinalSequence(config);
  }

  startFinalSequence(config) {
    this.sequence = config.sequence || ['w', 'a', 's', 'd', 'space', 'd', 'w'];
    this.sequenceIndex = 0;
    this.sequenceTimer = 0;
    this.finalPhase = false;
    this.finalPrompt = '';
  }

  nextKey() {
    const keys = ['w', 'a', 's', 'd'];
    this.currentKey = keys[randInt(0, 3)];
    this.keyTimer = this.keyLimit;
  }

  update(dt) {
    if (!this.active) return;
    const inp = this.game.input;

    if (this.messageTimer > 0) {
      this.messageTimer -= dt;
      return;
    }

    if (this.mode === QTEMode.SMITE) this.updateSmite(dt, inp);
    else if (this.mode === QTEMode.HANGOVER) this.updateHangover(dt, inp);
    else if (this.mode === QTEMode.FINAL) this.updateFinal(dt, inp);
  }

  updateSmite(dt, inp) {
    this.charge += this.chargeSpeed * dt;
    if (this.charge > 1) this.charge = 0;
    if (inp.consumePressed('space')) {
      this.smiteAttempted = true;
      const hit = this.charge >= this.greenStart && this.charge <= this.greenEnd;
      if (hit) {
        this.active = false;
        this.game.audio?.playSfx('smite');
        if (this.onWin) this.onWin();
      } else {
        this.message = 'Spudłowany Smite! Spróbuj ponownie.';
        this.messageTimer = 1.5;
        this.game.damage(2);
        this.game.renderer.shake(6, 0.25);
      }
    }
  }

  updateHangover(dt, inp) {
    this.strobeTimer += dt;
    if (this.strobeTimer > 0.4) {
      this.strobeTimer = 0;
      this.strobeOn = !this.strobeOn;
    }

    this.keyTimer -= dt;
    if (this.currentKey && inp.consumePressed(this.currentKey)) {
      this.round++;
      this.enemyHp -= 3;
      this.game.audio?.playSfx('qte_success');
      if (this.round >= this.maxRounds || this.enemyHp <= 0) {
        this.active = false;
        if (this.onWin) this.onWin();
      } else {
        this.nextKey();
      }
    } else if (this.keyTimer <= 0) {
      this.game.damage(2);
      this.game.renderer.shake(6, 0.25);
      this.game.audio?.playSfx('qte_fail');
      this.message = 'Rozlano piwo! Kac uderza.';
      this.messageTimer = 1;
      this.enemyHp -= 1;
      if (this.game.hp <= 0) {
        this.active = false;
        if (this.onFail) this.onFail();
      } else if (this.round >= this.maxRounds || this.enemyHp <= 0) {
        this.active = false;
        if (this.onWin) this.onWin();
      } else {
        this.nextKey();
      }
    }
  }

  updateFinal(dt, inp) {
  if (!this.finalPhase) {
      this.sequenceTimer += dt;
      const expected = this.sequence[this.sequenceIndex];
      if (expected && inp.consumePressed(expected)) {
        this.sequenceIndex++;
        if (this.sequenceIndex >= this.sequence.length) {
          this.finalPhase = true;
          this.finalPrompt = 'Rektor szykuje ostateczny cios! Użyj Zgłoś na Komendę!';
        }
      } else {
        for (const k of ['w', 'a', 's', 'd', 'space']) {
          if (k !== expected && inp.consumePressed(k)) {
            this.game.damage(3);
            this.message = 'Zbyt wolno!';
            this.messageTimer = 1;
            break;
          }
        }
      }
    } else {
      if (inp.consumePressed('space')) {
        const combat = this.game.combat;
        if (!this.game.komendaUsed) {
          this.game.komendaUsed = true;
          this.game.renderer.flash('#ff0000', 0.3);
          setTimeout(() => this.game.renderer.flash('#0000ff', 0.3), 150);
          this.active = false;
          if (this.onWin) this.onWin();
        } else {
          this.game.heal(6);
          this.message = 'Instynkt przetrwania aktywny. Wypełnia cię determinacja.';
          this.messageTimer = 1.5;
          setTimeout(() => {
            this.active = false;
            if (this.onWin) this.onWin();
          }, 1600);
        }
      }
    }
  }

  draw(ctx) {
    if (!this.active) return;

    if (this.mode === QTEMode.HANGOVER) {
      const bg = ctx.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, H);
      if (this.strobeOn) { bg.addColorStop(0, '#4a4418'); bg.addColorStop(1, '#0e0e06'); }
      else { bg.addColorStop(0, '#26261c'); bg.addColorStop(1, '#0a0a0a'); }
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath(); ctx.ellipse(W / 2, 205, 55, 10, 0, 0, Math.PI * 2); ctx.fill();
      drawSprite(ctx, 'enemies/kac', W / 2 - 50, 100, 100, 100);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 20px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Potężny Kac', W / 2, 235);
      ctx.textAlign = 'left';
    } else if (this.mode === QTEMode.SMITE) {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#04263a'); bg.addColorStop(1, '#010a12');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 16;
      ctx.fillStyle = '#eafffb';
      ctx.font = 'bold 26px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('UŻYJ SMITE!', W / 2, 90);
      ctx.restore();
      ctx.textAlign = 'left';
    } else {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#2a0a3d'); bg.addColorStop(1, '#0d0316');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }

    if (this.mode === QTEMode.SMITE) {
      const barX = 150, barY = 250, barW = 500, barH = 40;
      ctx.fillStyle = '#333';
      ctx.fillRect(barX, barY, barW, barH);
      ctx.fillStyle = '#00ff00';
      ctx.fillRect(barX + barW * this.greenStart, barY, barW * (this.greenEnd - this.greenStart), barH);
      ctx.fillStyle = '#ffcc00';
      const cx = barX + barW * this.charge;
      ctx.fillRect(cx - 4, barY - 5, 8, barH + 10);
      ctx.fillStyle = '#fff';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('[SPACJA] w zielonej strefie!', W / 2, barY + 80);
      ctx.textAlign = 'left';
    }

    if (this.mode === QTEMode.HANGOVER && this.currentKey) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,204,0,0.5)';
      ctx.lineWidth = 3;
      ctx.strokeRect(W / 2 - 45, H / 2 - 45, 90, 90);
      ctx.shadowColor = '#ffcc00';
      ctx.shadowBlur = 22;
      ctx.fillStyle = '#ffe066';
      ctx.font = 'bold 72px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(KEY_LABELS[this.currentKey], W / 2, H / 2 + 26);
      ctx.restore();
      ctx.textAlign = 'left';
      const barW = 300;
      ctx.fillStyle = '#333';
      ctx.fillRect(W / 2 - barW / 2, H / 2 + 60, barW, 12);
      ctx.fillStyle = this.keyTimer > 0.3 ? '#0f0' : '#f00';
      ctx.fillRect(W / 2 - barW / 2, H / 2 + 60, barW * (this.keyTimer / this.keyLimit), 12);
      ctx.fillStyle = '#aaa';
      ctx.font = '14px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(`Runda ${this.round + 1}/${this.maxRounds}`, W / 2, H / 2 + 100);
      ctx.textAlign = 'left';
    }

    if (this.mode === QTEMode.FINAL) {
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      if (!this.finalPhase) {
        const expected = this.sequence[this.sequenceIndex];
        ctx.fillText('Szybkie QTE!', W / 2, 100);
        if (expected) {
          ctx.save();
          ctx.shadowColor = '#ff00ff';
          ctx.shadowBlur = 22;
          ctx.font = 'bold 64px system-ui';
          ctx.fillStyle = '#ff66ff';
          ctx.fillText(KEY_LABELS[expected] || expected.toUpperCase(), W / 2, H / 2);
          ctx.restore();
        }
        ctx.font = '14px system-ui';
        ctx.fillStyle = '#aaa';
        ctx.fillText(`${this.sequenceIndex + 1}/${this.sequence.length}`, W / 2, H / 2 + 60);
      } else {
        ctx.fillText(this.finalPrompt, W / 2, H / 2 - 20);
        ctx.font = 'bold 24px system-ui';
        ctx.fillStyle = '#00ffcc';
        ctx.fillText('[SPACJA] — ostateczna obrona!', W / 2, H / 2 + 40);
      }
      ctx.textAlign = 'left';
    }

    if (this.messageTimer > 0) {
      ctx.fillStyle = '#ff6666';
      ctx.font = '18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText(this.message, W / 2, H - 60);
      ctx.textAlign = 'left';
    }
  }
}
