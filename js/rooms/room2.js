import { QTEMode } from '../qte.js';
import { GameState } from '../utils.js';
import { STORY } from '../story.js';

export function createRoom2(game) {
  const room = { title: 'Kraina Ligi', smiteTriggered: false };

  room.enter = () => {
    room.smiteTriggered = false;
    game.dialogue.show(STORY.room2Intro, () => room.startCombat());
  };

  room.startCombat = () => {
    game.combat.start(
      { name: 'Toxic Gracz LoL', hp: 28, maxHp: 28, sprite: 'enemies/toxic', shape: 'triangle' },
      {
        acts: [
          { id: 'mute', label: 'Zmutuj czat', short: 'Zmutuj czat' },
          { id: 'gank', label: 'Wezwij na gank', short: 'Gank' },
        ],
        triggerQTEOnWin: true,
        onWin: () => {
          if (!room.smiteTriggered) {
            room.smiteTriggered = true;
            game.combat.bullets = [];
            game.dialogue.show('Smite gotowy! Traf w zieloną strefę!', () => room.startSmite());
          }
        },
        onLose: () => game.gameOver(),
      }
    );
    game.updateMusic();
  };

  room.startSmite = () => {
    game.qte.start(QTEMode.SMITE, {
      onWin: () => {
        game.keys.pierwszyTurniej = true;
        game.audio.playSfx('smite');
        game.dialogue.show(STORY.room2Key, () => game.enterRoom(2));
      },
    });
  };

  room.update = (dt) => {
    if (game.gameState === GameState.COMBAT_BULLETHELL) game.combat.update(dt);
    else if (game.gameState === GameState.QTE_MODE) game.qte.update(dt);
  };

  room.draw = (ctx) => {
    if (game.gameState === GameState.COMBAT_BULLETHELL) game.combat.draw(ctx);
    else if (game.gameState === GameState.QTE_MODE) game.qte.draw(ctx);
    game.renderer.drawRoomTitle(room.title);
  };

  return room;
}
