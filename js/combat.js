import { W, H, clamp, aabb, rand, GameState, fitText } from './utils.js';
import { drawSprite } from './assets.js';

export const CombatPhase = {
  MENU: 'MENU',
  SUBMENU: 'SUBMENU',
  DODGE: 'DODGE',
  ENEMY_TURN: 'ENEMY_TURN',
  MESSAGE: 'MESSAGE',
};

export class CombatSystem {
  constructor(game) {
    this.game = game;
    this.reset();
  }

  reset() {
    this.phase = CombatPhase.MENU;
    this.menuIndex = 0;
    this.submenuIndex = 0;
    this.submenuItems = [];
    this.submenuType = null;
    this.bullets = [];
    this.dodgeTimer = 0;
    this.dodgeDuration = 4;
    this.message = '';
    this.messageTimer = 0;
    this.enemy = null;
    this.heart = { x: 400, y: 380, size: 14, speed: 180 };
    this.box = { x: 220, y: 280, w: 360, h: 200 };
    this.mutedChat = false;
    this.defenseBuff = 0;
    this.speedBuff = 0;
    this.attackSlow = 0;
    this.invuln = 0;
    this.hitCooldown = 0;
    this.patternIndex = 0;
    this.patternTimer = 0;
    this.onWin = null;
    this.onLose = null;
    this.won = false;
    this.submenuScroll = 0;
    this.maxSubmenuVisible = 5;
    this.triggerQTEOnWin = false;
    this.winHandled = false;
    this.buttons = [
      { id: 'fight', label: 'WALCZ' },
      { id: 'act', label: 'ZAGRAJ' },
      { id: 'item', label: 'PRZEDMIOT' },
      { id: 'mercy', label: 'ŁASKA' },
    ];
  }

  start(enemy, config = {}) {
    this.reset();
    this.enemy = { ...enemy };
    this.roomActs = config.acts || [];
    this.globalActs = config.globalActs !== false;
    this.onWin = config.onWin || null;
    this.onLose = config.onLose || null;
    this.triggerQTEOnWin = config.triggerQTEOnWin || false;
    this.spawnPattern = config.spawnPattern || this.defaultPattern.bind(this);
    this.heart.x = this.box.x + this.box.w / 2;
    this.heart.y = this.box.y + this.box.h / 2;
    this.game.gameState = GameState.COMBAT_BULLETHELL;
  }

  getHeartSpeed() {
    return this.heart.speed * (1 + this.speedBuff);
  }

  defaultPattern(dt) {
    this.patternTimer += dt;
    if (this.patternTimer < 0.35) return;
    this.patternTimer = 0;
    const side = Math.floor(Math.random() * 4);
    const speed = (120 + Math.random() * 80) * (this.mutedChat ? 0.6 : 1) * (this.attackSlow ? 0.5 : 1);
    let b = { w: 8, h: 8, speed, color: '#ff4444' };
    if (side === 0) { b.x = rand(this.box.x, this.box.x + this.box.w); b.y = this.box.y - 10; b.vx = 0; b.vy = speed; }
    else if (side === 1) { b.x = this.box.x + this.box.w + 10; b.y = rand(this.box.y, this.box.y + this.box.h); b.vx = -speed; b.vy = 0; }
    else if (side === 2) { b.x = rand(this.box.x, this.box.x + this.box.w); b.y = this.box.y + this.box.h + 10; b.vx = 0; b.vy = -speed; }
    else { b.x = this.box.x - 10; b.y = rand(this.box.y, this.box.y + this.box.h); b.vx = speed; b.vy = 0; }
    this.bullets.push(b);
  }

  indeksPattern(dt) {
    this.patternTimer += dt;
    if (this.patternTimer < 0.5) return;
    this.patternTimer = 0;
    const angle = Math.random() * Math.PI * 2;
    const speed = 100 * (this.attackSlow ? 0.5 : 1);
    this.bullets.push({
      x: this.box.x + this.box.w / 2, y: this.box.y + this.box.h / 2,
      w: 14, h: 18, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      speed, color: '#9966ff', rot: 0,
    });
    if (Math.random() < 0.4) {
      this.bullets.push({
        x: rand(this.box.x, this.box.x + this.box.w), y: this.box.y - 10,
        w: 10, h: 10, vx: rand(-40, 40), vy: 140, speed: 140, color: '#ffcc00', rot: 0,
      });
    }
  }

