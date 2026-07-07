import { W, H, aabb, GameState } from '../utils.js';
import { drawSprite } from '../assets.js';
import { STORY } from '../story.js';

const TILE = 32;

export function createRoom1(game) {
  const room = {
    title: 'Stare Śmieci',
    player: { x: 3 * TILE, y: 5 * TILE, w: 24, h: 24, speed: 120 },
    map: buildMap(),
    interactables: [
      { x: 2 * TILE, y: 2 * TILE, w: TILE, h: TILE, id: 'server', used: false, storyKey: 'server' },
      { x: 8 * TILE, y: 2 * TILE, w: TILE, h: TILE, id: 'python', used: false, storyKey: 'python' },
      { x: 5 * TILE, y: 2 * TILE, w: TILE, h: TILE, id: 'lol', used: false, storyKey: 'lol' },
      { x: 10 * TILE, y: 6 * TILE, w: 16, h: 16, id: 'tabletka1', pickup: 'tabletka', collected: false },
      { x: 3 * TILE, y: 8 * TILE, w: 16, h: 16, id: 'tabletka2', pickup: 'tabletka', collected: false },
      { x: 7 * TILE, y: 7 * TILE, w: 16, h: 16, id: 'pepsi', pickup: 'pepsi', collected: false },
      { x: 17 * TILE, y: 5 * TILE, w: TILE, h: TILE * 2, id: 'door', isDoor: true },
    ],
  };

  function buildMap() {
    const cols = 20, rows = 12;
    const m = [];
    for (let y = 0; y < rows; y++) {
      m[y] = [];
      for (let x = 0; x < cols; x++) {
        if (x === 0 || y === 0 || x === cols - 1 || y === rows - 1) m[y][x] = 1;
        else if (x === 17 && y >= 4 && y <= 6) m[y][x] = 0;
        else m[y][x] = 0;
      }
    }
    m[4][6] = 1; m[4][7] = 1; m[4][8] = 1;
    m[8][10] = 1; m[8][11] = 1;
    return m;
  }

  room.enter = () => {
    game.gameState = GameState.EXPLORATION_TOPDOWN;
    game.updateMusic();
    game.dialogue.show(STORY.room1Intro);
  };

  room.update = (dt) => {
    if (game.dialogue.active || game.paused) return;
    const p = room.player;
    const mv = game.input.movementVector();
    const nx = p.x + mv.x * p.speed * dt;
    const ny = p.y + mv.y * p.speed * dt;
    if (!collides(nx, p.y, p.w, p.h, room.map)) p.x = nx;
    if (!collides(p.x, ny, p.w, p.h, room.map)) p.y = ny;

    if (game.input.consumePressed('space')) {
      for (const obj of room.interactables) {
        if (near(p, obj) || aabb(p.x, p.y, p.w, p.h, obj.x, obj.y, obj.w, obj.h)) {
          if (obj.pickup && !obj.collected) {
            obj.collected = true;
            game.inventory[obj.pickup]++;
            game.audio.playSfx('select');
            game.dialogue.show(`Znalazłeś: ${obj.pickup === 'tabletka' ? 'Tabletkę' : 'Pepsi'}!`);
          } else if (obj.isDoor) {
            if (game.inventory.tabletka >= 2 && game.inventory.pepsi >= 1) {
              game.audio.playSfx('door_open');
              game.dialogue.show('Drzwi się otwierają! Kraina Ligi czeka...', () => game.enterRoom(1));
            } else {
              game.dialogue.show('Drzwi zamknięte. Potrzebujesz 2x Tabletki i 1x Pepsi.');
            }
          } else if (obj.storyKey && STORY[obj.storyKey]) {
            if (!obj.used) obj.used = true;
            game.dialogue.show(STORY[obj.storyKey]);
          }
          break;
        }
      }
    }
  };

  room.draw = (ctx) => {
    ctx.fillStyle = '#1e1830';
    ctx.fillRect(0, 0, W, H);
    const map = room.map;
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tx = x * TILE, ty = y * TILE + 48;
        if (map[y][x] === 1) {
          ctx.fillStyle = '#4a3a6a';
          ctx.fillRect(tx, ty, TILE, TILE);
        } else {
          ctx.fillStyle = (x + y) % 2 ? '#3a3050' : '#352848';
          ctx.fillRect(tx, ty, TILE, TILE);
        }
      }
    }
    for (const obj of room.interactables) {
      if (obj.collected) continue;
      const oy = obj.y + 48;
      if (obj.id === 'server') { ctx.fillStyle = '#555'; ctx.fillRect(obj.x, oy, obj.w, obj.h); }
      else if (obj.id === 'python') { ctx.fillStyle = '#336633'; ctx.fillRect(obj.x, oy, obj.w, obj.h); }
      else if (obj.id === 'lol') { ctx.fillStyle = '#c9a227'; ctx.fillRect(obj.x, oy, obj.w, obj.h); }
      else if (obj.pickup === 'tabletka') { ctx.fillStyle = '#fff'; ctx.fillRect(obj.x, oy, obj.w, obj.h); }
      else if (obj.pickup === 'pepsi') { ctx.fillStyle = '#0044aa'; ctx.fillRect(obj.x, oy, obj.w, obj.h); }
      else if (obj.isDoor) {
        const open = game.inventory.tabletka >= 2 && game.inventory.pepsi >= 1;
        ctx.fillStyle = open ? '#8B4513' : '#444';
        ctx.fillRect(obj.x, oy, obj.w, obj.h);
        ctx.fillStyle = '#ffcc00';
        ctx.font = '11px system-ui';
        ctx.fillText(open ? 'WYJŚCIE' : 'ZAMKN.', obj.x, obj.y + 44);
      }
    }
    const p = room.player;
    drawSprite(ctx, 'sprites/gienek', p.x, p.y + 48, p.w, p.h);
    game.renderer.drawRoomTitle(room.title);
  };

  return room;
}

function collides(x, y, w, h, map) {
  const margin = 2;
  const points = [[x + margin, y + margin], [x + w - margin, y + margin], [x + margin, y + h - margin], [x + w - margin, y + h - margin]];
  for (const [px, py] of points) {
    const tx = Math.floor(px / TILE);
    const ty = Math.floor((py - 48) / TILE);
    if (ty < 0 || ty >= map.length || tx < 0 || tx >= map[0].length) return true;
    if (map[ty][tx] === 1) return true;
  }
  return false;
}

function near(p, obj) {
  const dx = (p.x + p.w / 2) - (obj.x + obj.w / 2);
  const dy = (p.y + p.h / 2) - (obj.y + obj.h / 2);
  return Math.hypot(dx, dy) < 40;
}
