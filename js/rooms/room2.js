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
    const c = game.combat;
    game.combat.start(
      {
        name: 'Toxic Gracz LoL', hp: 30, maxHp: 30, sprite: 'enemies/toxic', shape: 'triangle',
        spareActs: ['mute', 'gank'],
        checkHint: 'Pisze po każdej śmierci na czacie. Wygląda na zmęczonego własną toksycznością.',
        spareText: 'Wyciszyłeś czat i pokazałeś, jak gra się z głową. Toxic wzdycha: „...gg. Może faktycznie jestem problemem.” Odpuszcza.',
      },
      {
        acts: [
          { id: 'mute', label: 'Zmutuj czat (osłabia ataki)', short: 'Zmutuj czat' },
          { id: 'gank', label: 'Wezwij na gank (obrażenia)', short: 'Wezwij na gank' },
        ],
        taunts: [
          'gg ez, jungle diff, reportujcie mi mida.',
          '?????? ktoś tu w ogóle wardował?',
          'ff15, gramy o nic, boty jedne.',
          'mute all i tak was wynoszę 1v9.',
          'ok ok, może... trochę przesadzam.',
        ],
        mercyHint: 'Krzykiem go nie uspokoisz. Najpierw wycisz czat, a potem pokaż mu prawdziwego ganka.',
        patterns: [
          (dt) => c.defaultPattern(dt),
          (dt) => c.aimedPattern(dt),
          (dt) => c.defaultPattern(dt),
          (dt) => c.wallPattern(dt),
        ],
        triggerQTEOnWin: true,
        onWin: () => {
          if (!room.smiteTriggered) {
            room.smiteTriggered = true;
            game.combat.bullets = [];
            game.dialogue.show(STORY.room2Smite, () => room.startSmite());
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