  update(dt) {
    const g = this.game;
    if (this.invuln > 0) this.invuln -= dt;
    if (this.hitCooldown > 0) this.hitCooldown -= dt;
    if (this.defenseBuff > 0) this.defenseBuff -= dt;
    if (this.speedBuff > 0 && this.phase !== CombatPhase.DODGE) this.speedBuff -= dt;
    if (this.attackSlow > 0) this.attackSlow -= dt;

    if (this.phase === CombatPhase.MESSAGE) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) this.phase = CombatPhase.MENU;
      return;
    }

    if (this.phase === CombatPhase.MENU) this.updateMenu();
    else if (this.phase === CombatPhase.SUBMENU) this.updateSubmenu();
    else if (this.phase === CombatPhase.DODGE) this.updateDodge(dt);
    else if (this.phase === CombatPhase.ENEMY_TURN) this.updateEnemyTurn(dt);
  }

  updateMenu() {
    const inp = this.game.input;
    const row = Math.floor(this.menuIndex / 2);
    const col = this.menuIndex % 2;
    if (inp.consumePressed('left') || inp.consumePressed('a')) {
      if (col === 1) { this.menuIndex = row * 2; this.game.audio?.playSfx('select'); }
    }
    if (inp.consumePressed('right') || inp.consumePressed('d')) {
      if (col === 0) { this.menuIndex = row * 2 + 1; this.game.audio?.playSfx('select'); }
    }
    if (inp.consumePressed('up') || inp.consumePressed('w')) {
      if (row === 1) { this.menuIndex = col; this.game.audio?.playSfx('select'); }
    }
    if (inp.consumePressed('down') || inp.consumePressed('s')) {
      if (row === 0) { this.menuIndex = 2 + col; this.game.audio?.playSfx('select'); }
    }
    if (inp.consumePressed('space') || inp.consumePressed('enter')) {
      this.game.audio?.playSfx('select');
      const btn = this.buttons[this.menuIndex];
      if (btn.id === 'fight') {
        this.enemy.hp -= 4 + Math.floor(Math.random() * 3);
        this.showMessage('Gienek uderza z pełną determinacją!');
        this.checkWin();
        if (this.phase !== CombatPhase.MESSAGE || this.enemy.hp > 0) this.startDodgePhase();
      } else if (btn.id === 'act') {
        this.openActMenu();
      } else if (btn.id === 'item') {
        this.openItemMenu();
      } else if (btn.id === 'mercy') {
        this.showMessage('Wróg nie chce cię przepuścić...');
      }
    }
  }

  openActMenu() {
    this.submenuType = 'act';
    this.submenuItems = [...this.roomActs];
    if (this.globalActs) {
      if (!this.game.komendaUsed) this.submenuItems.push({ id: 'komenda', label: 'Zgłoś na Komendę' });
    }
    this.submenuIndex = 0;
    this.submenuScroll = 0;
    this.phase = CombatPhase.SUBMENU;
  }

  openItemMenu() {
    this.submenuType = 'item';
    this.submenuItems = [];
    if (this.game.inventory.tabletka > 0) this.submenuItems.push({ id: 'tabletka', label: 'Tabletka' });
    if (this.game.inventory.pepsi > 0) this.submenuItems.push({ id: 'pepsi', label: 'Pepsi' });
    if (!this.submenuItems.length) {
      this.showMessage('Nie masz przedmiotów.');
      return;
    }
    this.submenuIndex = 0;
    this.submenuScroll = 0;
    this.phase = CombatPhase.SUBMENU;
  }

  updateSubmenu() {
    const inp = this.game.input;
    if (inp.consumePressed('up') || inp.consumePressed('w')) {
      this.submenuIndex = Math.max(0, this.submenuIndex - 1);
      this.game.audio?.playSfx('select');
      if (this.submenuIndex < this.submenuScroll) this.submenuScroll = this.submenuIndex;
    }
    if (inp.consumePressed('down') || inp.consumePressed('s')) {
      this.submenuIndex = Math.min(this.submenuItems.length - 1, this.submenuIndex + 1);
      this.game.audio?.playSfx('select');
      if (this.submenuIndex >= this.submenuScroll + this.maxSubmenuVisible) {
        this.submenuScroll = this.submenuIndex - this.maxSubmenuVisible + 1;
      }
    }
    if (inp.consumePressed('space') || inp.consumePressed('enter')) {
      this.game.audio?.playSfx('select');
      const item = this.submenuItems[this.submenuIndex];
      this.executeSubmenu(item);
    }
  }

  executeSubmenu(item) {
    if (this.submenuType === 'act') {
      if (item.id === 'mute') { this.mutedChat = true; this.showMessage('Czat wyciszony. Ataki słabsze.'); }
      else if (item.id === 'gank') { this.enemy.hp -= 8; this.showMessage('Gank udany! Wróg otrzymał obrażenia.'); this.checkWin(); }
      else if (item.id === 'zapomoga') { this.game.heal(5); this.showMessage('Zapomoga przyznana. +5 HP.'); }
      else if (item.id === 'sesja') { this.attackSlow = 5; this.showMessage('Sesja przedłużona. Ataki wolniejsze.'); }
      else if (item.id === 'komenda') {
        this.game.komendaUsed = true;
        this.bullets = [];
        this.game.audio?.playSfx('komenda_flash');
        this.game.renderer.flash('#ff0000', 0.3);
        setTimeout(() => this.game.renderer.flash('#0000ff', 0.3), 150);
        this.showMessage('Koguty włączone! Atak anulowany.');
        this.phase = CombatPhase.MENU;
        return;
      }
      else if (item.handler) item.handler(this);
    } else if (this.submenuType === 'item') {
      if (item.id === 'tabletka') {
        this.game.inventory.tabletka--;
        this.game.heal(6);
        this.game.debuffs = [];
        this.showMessage('Tabletka przyjęta. Czujesz się lepiej.');
      } else if (item.id === 'pepsi') {
        this.game.inventory.pepsi--;
        this.game.heal(10);
        this.speedBuff = 1;
        this.showMessage('Pepsi! Moc i prędkość na następną turę.');
      }
    }
    if (this.enemy.hp > 0) this.startDodgePhase();
    else this.checkWin();
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 2;
    this.phase = CombatPhase.MESSAGE;
  }

  startDodgePhase() {
    this.phase = CombatPhase.DODGE;
    this.dodgeTimer = this.dodgeDuration;
    this.bullets = [];
    this.patternTimer = 0;
    this.heart.x = this.box.x + this.box.w / 2;
    this.heart.y = this.box.y + this.box.h / 2;
  }

  updateDodge(dt) {
    const inp = this.game.input;
    const mv = inp.movementVector();
    const spd = this.getHeartSpeed() * dt;
    this.heart.x = clamp(this.heart.x + mv.x * spd, this.box.x + 8, this.box.x + this.box.w - 8 - this.heart.size);
    this.heart.y = clamp(this.heart.y + mv.y * spd, this.box.y + 8, this.box.y + this.box.h - 8 - this.heart.size);

    this.spawnPattern(dt);
    for (const b of this.bullets) {
      b.x += (b.vx || 0) * dt;
      b.y += (b.vy || 0) * dt;
      if (b.rot !== undefined) b.rot += dt * 3;
    }
    this.bullets = this.bullets.filter(b =>
      b.x > -30 && b.x < W + 30 && b.y > -30 && b.y < H + 30
    );

    if (this.hitCooldown <= 0) {
      for (const b of this.bullets) {
        if (aabb(this.heart.x, this.heart.y, this.heart.size, this.heart.size, b.x, b.y, b.w, b.h)) {
          const dmg = this.defenseBuff > 0 ? 1 : 2;
          this.game.damage(dmg);
          this.game.audio?.playSfx('hit');
          this.hitCooldown = 0.8;
          this.invuln = 0.5;
          if (this.game.hp <= 0 && this.onLose) this.onLose();
          break;
        }
      }
    }

    this.dodgeTimer -= dt;
    if (this.dodgeTimer <= 0) {
      this.bullets = [];
      this.phase = CombatPhase.MENU;
    }
  }

  updateEnemyTurn(dt) {
    this.dodgeTimer -= dt;
    if (this.dodgeTimer <= 0) this.phase = CombatPhase.MENU;
  }

  checkWin() {
    if (this.enemy && this.enemy.hp <= 0 && !this.winHandled) {
      this.winHandled = true;
      this.enemy.hp = 0;
      this.bullets = [];
      this.phase = CombatPhase.MESSAGE;
      this.message = '';
      this.messageTimer = 0;
      const cb = this.onWin;
      this.onWin = null;
      if (cb) cb();
    }
  }

  clearBullets() {
    this.bullets = [];
  }

  draw(ctx) {
    const g = this.game;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    if (this.enemy) {
      const ex = 60, ey = 50;
      const sprite = this.enemy.sprite || (this.enemy.shape === 'triangle' ? 'enemies/toxic' : 'enemies/rektor');
      drawSprite(ctx, sprite, ex, ey, 100, 100);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(this.enemy.name, ex, ey + 112);
      const barW = 120;
      ctx.fillStyle = '#333';
      ctx.fillRect(ex, ey + 120, barW, 8);
      ctx.fillStyle = '#ff0066';
      ctx.fillRect(ex, ey + 120, barW * (this.enemy.hp / this.enemy.maxHp), 8);
    }

    if (this.phase === CombatPhase.DODGE) {
      g.renderer.drawNeonBox(this.box.x, this.box.y, this.box.w, this.box.h, '#ff6600');
      for (const b of this.bullets) {
        ctx.save();
        ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
        if (b.rot) ctx.rotate(b.rot);
        ctx.fillStyle = b.color;
        ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
        ctx.restore();
      }
      const hs = this.heart.size;
      if (!drawSprite(ctx, 'ui/heart-orange', this.heart.x, this.heart.y, hs, hs)) {
        ctx.fillStyle = '#ff8800';
        ctx.fillRect(this.heart.x, this.heart.y, hs, hs);
      }
      if (this.invuln > 0) {
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(this.heart.x - 2, this.heart.y - 2, this.heart.size + 4, this.heart.size + 4);
      }
    }

    const menuY = H - 100;
    const menuH = 100;
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillRect(0, menuY, W, menuH);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, menuY, W, menuH);

    if (this.phase === CombatPhase.SUBMENU) {
      const panelY = menuY - 138;
      ctx.fillStyle = 'rgba(0,0,0,0.92)';
      ctx.fillRect(16, panelY, W - 32, 130);
      ctx.strokeStyle = '#ffcc00';
      ctx.strokeRect(16, panelY, W - 32, 130);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(this.submenuType === 'act' ? 'Wybierz akcję:' : 'Wybierz przedmiot:', 28, panelY + 22);
      const visible = this.submenuItems.slice(this.submenuScroll, this.submenuScroll + this.maxSubmenuVisible);
      visible.forEach((item, vi) => {
        const i = this.submenuScroll + vi;
        ctx.fillStyle = i === this.submenuIndex ? '#ffcc00' : '#bbb';
        ctx.font = i === this.submenuIndex ? 'bold 15px system-ui' : '14px system-ui';
        const label = fitText(ctx, `${i === this.submenuIndex ? '► ' : '   '}${item.short || item.label}`, W - 80);
        ctx.fillText(label, 32, panelY + 44 + vi * 22);
      });
    }

    if (this.phase === CombatPhase.MENU) {
      const bw = 170, bh = 40, gap = 16;
      const startX = (W - (bw * 2 + gap)) / 2;
      const startY = menuY + 12;
      this.buttons.forEach((btn, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        const bx = startX + col * (bw + gap);
        const by = startY + row * (bh + gap);
        const selected = i === this.menuIndex;
        ctx.fillStyle = selected ? '#00ffcc' : '#333';
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = selected ? '#000' : '#fff';
        ctx.font = 'bold 17px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(btn.label, bx + bw / 2, by + 26);
      });
      ctx.textAlign = 'left';
    } else if (this.phase === CombatPhase.MESSAGE) {
      ctx.fillStyle = '#fff';
      ctx.font = '15px system-ui';
      const lines = this.message.match(/.{1,70}(\s|$)/g) || [this.message];
      lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln.trim(), 24, menuY + 36 + i * 20));
    }
  }
}
