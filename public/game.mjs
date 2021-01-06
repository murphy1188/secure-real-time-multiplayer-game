import Player from './Player.mjs';
import Collectible from './Collectible.mjs';
import movement from './controller.mjs';
import { startPosition, canvasCalcs } from './canvas-calculations.mjs';


const socket = io();
console.log("game.mjs io: " + io);
console.log('game.mjs socket: ' + socket);
const canvas = document.getElementById('game-window');
const ctx = canvas.getContext('2d', { alpha: false });

const loadImg = src => {
  const img = new Image();
  img.src = src;
  return img;
}

let av1 = loadImg('./public/avatars/harry-right.png');
let av1Left = loadImg('./public/avatars/harry-left.png');
let av2 = loadImg('./public/avatars/draco-right.png');
let av2Left = loadImg('./public/avatars/draco-left.png');
let snitchImg = loadImg('./public/images/snitch.png');

let activePlayers = [];
let frameId;
let snitch;
let gameOver;

socket.on('init', ({ id, players, initSnitch }) => {

  cancelAnimationFrame(frameId);

  const harry = new Player({
    x: startPosition(canvasCalcs.fieldMinX, canvasCalcs.fieldMaxX, 5),
    y: startPosition(canvasCalcs.fieldMinY, canvasCalcs.fieldMaxY, 5),
    id,
    main: true
  });

  socket.on('new-snitch', newSnitch => {
    snitch = new Collectible(newSnitch);
  });

  movement(harry, socket);

  socket.emit('new-player', harry);

  socket.on('new-player', playerObj => {
    const playerIds = activePlayers.map(player => player.id);
    if (!playerIds.includes(playerObj.id)) {
      activePlayers.push( new Player(playerObj));
    }
  });

  socket.on('move-player', ({ keyPressed, movingPlayer }) => {
    const player = activePlayers.find(player => player.id === movingPlayer.id);
    player.playerMoving(keyPressed);
  
    player.x = movingPlayer.x;
    player.y = movingPlayer.y;
    player.lr = movingPlayer.lr;
  });

  socket.on('stop-player', ({ keyReleased, stoppedPlayer}) => {
    const player = activePlayers.find(player => player.id === stoppedPlayer.id);
    player.playerStopped(keyReleased);

    player.x = stoppedPlayer.x;
    player.y = stoppedPlayer.y;
    player.lr = stoppedPlayer.lr;
  });

  socket.on('player-scored', playerObject => {
    const scoringPlayer = activePlayers.find(player => player.id === playerObject.id);
    scoringPlayer.score = playerObject.score;
  });

  socket.on('game-over', winLose => {
    gameOver = winLose;
  })

  socket.on('player-disconnect', id =>  {
    activePlayers = activePlayers.filter(player => player.id !== id);
  })

  activePlayers = players.map(val => new Player(val)).concat(harry);
  snitch = new Collectible(initSnitch);

  animateCanvas();

});

const animateCanvas = () => {
  canvas.style.letterSpacing = 6 + 'px';
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // draw rank infobar
  ctx.fillStyle = '#00000085';
  ctx.fillRect(0, 0, canvas.width, 40);

  //draw controls infobar
  ctx.fillStyle = '#00000085';
  ctx.fillRect(0, canvas.height - 60, canvas.width, 60);

  // draw control infobar title
  ctx.fillStyle = 'white';
  ctx.font = '18px "WizardFont"';
  ctx.textAlign = 'center';

  ctx.fillText('CONTROLS', canvas.width / 2, canvas.height - 38);

  // draw underline of infobar title
  ctx.beginPath();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.moveTo((canvas.width / 2) - 62, canvas.height - 32);
  ctx.lineTo((canvas.width / 2) + 56, canvas.height - 32);
  ctx.stroke();

  // draw control infobar text
  ctx.fillStyle = 'white';
  ctx.font = '16px "WizardFont"';
  ctx.textAlign = 'center';
  ctx.fillText('W = UP | S = DOWN | A = LEFT | D = RIGHT', canvas.width / 2, canvas.height - 12);

  activePlayers.forEach(player => {
    player.draw(ctx, { av1, av1Left, av2, av2Left }, activePlayers, snitch);
  });

  snitch.draw(ctx, snitchImg);

  if (snitch.caught) {
    socket.emit('snitch-caught', snitch)
  }

  if (gameOver) {
    ctx.fillStyle = 'white';
    ctx.font = '35px "WizardFont"';
    ctx.fillText(`You ${gameOver}! Refresh screen to play again.`, canvas.width / 2, 180);
  }

  if (!gameOver) {
    frameId = requestAnimationFrame(animateCanvas);
  }
}


//export { canvas }