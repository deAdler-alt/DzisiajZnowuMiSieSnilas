import { QTEMode } from '../qte.js';
import { GameState, W, H } from '../utils.js';
import { STORY } from '../story.js';
import { drawSprite } from '../assets.js';

export function createRoom5(game) {
  const room = {
    title: 'Tron Rektorski',
    phase: 0,
    endingStep: null,
    fadeTimer: 0,
  };

  room.enter = () => {
    room.phase = 0;
    room.endingStep = null;
    game.dialogue.show(STORY.room5Intro, () => room.startPhase1());
  };

  room.startPhase1 = () => {
    if (room.phase >= 1) return;
    room.phase = 1;
    const c = game.combat;
    game.combat.start(
      {
        name: 'J.M. Rektor', hp: 46, maxHp: 46, sprite: 'enemies/rektor', chain: true,
        checkHint: 'Za łańcuchem widać zmęczonego człowieka, który po prostu chce mieć porządek w indeksach.',
      },
      {
        acts: [
          { id: 'zapomoga', label: 'Złóż podanie o zapomogę (+HP)', short: 'Zapomoga' },
          { id: 'sesja', label: 'Poproś o przedłużenie sesji (spowolnij)', short: 'Przedł. sesji' },
        ],
        taunts: [
          'Punkty ECTS się nie naliczą, panie Gienku!',
          'Podanie odrzucone. Brak podpisu dziekana.',
          'Regulamin studiów, paragraf 12, ustęp 4!',
          'Sesja poprawkowa trwa wiecznie...',
          'Łańcuch rektorski to nie zabawka!',
        ],
        patterns: [
          (dt) => c.indeksPattern(dt),
          (dt) => c.aimedPattern(dt),
          (dt) => c.indeksPattern(dt),
          (dt) => c.wallPattern(dt),
        ],
        onWin: () => room.startPhase2(),
        onLose: () => game.gameOver(),
      }
    );
    game.updateMusic();
  };

  room.startPhase2 = () => {
    if (room.phase >= 2) return;
    room.phase = 2;
    game.combat.reset();
    game.dialogue.show(STORY.room5Phase2, () => {
      game.gameState = GameState.PLATFORMER_2D;
      const groundY = 480;
      game.platformer.start({
        levelWidth: 800,
        survivalMode: true,
        survivalTime: 10,
        platforms: [
          { x: 0, y: groundY, w: 200, h: 40 },
          { x: 250, y: groundY, w: 150, h: 40 },
          { x: 450, y: groundY, w: 150, h: 40 },
          { x: 650, y: groundY, w: 150, h: 40 },
        ],
        pits: [],
        spawnX: 80,
        spawnY: groundY - 32,
        onWin: () => {
          if (room.phase >= 3) return;
          game.dialogue.show(STORY.room5Phase3, () => room.startPhase3());
        },
      });
      game.updateMusic();
    });
  };

  room.startPhase3 = () => {
    if (room.phase >= 3) return;
    room.phase = 3;
    game.platformer.reset();
    game.qte.start(QTEMode.FINAL, {
      sequence: ['w', 'a', 's', 'd', 'space', 'd', 'a'],
      onWin: () => room.startEnding(),
    });
    game.updateMusic();
  };

  room.startEnding = () => {
    if (room.phase >= 4) return;
    room.phase = 4;
    room.endingStep = 'throne';
    room.fadeTimer = 0;
    game.gameState = GameState.ENDING;
    game.combat.reset();
    game.platformer.reset();
    game.qte.reset();
    game.input.enabled = true;
    game.audio.playMusic('ending');
    game.dialogue.show(STORY.endingThrone, () => room.beginSurpriseFade());
  };

  room.beginSurpriseFade = () => {
    room.endingStep = 'fading';
    room.fadeTimer = 0;
    game.renderer.setFade(1);
  };

  room.showSurprise = () => {
    room.endingStep = 'surprise';
    game.renderer.setFade(0);
    game.dialogue.show(STORY.endingSurprise, () => room.showFinalChoice());
  };

  room.showFinalChoice = () => {
    room.endingStep = 'cake';
    game.dialogue.show(STORY.endingFinal, () => {
      room.endingStep = 'choice';
      game.input.enabled = true;
    });
  };

  room.handleEndingInput = () => {
    if (room.phase !== 4 || room.endingStep !== 'choice' || game.dialogue.active) return false;
    if (game.input.consumePressed('r')) {
      game.goToTitle();
      return true;
    }
    if (game.input.consumePressed('c')) {
      game.startCredits();
      return true;
    }
    return false;
  };

  room.update = (dt) => {
    if (room.phase === 1 && game.gameState === GameState.COMBAT_BULLETHELL) {
      game.combat.update(dt);
    } else if (room.phase === 2 && game.gameState === GameState.PLATFORMER_2D) {
      game.platformer.update(dt);
    } else if (room.phase === 3 && game.gameState === GameState.QTE_MODE) {
      game.qte.update(dt);
    } else if (room.phase === 4) {
      if (room.endingStep === 'fading') {
        room.fadeTimer += dt;
        if (room.fadeTimer >= 0.6) room.showSurprise();
      }
      room.handleEndingInput();
    }
  };

  room.draw = (ctx) => {
    if (room.phase === 1 && game.gameState === GameState.COMBAT_BULLETHELL) {
      game.combat.draw(ctx);
    } else if (room.phase === 2 && game.gameState === GameState.PLATFORMER_2D) {
      game.platformer.draw(ctx);
    } else if (room.phase === 3 && game.gameState === GameState.QTE_MODE) {
      game.qte.draw(ctx);
    } else if (room.phase === 4) {
      room.drawEnding(ctx);
    }
    if (room.phase < 4) game.renderer.drawRoomTitle(room.title);
  };

  room.drawEnding = (ctx) => {
    if (room.endingStep === 'throne' || room.endingStep === 'fading') {
      const bg = ctx.createRadialGradient(W / 2, 220, 60, W / 2, 220, 400);
      bg.addColorStop(0, '#2a1450'); bg.addColorStop(1, '#0c0618');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // throne
      ctx.fillStyle = '#3a2a55';
      ctx.fillRect(W / 2 - 70, 230, 140, 150);
      ctx.fillStyle = '#4d3a70';
      ctx.fillRect(W / 2 - 70, 120, 30, 260);
      ctx.fillRect(W / 2 + 40, 120, 30, 260);
      ctx.save();
      ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 14;
      ctx.fillStyle = '#ffcc00';
      for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(W / 2 - 48 + i * 24, 118, 7, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
      drawSprite(ctx, 'sprites/gienek', W / 2 - 24, 268, 52, 52);
      // golden chain glow across the shoulders
      ctx.save();
      ctx.shadowColor = '#ffd700'; ctx.shadowBlur = 10;
      ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(W / 2, 300, 22, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
      ctx.restore();
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 18px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Rektor Gienek zasiada na tronie...', W / 2, 420);
      ctx.textAlign = 'left';
      return;
    }

    if (room.endingStep === 'surprise' || room.endingStep === 'cake' || room.endingStep === 'choice') {
      const bg = ctx.createRadialGradient(W / 2, H / 2, 60, W / 2, H / 2, H);
      bg.addColorStop(0, '#fff9ec'); bg.addColorStop(1, '#ffe3b0');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      // confetti
      const t = performance.now() / 1000;
      const colors = ['#ff0066', '#00ccff', '#ffcc00', '#66ff66', '#ff66ff'];
      for (let i = 0; i < 60; i++) {
        const cx = (i * 79 + Math.sin(t + i) * 20) % W;
        const cy = ((i * 53 + t * 60 * (1 + (i % 3) * 0.3)) % (H + 20)) - 10;
        ctx.fillStyle = colors[i % colors.length];
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(t * 2 + i);
        ctx.fillRect(-3, -3, 6, 6);
        ctx.restore();
      }
      ctx.save();
      ctx.shadowColor = '#ffcc00'; ctx.shadowBlur = 24;
      drawSprite(ctx, 'ui/birthday-cake', W / 2 - 100, 200, 200, 160);
      ctx.restore();
      ctx.save();
      ctx.shadowColor = '#ff0066'; ctx.shadowBlur = 12;
      ctx.fillStyle = '#ff0066';
      ctx.font = 'bold 34px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('NIESPODZIANKA!', W / 2, 110);
      ctx.restore();
      ctx.fillStyle = '#3a2a10';
      ctx.font = 'bold 22px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('WSZYSTKIEGO NAJLEPSZEGO, GIENEK!', W / 2, 152);
      ctx.font = '15px system-ui';
      ctx.fillStyle = '#6a5230';
      ctx.fillText('Sto lat i niech loss zawsze Ci spada.', W / 2, 180);
      ctx.textAlign = 'left';
    }

    if (room.endingStep === 'choice' && !game.dialogue.active) {
      ctx.fillStyle = 'rgba(0,0,0,0.75)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('KONIEC PRZYGODY', W / 2, H / 2 - 30);
      ctx.font = '18px system-ui';
      ctx.fillText('[R] Zacznij od początku', W / 2, H / 2 + 10);
      ctx.fillText('[C] Napisy końcowe', W / 2, H / 2 + 40);
      ctx.textAlign = 'left';
    }
  };

  return room;
}
