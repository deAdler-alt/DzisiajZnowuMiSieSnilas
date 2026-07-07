import { QTEMode } from '../qte.js';
import { GameState } from '../utils.js';
import { STORY } from '../story.js';

export function createRoom4(game) {
  const room = { title: 'Studencka Noc' };

  room.enter = () => {
    game.dialogue.show(STORY.room4Intro, () => room.startQTE());
  };

  room.startQTE = () => {
    game.qte.start(QTEMode.HANGOVER, {
      maxRounds: 8,
      enemyHp: 24,
      onWin: () => {
        game.keys.najlepszaImpreza = true;
        game.dialogue.show(STORY.room4Key, () => game.enterRoom(4));
      },
      onFail: () => game.gameOver(),
    });
    game.updateMusic();
  };

  room.update = (dt) => {
    if (game.gameState === GameState.QTE_MODE) game.qte.update(dt);
  };

  room.draw = (ctx) => {
    if (game.gameState === GameState.QTE_MODE) game.qte.draw(ctx);
    game.renderer.drawRoomTitle(room.title);
  };

  return room;
}
