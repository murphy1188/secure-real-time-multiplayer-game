class Collectible {
  constructor({x = 10, y = 10, value, id}) {
    this.x = x;
    this.y = y;
    this.value = value;
    this.id = id;
    this.width = 30;
    this.height = 30;
  }

  draw(ctx, snitchImg) {
    ctx.drawImage(snitchImg, this.x, this.y, this.height, this.width);
  }

}

/*
  Note: Attempt to export this for use
  in server.js
*/
try {
  module.exports = Collectible;
} catch(e) {}

export default Collectible;
