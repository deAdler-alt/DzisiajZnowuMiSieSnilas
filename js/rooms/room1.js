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
      { x: 13 * TILE, y: 2 * TILE, w: TILE, h: TILE, id: 'whiteboard', used: false, storyKey: 'whiteboard' },
      { x: 15 * TILE, y: 8 * TILE, w: TILE, h: TILE, id: 'trophy', used: false, storyKey: 'trophy' },
      { x: 12 * TILE, y: 9 * TILE, w: TILE, h: TILE, id: 'coffee', used: false, storyKey: 'coffee' },
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
            game.audio.playSfx('pickup');
            game.dialogue.show(`Znalazłeś: ${obj.pickup === 'tabletka' ? 'Tabletkę' : 'Pepsi'}! (dodano do plecaka)`);
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
    const grad = ctx.createLinearGradient(0, 48, 0, H);
    grad.addColorStop(0, '#241c3a');
    grad.addColorStop(1, '#140f22');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    const map = room.map;
    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        const tx = x * TILE, ty = y * TILE + 48;
        if (map[y][x] === 1) {
          // wall block with lit top edge + shaded bottom
          ctx.fillStyle = '#4a3a6a';
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.fillStyle = '#5f4d84';
          ctx.fillRect(tx, ty, TILE, 5);
          ctx.fillStyle = '#33264d';
          ctx.fillRect(tx, ty + TILE - 4, TILE, 4);
        } else {
          ctx.fillStyle = (x + y) % 2 ? '#332a4c' : '#2c2342';
          ctx.fillRect(tx, ty, TILE, TILE);
          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.strokeRect(tx + 0.5, ty + 0.5, TILE - 1, TILE - 1);
        }
      }
    }
    const pulse = 0.5 + Math.sin(performance.now() / 300) * 0.5;
    for (const obj of room.interactables) {
      if (obj.collected) continue;
      const oy = obj.y + 48;
      // soft ground shadow under every object
      ctx.fillStyle = 'rgba(0,0,0,0.28)';
      ctx.beginPath();
      ctx.ellipse(obj.x + obj.w / 2, oy + obj.h + 2, obj.w * 0.55, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      if (obj.id === 'server') {
        ctx.fillStyle = '#4a4a52'; ctx.fillRect(obj.x, oy, obj.w, obj.h);
        ctx.fillStyle = '#22cc66'; for (let i = 0; i < 3; i++) ctx.fillRect(obj.x + 5, oy + 6 + i * 8, 6, 3);
        ctx.fillStyle = '#111'; ctx.fillRect(obj.x + 4, oy + obj.h - 8, obj.w - 8, 4);
      }
      else if (obj.id === 'python') {
        ctx.fillStyle = '#2b2b3a'; ctx.fillRect(obj.x, oy, obj.w, obj.h);
        ctx.fillStyle = '#3572A5'; ctx.fillRect(obj.x + 4, oy + 5, obj.w - 8, 5);
        ctx.fillStyle = '#FFD43B'; ctx.fillRect(obj.x + 4, oy + 13, obj.w - 12, 4);
      }
      else if (obj.id === 'lol') {
        ctx.fillStyle = '#1b2733'; ctx.fillRect(obj.x, oy, obj.w, obj.h);
        ctx.fillStyle = '#c9a227'; ctx.fillRect(obj.x + 3, oy + 3, obj.w - 6, obj.h - 6);
        ctx.fillStyle = '#1b2733'; ctx.font = 'bold 12px system-ui'; ctx.fillText('LoL', obj.x + 6, oy + 20);
      }
      else if (obj.id === 'whiteboard') {
        ctx.fillStyle = '#eef0f2'; ctx.fillRect(obj.x, oy, obj.w, obj.h);
        ctx.strokeStyle = '#8a8a95'; ctx.strokeRect(obj.x, oy, obj.w, obj.h);
        ctx.strokeStyle = '#d33'; ctx.beginPath(); ctx.moveTo(obj.x + 5, oy + 8); ctx.lineTo(obj.x + obj.w - 5, oy + 8); ctx.moveTo(obj.x + 6, oy + 16); ctx.lineTo(obj.x + obj.w - 10, oy + 20); ctx.stroke();
      }
      else if (obj.id === 'trophy') {
        ctx.fillStyle = '#8a6a12'; ctx.fillRect(obj.x + 12, oy + obj.h - 8, obj.w - 24, 6);
        ctx.fillStyle = '#f4d03f'; ctx.beginPath(); ctx.moveTo(obj.x + 9, oy + 4); ctx.lineTo(obj.x + obj.w - 9, oy + 4); ctx.lineTo(obj.x + obj.w / 2, oy + obj.h - 8); ctx.closePath(); ctx.fill();
      }
      else if (obj.id === 'coffee') {
        ctx.fillStyle = '#3a2a1c'; ctx.fillRect(obj.x + 6, oy + 8, obj.w - 12, obj.h - 10);
        ctx.fillStyle = '#c98a5a'; ctx.fillRect(obj.x + 8, oy + 10, obj.w - 16, 4);
        ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.beginPath(); ctx.moveTo(obj.x + obj.w / 2 - 3, oy + 4); ctx.lineTo(obj.x + obj.w / 2 - 3, oy - 1); ctx.stroke();
      }
      else if (obj.pickup === 'tabletka') {
        ctx.save(); ctx.shadowColor = '#ffffff'; ctx.shadowBlur = 6 + pulse * 8;
        ctx.fillStyle = '#f4f4f8'; ctx.beginPath(); ctx.arc(obj.x + obj.w / 2, oy + obj.h / 2, obj.w / 2, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.strokeStyle = '#c33'; ctx.beginPath(); ctx.moveTo(obj.x + 3, oy + obj.h / 2); ctx.lineTo(obj.x + obj.w - 3, oy + obj.h / 2); ctx.stroke();
      }
      else if (obj.pickup === 'pepsi') {
        ctx.save(); ctx.shadowColor = '#3a7bd5'; ctx.shadowBlur = 6 + pulse * 8;
        ctx.fillStyle = '#0a4bad'; ctx.fillRect(obj.x + 2, oy, obj.w - 4, obj.h);
        ctx.restore();
        ctx.fillStyle = '#e33'; ctx.fillRect(obj.x + 2, oy + obj.h / 2 - 2, obj.w - 4, 4);
        ctx.fillStyle = '#fff'; ctx.fillRect(obj.x + 2, oy + obj.h / 2 - 4, obj.w - 4, 2);
      }
      else if (obj.isDoor) {
        const open = game.inventory.tabletka >= 2 && game.inventory.pepsi >= 1;
        if (open) { ctx.save(); ctx.shadowColor = '#ffcc55'; ctx.shadowBlur = 12 + pulse * 8; }
        ctx.fillStyle = open ? '#7a4a1e' : '#3a3a44';
        ctx.fillRect(obj.x, oy, obj.w, obj.h);
        ctx.fillStyle = open ? '#9a5f28' : '#2c2c34';
        ctx.fillRect(obj.x + 3, oy + 3, obj.w - 6, obj.h - 6);
        if (open) ctx.restore();
        ctx.fillStyle = open ? '#ffcc00' : '#888';
        ctx.beginPath(); ctx.arc(obj.x + obj.w - 8, oy + obj.h / 2, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = open ? '#ffcc00' : '#777';
        ctx.font = 'bold 10px system-ui'; ctx.textAlign = 'center';
        ctx.fillText(open ? 'WYJŚCIE' : 'ZAMK.', obj.x + obj.w / 2, obj.y + 44);
        ctx.textAlign = 'left';
      }
    }
    const p = room.player;
    // player ground shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(p.x + p.w / 2, p.y + 48 + p.h, p.w * 0.5, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    // interaction prompt above the nearest interactable
    if (!game.dialogue.active) {
      for (const obj of room.interactables) {
        if (obj.collected) continue;
        if (near(p, obj) || aabb(p.x, p.y, p.w, p.h, obj.x, obj.y, obj.w, obj.h)) {
          const py = obj.y + 48 - 10 + Math.sin(performance.now() / 200) * 3;
          ctx.fillStyle = '#ffcc00';
          ctx.font = 'bold 11px system-ui';
          ctx.textAlign = 'center';
          ctx.fillText('[SPACJA]', obj.x + obj.w / 2, py);
          ctx.textAlign = 'left';
          break;
        }
      }
    }
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
