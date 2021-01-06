
const movement = (player, socket) => {
  document.onkeydown = e => {
    let keyPressed = checkKey(e.keyCode);
    if (keyPressed) {
      player.playerMoving(keyPressed);
      socket.emit('move-player', keyPressed, player);
    }
    e.preventDefault();
  }

  document.onkeyup = e => {
    let keyReleased = checkKey(e.keyCode);
    if (keyReleased) {
      player.playerStopped(keyReleased);
      socket.emit('stop-player', keyReleased, player);
    }
  }
}

const checkKey = key => {
  if (key === 37 || key === 65) {
    return 'left';
  }
  if (key === 39 || key === 68) {
    return 'right';
  }
  if (key === 38 || key === 87) {
    return 'up';
  }
  if (key === 40 || key === 83 ) {
    return 'down';
  }
}


export default movement; 