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
    // darken vignette for readable text
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, 'rgba(5,0,15,0.75)');
    grad.addColorStop(0.5, 'rgba(5,0,15,0.35)');
    grad.addColorStop(1, 'rgba(5,0,15,0.85)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    // main logo with neon glow
    ctx.save();
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 28;
    ctx.fillStyle = '#00ffcc';
    ctx.font = 'bold 88px system-ui';
    ctx.fillText('B-DAY', W / 2, 165);
    ctx.shadowColor = '#ff44dd';
    ctx.fillStyle = '#ff66ff';
    ctx.font = 'italic bold 60px Georgia, serif';
    ctx.fillText('Story', W / 2, 230);
    ctx.restore();

    // subtitle
    ctx.fillStyle = '#ffcc00';
    ctx.font = '18px system-ui';
    ctx.fillText('Epizod I: Łańcuch Rektora', W / 2, 268);

    // pulsing prompt inside a soft panel
    const a = 0.55 + Math.sin(this.pulse) * 0.45;
    ctx.save();
    ctx.shadowColor = '#ffffff';
    ctx.shadowBlur = 10 * a;
    ctx.fillStyle = `rgba(255,255,255,${0.55 + a * 0.45})`;
    ctx.font = 'bold 20px system-ui';
    ctx.fillText('Naciśnij SPACJĘ, aby rozpocząć', W / 2, 430);
    ctx.restore();

    ctx.fillStyle = '#7a7a8a';
    ctx.font = '13px system-ui';
    ctx.fillText(`[M] dźwięk: ${this.game.audio.muted ? 'WYŁ' : 'WŁ'}   ·   [P] pauza w grze`, W / 2, 464);
    ctx.textAlign = 'left';
  }
}
