import { createRoom1 } from './rooms/room1.js';
import { createRoom2 } from './rooms/room2.js';
import { createRoom3 } from './rooms/room3.js';
import { createRoom4 } from './rooms/room4.js';
import { createRoom5 } from './rooms/room5.js';

export class RoomManager {
  constructor(game) {
    this.game = game;
    this.rooms = [
      createRoom1(game),
      createRoom2(game),
      createRoom3(game),
      createRoom4(game),
      createRoom5(game),
    ];
    this.transitioning = false;
    this.transitionAlpha = 0;
    this.pendingRoom = null;
  }

  get current() {
    return this.rooms[this.game.roomIndex];
  }

  enterRoom(index) {
    if (this.transitioning) return;
    this.pendingRoom = index;
    this.transitioning = true;
    this.transitionPhase = 'out';
    this.game.renderer.setFade(1);
  }

  updateTransition(dt) {
    if (!this.transitioning) return;
    if (this.game.renderer.fadeAlpha >= 0.95 && this.transitionPhase === 'out') {
      this.game.roomIndex = this.pendingRoom;
      this.pendingRoom = null;
      this.game.resetRoomState();
      const room = this.current;
      if (room.enter) room.enter();
      this.transitionPhase = 'in';
      this.game.renderer.setFade(0);
    }
    if (this.transitionPhase === 'in' && this.game.renderer.fadeAlpha <= 0.05) {
      this.transitioning = false;
      this.transitionPhase = null;
    }
  }

  update(dt) {
    if (this.transitioning) {
      this.updateTransition(dt);
      return;
    }
    const room = this.current;
    if (room && room.update) room.update(dt);
  }

  draw(ctx) {
    const room = this.current;
    if (room && room.draw) room.draw(ctx);
  }
}
