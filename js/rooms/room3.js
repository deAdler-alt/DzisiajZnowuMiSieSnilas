import { GameState } from '../utils.js';
import { STORY } from '../story.js';

export function createRoom3(game) {
  const room = { title: 'Wspinaczka po Karierze' };

  room.enter = () => {
    game.dialogue.show(STORY.room3Intro, () => room.startPlatformer());
  };

  room.startPlatformer = () => {
    game.gameState = GameState.PLATFORMER_2D;
    const groundY = 480;
    game.platformer.start({
      levelWidth: 2200,
      platforms: [
        { x: 0, y: groundY, w: 400, h: 40 },
        { x: 500, y: groundY, w: 200, h: 40 },
        { x: 800, y: groundY, w: 150, h: 40 },
        { x: 1050, y: groundY, w: 200, h: 40 },
        { x: 1350, y: groundY, w: 300, h: 40 },
        { x: 1750, y: groundY, w: 450, h: 40 },
        { x: 350, y: 400, w: 80, h: 16, color: '#ddd', label: 'CV' },
        { x: 650, y: 360, w: 80, h: 16, color: '#ddd', label: 'List' },
        { x: 950, y: 380, w: 80, h: 16, color: '#ddd', label: 'Umowa' },
        { x: 1200, y: 350, w: 80, h: 16, color: '#ddd', label: 'NDA' },
        { x: 1500, y: 400, w: 80, h: 16, color: '#ddd', label: 'Oferta' },
      ],
      pits: [
        { x: 400, y: groundY, w: 100, h: 120, label: 'Luka w CV' },
        { x: 700, y: groundY, w: 100, h: 120, label: 'Luka w CV' },
        { x: 950, y: groundY, w: 100, h: 120, label: 'Luka w CV' },
        { x: 1250, y: groundY, w: 100, h: 120, label: 'Luka w CV' },
        { x: 1650, y: groundY, w: 100, h: 120, label: 'Luka w CV' },
      ],
      movingPlatforms: [
        { x: 550, y: 420, w: 70, h: 14, vx: 50, minX: 520, maxX: 650, color: '#eee', label: 'Dokument' },
        { x: 1100, y: 400, w: 70, h: 14, vx: -60, minX: 1050, maxX: 1180, color: '#eee', label: 'Dokument' },
      ],
      hr: { x: 200, y: groundY - 100, w: 80, h: 100, showBubble: false, bubbleTimer: 0 },
      goal: { x: 2050, y: groundY - 50, w: 40, h: 50 },
      spawnX: 60,
      spawnY: groundY - 32,
      onWin: () => {
        game.keys.pierwszaPraca = true;
        game.dialogue.show(STORY.room3Key, () => game.enterRoom(3));
      },
    });
    game.updateMusic();
  };

  room.update = (dt) => {
    if (game.gameState === GameState.PLATFORMER_2D) game.platformer.update(dt);
  };

  room.draw = (ctx) => {
    if (game.gameState === GameState.PLATFORMER_2D) game.platformer.draw(ctx);
    game.renderer.drawRoomTitle(room.title);
  };

  return room;
}
