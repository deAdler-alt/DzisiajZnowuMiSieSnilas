import { W, H, clamp, aabb, rand, GameState, fitText } from './utils.js';
import { drawSprite } from './assets.js';

export const CombatPhase = {
  MENU: 'MENU',
  SUBMENU: 'SUBMENU',
  FIGHT_SWING: 'FIGHT_SWING',
  DODGE: 'DODGE',
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
    this.dodgeDuration = 4.5;
    this.message = '';
    this.messageTimer = 0;
    this.afterMessage = null;
    this.enemy = null;
    this.heart = { x: 400, y: 380, size: 14, speed: 185 };
    this.box = { x: 220, y: 300, w: 360, h: 190 };
    this.mutedChat = false;
    this.defenseBuff = 0;
    this.speedBuff = 0;
    this.attackSlow = 0;
    this.invuln = 0;
    this.hitCooldown = 0;
    this.patternTimer = 0;
    this.turnCount = 0;
    this.onWin = null;
    this.onLose = null;
    this.winHandled = false;
    this.spared = false;
    this.usedActs = new Set();
    this.submenuScroll = 0;
    this.maxSubmenuVisible = 5;
    this.triggerQTEOnWin = false;
    this.roomActs = [];
    this.globalActs = true;
    this.patternList = null;
    this.spawnPattern = this.defaultPattern.bind(this);
    this.taunts = ['Wróg szykuje atak...'];
    this.mercyHint = null;
    this.dodgeTaunt = '';
    this.swing = 0;
    this.swingDir = 1;
    this.swingSpeed = 1.15;
    this.buttons = [
      { id: 'fight', label: 'WALCZ' },
      { id: 'act', label: 'ZAGRAJ' },
      { id: 'item', label: 'PRZEDMIOT' },
      { id: 'mercy', label: 'ŁASKA' },
    ];
  }

  start(enemy, config = {}) {
    this.reset();
    this.enemy = { sparable: false, ...enemy };
    this.enemy.spareActs = enemy.spareActs || null;
    this.roomActs = config.acts || [];
    this.globalActs = config.globalActs !== false;
    this.onWin = config.onWin || null;
    this.onLose = config.onLose || null;
    this.triggerQTEOnWin = config.triggerQTEOnWin || false;
    this.taunts = config.taunts || ['Wróg szykuje atak...'];
    this.mercyHint = config.mercyHint || null;
    if (Array.isArray(config.patterns) && config.patterns.length) {
      this.patternList = config.patterns;
      this.spawnPattern = config.patterns[0];
    } else if (config.spawnPattern) {
      this.patternList = null;
      this.spawnPattern = config.spawnPattern;
    } else {
      this.patternList = null;
      this.spawnPattern = this.defaultPattern.bind(this);
    }
    this.heart.x = this.box.x + this.box.w / 2;
    this.heart.y = this.box.y + this.box.h / 2;
    this.game.gameState = GameState.COMBAT_BULLETHELL;
  }

  getHeartSpeed() {
    return this.heart.speed * (1 + this.speedBuff);
  }

  get hpFrac() {
    return this.enemy ? clamp(this.enemy.hp / this.enemy.maxHp, 0, 1) : 1;
  }

  // ---- bullet patterns -------------------------------------------------
  spawnRate(base) {
    // faster spawns as the enemy weakens; slowed by mute/sesja acts
    const rage = 1 + (1 - this.hpFrac) * 0.6;
    return base / rage * (this.mutedChat ? 1.35 : 1) * (this.attackSlow > 0 ? 1.6 : 1);
  }

  bulletSpeedMul() {
    return (this.mutedChat ? 0.7 : 1) * (this.attackSlow > 0 ? 0.55 : 1);
  }

  defaultPattern(dt) {
    this.patternTimer += dt;
    if (this.patternTimer < this.spawnRate(0.34)) return;
    this.patternTimer = 0;
    const side = Math.floor(Math.random() * 4);
    const speed = rand(120, 200) * this.bulletSpeedMul();
    const b = { w: 9, h: 9, color: '#ff4444' };
    if (side === 0) { b.x = rand(this.box.x, this.box.x + this.box.w); b.y = this.box.y - 10; b.vx = 0; b.vy = speed; }
    else if (side === 1) { b.x = this.box.x + this.box.w + 10; b.y = rand(this.box.y, this.box.y + this.box.h); b.vx = -speed; b.vy = 0; }
    else if (side === 2) { b.x = rand(this.box.x, this.box.x + this.box.w); b.y = this.box.y + this.box.h + 10; b.vx = 0; b.vy = -speed; }
    else { b.x = this.box.x - 10; b.y = rand(this.box.y, this.box.y + this.box.h); b.vx = speed; b.vy = 0; }
    this.bullets.push(b);
  }

  // aimed "skillshots" that lead toward the heart
  aimedPattern(dt) {
    this.patternTimer += dt;
    if (this.patternTimer < this.spawnRate(0.6)) return;
    this.patternTimer = 0;
    const fromLeft = Math.random() < 0.5;
    const sx = fromLeft ? this.box.x - 12 : this.box.x + this.box.w + 12;
    const sy = rand(this.box.y, this.box.y + this.box.h);
    const dx = this.heart.x - sx, dy = this.heart.y - sy;
    const len = Math.hypot(dx, dy) || 1;
    const speed = 150 * this.bulletSpeedMul();
    this.bullets.push({ x: sx, y: sy, w: 12, h: 12, vx: dx / len * speed, vy: dy / len * speed, color: '#ff2266', rot: 0 });
  }

  // a wall closing in with a safe gap
  wallPattern(dt) {
    this.patternTimer += dt;
    if (this.patternTimer < this.spawnRate(1.15)) return;
    this.patternTimer = 0;
    const gapY = rand(this.box.y + 24, this.box.y + this.box.h - 60);
    const speed = 95 * this.bulletSpeedMul();
    for (let y = this.box.y; y < this.box.y + this.box.h; y += 18) {
      if (y > gapY && y < gapY + 46) continue;
      this.bullets.push({ x: this.box.x + this.box.w + 10, y, w: 16, h: 16, vx: -speed, vy: 0, color: '#ff6600' });
    }
  }

  // rektor: index books flung from the center + falling ECTS points
  indeksPattern(dt) {
    this.patternTimer += dt;
    if (this.patternTimer < this.spawnRate(0.5)) return;
    this.patternTimer = 0;
    const angle = Math.random() * Math.PI * 2;
    const speed = 105 * this.bulletSpeedMul();
    this.bullets.push({
      x: this.box.x + this.box.w / 2, y: this.box.y + this.box.h / 2,
      w: 14, h: 18, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
      speed, color: '#9966ff', rot: 0,
    });
    if (Math.random() < 0.45) {
      this.bullets.push({
        x: rand(this.box.x, this.box.x + this.box.w), y: this.box.y - 10,
        w: 10, h: 10, vx: rand(-40, 40), vy: 150 * this.bulletSpeedMul(), color: '#ffcc00', rot: 0,
      });
    }
  }

  // ---- update ----------------------------------------------------------
  update(dt) {
    if (this.invuln > 0) this.invuln -= dt;
    if (this.hitCooldown > 0) this.hitCooldown -= dt;
    if (this.defenseBuff > 0) this.defenseBuff -= dt;
    if (this.speedBuff > 0 && this.phase !== CombatPhase.DODGE) this.speedBuff = Math.max(0, this.speedBuff - dt);
    if (this.attackSlow > 0) this.attackSlow -= dt;

    if (this.phase === CombatPhase.MESSAGE) {
      this.messageTimer -= dt;
      if (this.messageTimer <= 0) {
        const cb = this.afterMessage;
        this.afterMessage = null;
        if (cb) cb();
        else this.phase = CombatPhase.MENU;
      }
      return;
    }

    if (this.phase === CombatPhase.MENU) this.updateMenu();
    else if (this.phase === CombatPhase.SUBMENU) this.updateSubmenu();
    else if (this.phase === CombatPhase.FIGHT_SWING) this.updateSwing(dt);
    else if (this.phase === CombatPhase.DODGE) this.updateDodge(dt);
  }

  updateMenu() {
    const inp = this.game.input;
    const row = Math.floor(this.menuIndex / 2);
    const col = this.menuIndex % 2;
    if ((inp.consumePressed('left') || inp.consumePressed('a')) && col === 1) { this.menuIndex = row * 2; this.game.audio?.playSfx('select'); }
    if ((inp.consumePressed('right') || inp.consumePressed('d')) && col === 0) { this.menuIndex = row * 2 + 1; this.game.audio?.playSfx('select'); }
    if ((inp.consumePressed('up') || inp.consumePressed('w')) && row === 1) { this.menuIndex = col; this.game.audio?.playSfx('select'); }
    if ((inp.consumePressed('down') || inp.consumePressed('s')) && row === 0) { this.menuIndex = 2 + col; this.game.audio?.playSfx('select'); }
    if (inp.consumePressed('space') || inp.consumePressed('enter')) {
      this.game.audio?.playSfx('select');
      const btn = this.buttons[this.menuIndex];
      if (btn.id === 'fight') this.startSwing();
      else if (btn.id === 'act') this.openActMenu();
      else if (btn.id === 'item') this.openItemMenu();
      else if (btn.id === 'mercy') this.tryMercy();
    }
  }

  // ---- FIGHT: timing swing bar ----------------------------------------
  startSwing() {
    this.phase = CombatPhase.FIGHT_SWING;
    this.swing = 0;
    this.swingDir = 1;
  }

  updateSwing(dt) {
    const inp = this.game.input;
    this.swing += this.swingDir * this.swingSpeed * dt;
    if (this.swing >= 1) { this.swing = 1; this.swingDir = -1; }
    else if (this.swing <= 0) { this.swing = 0; this.swingDir = 1; }
    if (inp.consumePressed('space') || inp.consumePressed('enter')) {
      const accuracy = 1 - Math.abs(this.swing - 0.5) * 2; // 0..1, 1 = bullseye
      let dmg = Math.round(3 + accuracy * 8);
      const crit = accuracy > 0.9;
      if (crit) dmg += 3;
      this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
      this.game.audio?.playSfx(crit ? 'crit' : 'attack');
      this.game.renderer.shake(crit ? 9 : 5, 0.25);
      this.game.renderer.popText(`-${dmg}`, 110, 120, crit ? '#ffdd33' : '#ffffff', crit ? 30 : 24);
      const msg = crit ? 'IDEALNE TRAFIENIE! Cios prosto w ego wroga!'
        : accuracy > 0.5 ? 'Mocny cios! Gienek trzyma poziom.'
        : 'Muśnięcie... ale zawsze to coś.';
      this.showMessage(msg, () => this.afterPlayerAction());
    }
  }

  afterPlayerAction() {
    if (this.enemy.hp <= 0) this.checkWin();
    else this.startDodgePhase();
  }

  // ---- ACT / ITEM submenu ---------------------------------------------
  openActMenu() {
    this.submenuType = 'act';
    this.submenuItems = [...this.roomActs];
    if (this.globalActs) {
      this.submenuItems.push({ id: 'zadzwon', label: 'Zadzwoń do M.' });
      if (!this.game.komendaUsed) this.submenuItems.push({ id: 'komenda', label: 'Zgłoś na Komendę' });
    }
    this.submenuItems.push({ id: 'sprawdz', label: 'Sprawdź wroga' });
    this.submenuIndex = 0;
    this.submenuScroll = 0;
    this.phase = CombatPhase.SUBMENU;
  }

  openItemMenu() {
    this.submenuType = 'item';
    this.submenuItems = [];
    if (this.game.inventory.tabletka > 0) this.submenuItems.push({ id: 'tabletka', label: `Tabletka x${this.game.inventory.tabletka}` });
    if (this.game.inventory.pepsi > 0) this.submenuItems.push({ id: 'pepsi', label: `Pepsi x${this.game.inventory.pepsi}` });
    if (!this.submenuItems.length) { this.showMessage('Plecak świeci pustkami.'); return; }
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
    if (inp.consumePressed('escape') || inp.consumePressed('x')) {
      this.game.audio?.playSfx('select');
      this.phase = CombatPhase.MENU;
      return;
    }
    if (inp.consumePressed('space') || inp.consumePressed('enter')) {
      this.game.audio?.playSfx('select');
      this.executeSubmenu(this.submenuItems[this.submenuIndex]);
    }
  }

  markSpareProgress() {
    if (this.enemy.spareActs && this.enemy.spareActs.every(a => this.usedActs.has(a))) {
      this.enemy.sparable = true;
    }
  }

  executeSubmenu(item) {
    if (!item) return;
    if (this.submenuType === 'act') {
      this.usedActs.add(item.id);
      let enemyTurn = true;
      if (item.id === 'mute') { this.mutedChat = true; this.showMessage('Wyciszasz czat. Toksyczne słowa nie ranią już tak bardzo.', () => this.afterPlayerAction()); }
      else if (item.id === 'gank') {
        const dmg = 8; this.enemy.hp = Math.max(0, this.enemy.hp - dmg);
        this.game.renderer.popText(`-${dmg}`, 110, 120, '#66ff88');
        this.game.audio?.playSfx('attack');
        this.showMessage('Twój jungler w końcu przyszedł. Gank udany!', () => this.afterPlayerAction());
      }
      else if (item.id === 'zapomoga') { this.game.heal(6); this.game.renderer.popText('+6', this.heart.x, this.heart.y - 20, '#66ff88'); this.showMessage('Podanie o zapomogę rozpatrzone pozytywnie. +6 HP.', () => this.afterPlayerAction()); }
      else if (item.id === 'sesja') { this.attackSlow = 6; this.showMessage('Sesja przedłużona. Rektor grzęźnie w papierologii — ataki wolniejsze.', () => this.afterPlayerAction()); }
      else if (item.id === 'zadzwon') { this.game.heal(5); this.defenseBuff = 12; this.game.renderer.popText('+5', this.heart.x, this.heart.y - 20, '#66ff88'); this.showMessage('M. mówi, że dasz radę. Wypełnia cię determinacja. (+5 HP, obrona)', () => this.afterPlayerAction()); }
      else if (item.id === 'sprawdz') {
        enemyTurn = false;
        const e = this.enemy;
        const hint = e.sparable ? 'Wydaje się gotowy odpuścić.' : (e.checkHint || 'Trzyma się twardo.');
        this.showMessage(`${e.name} — ATK w normie, HP ${e.hp}/${e.maxHp}. ${hint}`);
      }
      else if (item.id === 'komenda') {
        this.game.komendaUsed = true;
        this.bullets = [];
        this.game.audio?.playSfx('komenda_flash');
        this.game.renderer.flash('#ff0000', 0.3);
        setTimeout(() => this.game.renderer.flash('#0000ff', 0.3), 150);
        this.showMessage('Koguty włączone! Patrol anuluje atak wroga.');
        return;
      }
      else if (item.handler) { item.handler(this); enemyTurn = false; }
      this.markSpareProgress();
      if (item.id === 'sprawdz') return;
      return;
    }

    if (this.submenuType === 'item') {
      if (item.id === 'tabletka') {
        this.game.inventory.tabletka--;
        this.game.heal(6);
        this.game.debuffs = [];
        this.game.renderer.popText('+6', this.heart.x, this.heart.y - 20, '#66ff88');
        this.showMessage('Tabletka przyjęta. Ból głowy odpuszcza. +6 HP.', () => this.afterPlayerAction());
      } else if (item.id === 'pepsi') {
        this.game.inventory.pepsi--;
        this.game.heal(10);
        this.speedBuff = 1;
        this.game.renderer.popText('+10', this.heart.x, this.heart.y - 20, '#66ff88');
        this.showMessage('Pepsi! Cukier i kofeina — serce śmiga w następnej turze. +10 HP.', () => this.afterPlayerAction());
      }
    }
  }

  tryMercy() {
    if (this.enemy.sparable) {
      this.spared = true;
      this.game.audio?.playSfx('spare');
      this.showMessage(this.enemy.spareText || 'Okazujesz łaskę. Wróg opuszcza gardę.', () => this.checkWin());
    } else if (this.enemy.spareActs) {
      this.showMessage(this.mercyHint || 'Wróg wciąż kipi. Może dałoby się go czymś udobruchać (ZAGRAJ)...');
    } else {
      this.showMessage('Wróg nie zamierza cię przepuścić. Trzeba to dokończyć.');
    }
  }

  showMessage(msg, after = null) {
    this.message = msg;
    this.messageTimer = after ? 1.6 : 2.2;
    this.afterMessage = after;
    this.phase = CombatPhase.MESSAGE;
  }

  startDodgePhase() {
    this.phase = CombatPhase.DODGE;
    this.dodgeTimer = this.dodgeDuration;
    this.bullets = [];
    this.patternTimer = 0;
    this.heart.x = this.box.x + this.box.w / 2;
    this.heart.y = this.box.y + this.box.h / 2;
    if (this.patternList) this.spawnPattern = this.patternList[this.turnCount % this.patternList.length];
    this.dodgeTaunt = this.taunts[this.turnCount % this.taunts.length] || '';
    this.turnCount++;
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
    this.bullets = this.bullets.filter(b => b.x > -40 && b.x < W + 40 && b.y > -40 && b.y < H + 40);

    if (this.hitCooldown <= 0) {
      for (const b of this.bullets) {
        if (aabb(this.heart.x, this.heart.y, this.heart.size, this.heart.size, b.x, b.y, b.w, b.h)) {
          const dmg = this.defenseBuff > 0 ? 1 : 2;
          this.game.damage(dmg);
          this.game.audio?.playSfx('hit');
          this.game.renderer.shake(6, 0.25);
          this.game.renderer.popText(`-${dmg}`, this.heart.x + 6, this.heart.y - 6, '#ff5555');
          this.hitCooldown = 0.85;
          this.invuln = 0.55;
          if (this.game.hp <= 0 && this.onLose) { this.onLose(); return; }
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

  checkWin() {
    if (this.enemy && (this.enemy.hp <= 0 || this.spared) && !this.winHandled) {
      this.winHandled = true;
      this.enemy.hp = Math.max(0, this.enemy.hp);
      this.bullets = [];
      this.phase = CombatPhase.MESSAGE;
      this.message = '';
      this.messageTimer = 0;
      this.afterMessage = null;
      const cb = this.onWin;
      this.onWin = null;
      if (cb) cb();
    }
  }

  clearBullets() {
    this.bullets = [];
  }

  // ---- draw ------------------------------------------------------------
  draw(ctx) {
    const g = this.game;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);

    const sh = g.renderer.shakeOffset();
    ctx.save();
    ctx.translate(sh.x, sh.y);

    if (this.enemy) {
      const ex = 60, ey = 60;
      const sprite = this.enemy.sprite || (this.enemy.shape === 'triangle' ? 'enemies/toxic' : 'enemies/rektor');
      const bob = Math.sin(performance.now() / 400) * 4;
      drawSprite(ctx, sprite, ex, ey + bob, 100, 100);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(this.enemy.name, ex, ey + 124);
      const barW = 130;
      ctx.fillStyle = '#333';
      ctx.fillRect(ex, ey + 132, barW, 9);
      ctx.fillStyle = this.enemy.sparable ? '#ffdd33' : '#ff0066';
      ctx.fillRect(ex, ey + 132, barW * this.hpFrac, 9);
      ctx.fillStyle = '#888';
      ctx.font = '11px system-ui';
      ctx.fillText(`${this.enemy.hp}/${this.enemy.maxHp}`, ex + barW + 8, ey + 141);
    }

    // enemy taunt during their turn — speech bubble above the box
    if (this.phase === CombatPhase.DODGE && this.dodgeTaunt) {
      ctx.font = 'italic 15px system-ui';
      const lines = wrap(ctx, `„${this.dodgeTaunt}”`, this.box.w - 20).slice(0, 2);
      const bubbleH = 16 + lines.length * 20;
      const by = this.box.y - bubbleH - 14;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      ctx.fillRect(this.box.x, by, this.box.w, bubbleH);
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 1;
      ctx.strokeRect(this.box.x, by, this.box.w, bubbleH);
      ctx.fillStyle = '#fff';
      lines.forEach((ln, i) => ctx.fillText(ln, this.box.x + 10, by + 24 + i * 20));
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
      const blink = this.invuln > 0 && Math.floor(this.invuln * 20) % 2 === 0;
      if (!blink) {
        if (!drawSprite(ctx, 'ui/heart-orange', this.heart.x, this.heart.y, hs, hs)) {
          ctx.fillStyle = '#ff8800';
          ctx.fillRect(this.heart.x, this.heart.y, hs, hs);
        }
      }
      const remain = Math.ceil(this.dodgeTimer);
      ctx.fillStyle = '#ff6600';
      ctx.font = 'bold 13px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`Przetrwaj: ${remain}s`, this.box.x + this.box.w, this.box.y - 8);
      ctx.textAlign = 'left';
    }

    if (this.phase === CombatPhase.FIGHT_SWING) {
      const bx = this.box.x, by = this.box.y + this.box.h / 2 - 24, bw = this.box.w, bh = 48;
      g.renderer.drawNeonBox(this.box.x, this.box.y, this.box.w, this.box.h, '#00ffcc');
      ctx.fillStyle = '#222';
      ctx.fillRect(bx, by, bw, bh);
      // sweet spot
      ctx.fillStyle = 'rgba(0,255,120,0.35)';
      ctx.fillRect(bx + bw * 0.42, by, bw * 0.16, bh);
      ctx.fillStyle = 'rgba(255,221,51,0.9)';
      ctx.fillRect(bx + bw * 0.485, by, bw * 0.03, bh);
      // moving marker
      const mx = bx + this.swing * bw;
      ctx.fillStyle = '#ff2266';
      ctx.fillRect(mx - 3, by - 6, 6, bh + 12);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 15px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('[SPACJA] — traf w środek, by zadać maksymalny cios!', bx + bw / 2, by - 16);
      ctx.textAlign = 'left';
    }

    ctx.restore();

    // ---- bottom menu (never shakes) ----
    const menuY = H - 100;
    const menuH = 100;
    ctx.fillStyle = 'rgba(0,0,0,0.92)';
    ctx.fillRect(0, menuY, W, menuH);
    ctx.strokeStyle = '#00ffcc';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, menuY, W, menuH);

    if (this.phase === CombatPhase.SUBMENU) {
      const panelY = menuY - 150;
      ctx.fillStyle = 'rgba(0,0,0,0.94)';
      ctx.fillRect(16, panelY, W - 32, 142);
      ctx.strokeStyle = '#ffcc00';
      ctx.strokeRect(16, panelY, W - 32, 142);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 14px system-ui';
      ctx.fillText(this.submenuType === 'act' ? 'Wybierz akcję:  ([X] wróć)' : 'Wybierz przedmiot:  ([X] wróć)', 28, panelY + 22);
      const visible = this.submenuItems.slice(this.submenuScroll, this.submenuScroll + this.maxSubmenuVisible);
      visible.forEach((item, vi) => {
        const i = this.submenuScroll + vi;
        ctx.fillStyle = i === this.submenuIndex ? '#ffcc00' : '#bbb';
        ctx.font = i === this.submenuIndex ? 'bold 15px system-ui' : '14px system-ui';
        const label = fitText(ctx, `${i === this.submenuIndex ? '► ' : '   '}${item.short || item.label}`, W - 80);
        ctx.fillText(label, 32, panelY + 46 + vi * 22);
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
        const mercyReady = btn.id === 'mercy' && this.enemy?.sparable;
        ctx.fillStyle = selected ? (mercyReady ? '#ffdd33' : '#00ffcc') : (mercyReady ? '#5a4a10' : '#333');
        ctx.fillRect(bx, by, bw, bh);
        ctx.fillStyle = selected ? '#000' : '#fff';
        ctx.font = 'bold 17px system-ui';
        ctx.textAlign = 'center';
        ctx.fillText(btn.label + (mercyReady ? ' ★' : ''), bx + bw / 2, by + 26);
      });
      ctx.textAlign = 'left';
    } else if (this.phase === CombatPhase.MESSAGE) {
      ctx.fillStyle = '#fff';
      ctx.font = '15px system-ui';
      const lines = wrap(ctx, this.message, W - 48);
      lines.slice(0, 3).forEach((ln, i) => ctx.fillText(ln, 24, menuY + 34 + i * 20));
    }
  }
}

function wrap(ctx, text, maxW) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = word; }
    else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
