import { W, H } from './utils.js';
import { drawSprite } from './assets.js';

export class TitleScreen {
  constructor(game) {
    this.game = game;
    this.pulse = 0;
  }

  update(dt) {
    this.pulse += dt * 3;
    const inp = this.game.input;
    if (inp.consumePressed('m')) {
      const muted = this.game.audio.toggleMute();
      this.game.dialogue.show(muted ? 'Dźwięk wyłączony.' : 'Dźwięk włączony.');
    }
    if (inp.consumePressed('space') || inp.consumePressed('enter')) {
      if (!this.game.dialogue.active) {
        this.game.audio.playSfx('select');
        this.game.startIntroCrawl();
      }
    }
  }

  draw(ctx) {
    drawSprite(ctx, 'ui/title-bg', 0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 42px system-ui';
    ctx.fillText('Dzisiaj Znowu', W / 2, 140);
    ctx.fillStyle = '#ff66ff';
    ctx.fillText('Mi Się Śniłaś', W / 2, 190);
    ctx.fillStyle = '#ffcc00';
    ctx.font = 'italic 20px system-ui';
    ctx.fillText('Fur Gieno', W / 2, 230);
    const a = 0.5 + Math.sin(this.pulse) * 0.5;
    ctx.fillStyle = `rgba(255,255,255,${0.5 + a * 0.5})`;
    ctx.font = '18px system-ui';
    ctx.fillText('Naciśnij SPACJĘ aby rozpocząć', W / 2, 420);
    ctx.fillStyle = '#888';
    ctx.font = '14px system-ui';
    ctx.fillText(`[M] dźwięk: ${this.game.audio.muted ? 'WYŁ' : 'WŁ'}`, W / 2, 460);
    ctx.textAlign = 'left';
  }
}
