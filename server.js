require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const expect = require('chai');
const socket = require('socket.io');
const helmet = require('helmet');
const cors = require('cors');

const fccTestingRoutes = require('./routes/fcctesting.js');
const runner = require('./test-runner.js');

const app = express();

app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(helmet.noCache());
app.use(helmet.hidePoweredBy({ setTo: 'PHP 7.4.3' }));

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/assets', express.static(process.cwd() + '/assets'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Index page (static HTML)
app.route('/')
  .get(function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
  }); 

//For FCC testing purposes
fccTestingRoutes(app);
    
// 404 Not Found Middleware
app.use(function(req, res, next) {
  res.status(404)
    .type('text')
    .send('Not Found');
});

const portNum = process.env.PORT || 3000;

// Set up server and tests
const server = app.listen(portNum, () => {
  console.log(`Listening on port ${portNum}`);
  if (process.env.NODE_ENV==='test') {
    console.log('Running Tests...');
    setTimeout(function () {
      try {
        runner.run();
      } catch (error) {
        console.log('Tests are not valid:');
        console.error(error);
      }
    }, 1500);
  }
});

let activePlayers = [];
let caughtSnitches = [];
const { startPosition, canvasCalcs } = require('./public/canvas-calculations');
const Collectible = require('./public/Collectible');
const createSnitch = () => {
  return new Collectible({
    x: startPosition(canvasCalcs.fieldMinX, canvasCalcs.fieldMaxX, 5),
    y: startPosition(canvasCalcs.fieldMinY, canvasCalcs.fieldMaxY, 5),
    value: 1,
    id: Date.now()
  })
}
let initSnitch = createSnitch();

const io = socket(server);

io.sockets.on('connection', socket => {
  socket.emit('init', { id: socket.id, players: activePlayers, initSnitch });

  socket.on('new-player', playerObj => {
    playerObj.id = socket.id;
    activePlayers.push(playerObj);
    socket.broadcast.emit('new-player', playerObj);
  });

  socket.on('disconnect', () => {
    socket.broadcast.emit('player-disconnect', socket.id);
    activePlayers = activePlayers.filter(player => player.id !== socket.id);
  });

  socket.on('move-player', (keyPressed, playerObj) => {
    const movingPlayer = activePlayers.find(player => player.id === socket.id);
    if (movingPlayer) {
      movingPlayer.x = playerObj.x;
      movingPlayer.y = playerObj.y;
      movingPlayer.lr = playerObj.lr;
      socket.broadcast.emit('move-player', { keyPressed, movingPlayer });
    }
  });

  socket.on('stop-player', (keyReleased, playerObj) => {
    const stoppedPlayer = activePlayers.find(player => player.id === socket.id );
    if (stoppedPlayer) {
      stoppedPlayer.x = playerObj.x;
      stoppedPlayer.y = playerObj.y;
      stoppedPlayer.lr = playerObj.lr;
      socket.broadcast.emit('stop-player', { keyReleased, stoppedPlayer });
    }
  });

  socket.on('snitch-caught', (snitch) => {
    if (!caughtSnitches.includes(snitch.id)) {
      const scoringPlayer = activePlayers.find(player => player.id === snitch.caught);
      if (scoringPlayer) {
        const scoringPlayerSocket = io.sockets.connected[scoringPlayer.id];

        caughtSnitches.push(snitch.id);
        scoringPlayer.score += snitch.value;
        io.emit('player-scored', scoringPlayer);

        if (scoringPlayer.score >= 100) {
          scoringPlayerSocket.emit('game-over', 'won');
          scoringPlayerSocket.broadcast.emit('game-over', 'lost');
        }

        newSnitch = createSnitch();
        io.emit('new-snitch', newSnitch);
      }
    } 
  });
});

module.exports = app; // For testing
