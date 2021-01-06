//import { canvas } from './game.mjs';
const canvas = {
      width: 640,
      height: 480
    }

class Player {
  
  constructor({ x = 10, y = 10, score = 0, main, id }) {
    this.width = 110;
    this.height = 110;
    this.lr = {};
    this.score = score;
    this.id = id;
    this.speed = 5;
    this.isColliding = false;
    this.isMain = main;
    this.x = x;
    this.y = y;
    this.direction = {};
  }


  draw(ctx, avObj, players, snitch) {
    const currDir = Object.keys(this.direction).filter(dir => this.direction[dir]);
    currDir.forEach(dir => this.movePlayer(dir, this.speed))
    
    if (this.isMain) {
      ctx.fillStyle = 'white';
      ctx.font = '20px "WizardFont"';
      ctx.textAlign = 'center';
      ctx.fillText(`${this.calculateRank(players)}`, canvas.width / 2, 26);

      if (this.lr == 'left') {
        ctx.drawImage(avObj.av1Left, this.x, this.y, this.height, this.width);
      } else {
        ctx.drawImage(avObj.av1, this.x, this.y, this.height, this.width);
      } 
    } else {
      if (this.lr == 'left') {
        ctx.drawImage(avObj.av2Left, this.x, this.y, this.height, this.width);
      } else {
        ctx.drawImage(avObj.av2, this.x, this.y, this.height, this.width);
      } 
    }
    if (this.collision(snitch)) {
      snitch.caught = this.id;
    }
  }

  playerMoving(direction) {
    this.direction[direction] = true;
  }
  playerStopped(direction) {
    this.direction[direction] = false;
  }

  movePlayer(direction, speed) {
    
    if (direction === 'left') {
      this.lr = 'left';
      this.x - speed >= 0 ? this.x -= speed : this.x -= 0;
    }
    if (direction === 'right') {
      this.lr = 'right';
      this.x + speed <= canvas.width - this.width ? this.x += speed : this.x += 0;
    }
    if (direction === 'up') {
      this.y - speed >= 40 ? this.y -= speed : this.y -= 0;
    }
    if (direction === 'down') {
      this.y + speed <= canvas.height - 60 - this.height ? this.y += speed : this.y += 0;
    }
  }

  collision(snitch) {
    if ((this.x < snitch.x + snitch.width &&
    this.x + this.width > snitch.x &&
    this.y < snitch.y + snitch.height && 
    this.y + this.height > snitch.y)) {
      return true;
    }
  }

  calculateRank(arr) {
    const sortedScores = arr.sort((a, b) => b.score - a.score);
    const harryRank = this.score === 0 ? arr.length : (sortedScores.findIndex(obj => obj.id === this.id) + 1);
    return `Rank: ${harryRank} / ${arr.length}`
  }
}

export default Player;
