const KEY_MAP = {
  KeyW: 'w', KeyA: 'a', KeyS: 's', KeyD: 'd',
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  Space: 'space', Enter: 'enter',
  KeyR: 'r',
  KeyC: 'c',
};

export class Input {
  constructor() {
    this.keys = {};
    this.pressed = {};
    this.mouse = { x: 0, y: 0, down: false, clicked: false };
    this.enabled = true;
    this._onKeyDown = (e) => this._handleKey(e, true);
    this._onKeyUp = (e) => this._handleKey(e, false);
    this._onMouseDown = () => { if (this.enabled) { this.mouse.down = true; this.mouse.clicked = true; } };
    this._onMouseUp = () => { this.mouse.down = false; };
    this._onMouseMove = (e) => {
      this.mouse.x = e.offsetX;
      this.mouse.y = e.offsetY;
    };
    window.addEventListener('keydown', this._onKeyDown);
    window.addEventListener('keyup', this._onKeyUp);
  }

  attachCanvas(canvas) {
    canvas.addEventListener('mousedown', this._onMouseDown);
    canvas.addEventListener('mouseup', this._onMouseUp);
    canvas.addEventListener('mousemove', this._onMouseMove);
    this.canvas = canvas;
  }

  _handleKey(e, down) {
    const k = KEY_MAP[e.code];
    if (!k || !this.enabled) return;
    if (down && !this.keys[k]) this.pressed[k] = true;
    this.keys[k] = down;
    if (['space', 'arrowup', 'arrowdown'].includes(k)) e.preventDefault();
  }

  isDown(k) { return !!this.keys[k]; }
  wasPressed(k) { return !!this.pressed[k]; }

  consumePressed(k) {
    if (this.pressed[k]) { delete this.pressed[k]; return true; }
    return false;
  }

  movementVector() {
    let x = 0, y = 0;
    if (this.isDown('w') || this.isDown('up')) y -= 1;
    if (this.isDown('s') || this.isDown('down')) y += 1;
    if (this.isDown('a') || this.isDown('left')) x -= 1;
    if (this.isDown('d') || this.isDown('right')) x += 1;
    const len = Math.hypot(x, y);
    if (len > 0) { x /= len; y /= len; }
    return { x, y };
  }

  endFrame() {
    this.pressed = {};
    this.mouse.clicked = false;
  }
}
