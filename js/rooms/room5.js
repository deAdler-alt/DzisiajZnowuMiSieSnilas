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
    game.combat.start(
      { name: 'J.M. Rektor', hp: 45, maxHp: 45, sprite: 'enemies/rektor', chain: true },
      {
        acts: [
          { id: 'zapomoga', label: 'Złóż podanie o zapomogę', short: 'Zapomoga' },
          { id: 'sesja', label: 'Poproś o przedłużenie sesji', short: 'Przedł. sesji' },
        ],
        spawnPattern: (dt) => game.combat.indeksPattern(dt),
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
      ctx.fillStyle = '#1a0a2e';
      ctx.fillRect(0, 0, W, H);
      drawSprite(ctx, 'enemies/rektor', 280, 120, 120, 120);
      drawSprite(ctx, 'sprites/gienek', 360, 300, 48, 48);
      ctx.fillStyle = '#ffcc00';
      for (let i = 0; i < 5; i++) ctx.strokeRect(270 + i * 8, 100, 24, 14);
      ctx.fillStyle = '#fff';
      ctx.font = '16px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('Gienek na tronie', W / 2, 380);
      ctx.textAlign = 'left';
      return;
    }

    if (room.endingStep === 'surprise' || room.endingStep === 'cake' || room.endingStep === 'choice') {
      ctx.fillStyle = '#fff5e6';
      ctx.fillRect(0, 0, W, H);
      drawSprite(ctx, 'ui/birthday-cake', W / 2 - 100, 180, 200, 160);
      ctx.fillStyle = '#ff0066';
      ctx.font = 'bold 28px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('NIESPODZIANKA!', W / 2, 120);
      ctx.fillStyle = '#333';
      ctx.font = 'bold 22px system-ui';
      ctx.fillText('WSZYSTKIEGO NAJLEPSZEGO GIENEK!', W / 2, 160);
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
