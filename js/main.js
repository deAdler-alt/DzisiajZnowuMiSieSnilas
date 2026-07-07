import { W, H, GameState } from './utils.js';
import { Input } from './input.js';
import { Renderer } from './renderer.js';
import { Dialogue } from './dialogue.js';
import { CombatSystem } from './combat.js';
import { PlatformerSystem } from './platformer.js';
import { QTESystem } from './qte.js';
import { RoomManager } from './room-manager.js';
import { AudioManager } from './audio.js';
import { TitleScreen } from './title-screen.js';
import { CrawlScreen } from './crawl.js';
import { loadAll } from './assets.js';
import { INTRO_CRAWL, CREDITS_CRAWL } from './story.js';

class Game {
  constructor() {
    this.canvas = document.getElementById('game');
    this.ctx = this.canvas.getContext('2d');
    this.loader = document.getElementById('loader');
    this.input = new Input();
    this.input.attachCanvas(this.canvas);
    this.renderer = new Renderer(this.ctx);
    this.dialogue = new Dialogue(this);
    this.combat = new CombatSystem(this);
    this.platformer = new PlatformerSystem(this);
    this.qte = new QTESystem(this);
    this.roomManager = new RoomManager(this);
    this.audio = new AudioManager();
    this.titleScreen = new TitleScreen(this);
    this.crawl = new CrawlScreen(this);
    this.lastTime = 0;
    this.paused = false;
    this.gameOverActive = false;
    this.gameState = GameState.LOADING;
    this.resize();
    window.addEventListener('resize', () => this.resize());
    this.boot();
  }

  async boot() {
    await loadAll((p) => {
      if (this.loader) this.loader.textContent = `Ładowanie assetów… ${Math.floor(p * 100)}%`;
    });
    if (this.loader) this.loader.classList.add('hidden');
    this.gameState = GameState.TITLE_SCREEN;
    this.audio.playMusic('title');
    this.lastTime = performance.now();
    requestAnimationFrame((t) => this.loop(t));
  }

  restart() {
    this.hp = 20;
    this.maxHp = 20;
    this.roomIndex = 0;
    this.inventory = { tabletka: 0, pepsi: 0 };
    this.keys = { pierwszyTurniej: false, pierwszaPraca: false, najlepszaImpreza: false };
    this.komendaUsed = false;
    this.debuffs = [];
    this.paused = false;
    this.gameOverActive = false;
    this.input.enabled = true;
    this.combat.reset();
    this.platformer.reset();
    this.qte.reset();
    this.renderer.fadeAlpha = 0;
    this.renderer.fadeTarget = 0;
    this.roomManager.transitioning = false;
    this.roomManager.pendingRoom = null;
  }

  startIntroCrawl() {
    this.restart();
    this.gameState = GameState.INTRO_CRAWL;
    this.crawl.start(INTRO_CRAWL, () => this.startGame());
  }

  startGame() {
    this.gameState = GameState.EXPLORATION_TOPDOWN;
    const room = this.roomManager.current;
    if (room?.enter) room.enter();
    this.updateMusic();
  }

  startCredits() {
    this.gameState = GameState.CREDITS;
    this.input.enabled = true;
    this.audio.playMusic('ending');
    this.crawl.start(CREDITS_CRAWL, () => {
      this.gameState = GameState.TITLE_SCREEN;
      this.audio.playMusic('title');
    }, 36);
  }

  goToTitle() {
    this.restart();
    this.gameState = GameState.TITLE_SCREEN;
    this.input.enabled = true;
    this.audio.playMusic('title');
  }

  resetRoomState() {
    this.combat.reset();
    this.platformer.reset();
    this.qte.reset();
    this.debuffs = [];
    this.updateMusic();
  }

  enterRoom(index) {
    this.roomManager.enterRoom(index);
  }

  updateMusic() {
    const track = this.audio.musicForRoom(this.roomIndex, this.gameState);
    this.audio.playMusic(track);
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  damage(amount) {
    this.hp = Math.max(0, this.hp - amount);
    if (this.hp <= 0) this.gameOver();
  }

  gameOver() {
    if (this.gameOverActive) return;
    this.gameOverActive = true;
    this.input.enabled = false;
    this.dialogue.show([
      { speaker: 'System', text: 'Gienek padł... Ale wspomnienia zostają.' },
      { speaker: 'System', text: 'Naciśnij R aby spróbować ponownie.' },
    ], () => { this.input.enabled = true; });
  }

  resize() {
    const scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    this.canvas.width = W;
    this.canvas.height = H;
    this.canvas.style.width = `${W * scale}px`;
    this.canvas.style.height = `${H * scale}px`;
    this.scale = scale;
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;
    if (this.gameOverActive) {
      if (this.input.consumePressed('r') && !this.dialogue.active) {
        this.gameOverActive = false;
        this.goToTitle();
      }
    } else {
      this.update(dt);
    }
    this.draw();
    this.input.endFrame();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    this.renderer.update(dt);
    if (this.gameState === GameState.TITLE_SCREEN) {
      this.titleScreen.update(dt);
      return;
    }
    if (this.gameState === GameState.INTRO_CRAWL || this.gameState === GameState.CREDITS) {
      this.crawl.update(dt);
      return;
    }
    const allowRoomUpdate = !this.dialogue.active && !this.paused;
    const endingNeedsUpdate = this.gameState === GameState.ENDING;
    if (allowRoomUpdate || endingNeedsUpdate) {
      this.roomManager.update(dt);
    }
    this.dialogue.update(dt);
    if (this.gameState === GameState.ENDING) {
      this.roomManager.current?.handleEndingInput?.();
    }
  }

  draw() {
    const { ctx } = this;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (this.gameState === GameState.LOADING) {
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, W, H);
    } else if (this.gameState === GameState.TITLE_SCREEN) {
      this.titleScreen.draw(ctx);
    } else if (this.gameState === GameState.INTRO_CRAWL || this.gameState === GameState.CREDITS) {
      this.crawl.draw(ctx);
    } else {
      this.roomManager.draw(ctx);
      this.renderer.drawHUD(this);
    }
    this.dialogue.draw(ctx);
    this.renderer.drawOverlays();
    if (this.gameOverActive && !this.dialogue.active) {
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#ff4444';
      ctx.font = 'bold 32px system-ui';
      ctx.textAlign = 'center';
      ctx.fillText('KONIEC GRY', W / 2, H / 2);
      ctx.fillStyle = '#fff';
      ctx.font = '18px system-ui';
      ctx.fillText('Naciśnij R aby wrócić do menu', W / 2, H / 2 + 40);
      ctx.textAlign = 'left';
    }
  }
}

new Game();
