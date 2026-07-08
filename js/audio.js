const MUSIC_TRACKS = {
  title: 'assets/audio/title.wav',
  explore: 'assets/audio/explore.wav',
  battle: 'assets/audio/battle.wav',
  boss: 'assets/audio/boss.wav',
  ending: 'assets/audio/ending.wav',
};

export class AudioManager {
  constructor() {
    this.muted = localStorage.getItem('gienek-muted') === '1';
    this.currentTrack = null;
    this.musicEl = null;
    this.ctx = null;
    try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
  }

  toggleMute() {
    this.setMuted(!this.muted);
    return this.muted;
  }

  setMuted(m) {
    this.muted = m;
    localStorage.setItem('gienek-muted', m ? '1' : '0');
    if (this.musicEl) this.musicEl.muted = m;
  }

  playMusic(track) {
    if (this.currentTrack === track) return;
    this.currentTrack = track;
    const src = MUSIC_TRACKS[track];
    if (!src) return;
    if (this.musicEl) { this.musicEl.pause(); this.musicEl = null; }
    const el = new Audio(src);
    el.loop = true;
    el.volume = 0.35;
    el.muted = this.muted;
    el.play().catch(() => {});
    this.musicEl = el;
  }

  stopMusic() {
    if (this.musicEl) { this.musicEl.pause(); this.musicEl = null; }
    this.currentTrack = null;
  }

  resumeContext() {
    if (this.ctx?.state === 'suspended') this.ctx.resume();
  }

  playSfx(name) {
    if (this.muted || !this.ctx) return;
    this.resumeContext();
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    const presets = {
      select: { f: 520, d: 0.08, type: 'square', vol: 0.08 },
      hit: { f: 120, d: 0.15, type: 'sawtooth', vol: 0.12 },
      dialogue_blip: { f: 680, d: 0.04, type: 'sine', vol: 0.04 },
      smite: { f: 880, d: 0.25, type: 'square', vol: 0.15 },
      qte_success: { f: 740, d: 0.12, type: 'sine', vol: 0.1 },
      qte_fail: { f: 180, d: 0.2, type: 'sawtooth', vol: 0.1 },
      door_open: { f: 400, d: 0.3, type: 'triangle', vol: 0.1 },
      komenda_flash: { f: 300, d: 0.4, type: 'square', vol: 0.12 },
      attack: { f: 220, d: 0.14, type: 'square', vol: 0.12 },
      crit: { f: 660, d: 0.22, type: 'square', vol: 0.15 },
      spare: { f: 620, d: 0.3, type: 'triangle', vol: 0.12 },
      pickup: { f: 900, d: 0.12, type: 'sine', vol: 0.1 },
    };
    const p = presets[name] || presets.select;
    osc.type = p.type;
    osc.frequency.setValueAtTime(p.f, t);
    gain.gain.setValueAtTime(p.vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + p.d);
    osc.start(t);
    osc.stop(t + p.d);
  }

  musicForRoom(index, gameState) {
    if (gameState === 'ENDING' || gameState === 'CREDITS') return 'ending';
    if (gameState === 'COMBAT_BULLETHELL') return index >= 4 ? 'boss' : 'battle';
    if (gameState === 'QTE_MODE') return index >= 3 ? 'boss' : 'battle';
    if (index === 0) return 'explore';
    if (index >= 4) return 'boss';
    return 'battle';
  }
}
