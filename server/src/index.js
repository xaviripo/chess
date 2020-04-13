/* app.js
Main entry point for the server.
*/

'use strict';


/******************************************************************************/
// Imports
/******************************************************************************/

// External
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const cors = require('cors');

// Iternal
const { Game } = require('./game');
const { Teams } = require('./teams');
const Player = require('./player');


/******************************************************************************/
// Globals
/******************************************************************************/

const PORT = process.env.PORT || 3001;


/******************************************************************************/
// Setup
/******************************************************************************/

const app = express();
app.use(cors());
const server = http.Server(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = socketIO(server);



/******************************************************************************/
// Managing messages and state
/******************************************************************************/

let games = [];
let sockets = [];

const getGamePlayerBySocket = (socket) => {
  for (const game of games) {
    for (const player of game.players) {
      if (player.socket === socket) {
        return [game, player];
      }
    }
  }
  return [null, null];
}

const enter = (socket) => {

  const player = new Player(socket);

  const playingSockets = [].concat(...games.map(game => game.players.map(player => player.socket)));
  const waitingSocket = sockets.find(
    socket => !playingSockets.includes(socket) && socket !== player.socket
  );

  // If everybody is already in a game, wait for somebody else to enter
  if (!waitingSocket) {

    // Send initial data to client
    player.socket.emit('init', {});
    return;

  }

  const playerA = new Player(waitingSocket);
  const playerB = player;

  console.log(`playing game between ${playerA.id.substr(playerA.id.length-1)} and ${playerB.id.substr(playerB.id.length-1)}`);

  let game = new Game(playerA, playerB);
  games.push(game);

  for (const player of [playerA, playerB]) {
    send(player, 'accepted', { scene: game.board.serialized });
  }

};

const send = (player, name, data) => {

  // Don't send .team directly as we might refactor it to a type later on
  switch (player.team) {
    case Teams.WHITE:
      data.team = 'WHITE';
      break;
    case Teams.BLACK:
      data.team = 'BLACK';
      break;
    default:
      throw new Error(`Player has invalid team ${player.team}`);
  }

  player.socket.emit(name, data);

}

const disconnectHandler = socket => () => {

  console.log(`${socket.id.substr(socket.id.length-1)}: disconnected`);

  // Remove player from list
  sockets = sockets.filter(s => s !== socket);

  const [ game, player ] = getGamePlayerBySocket(socket);

  // If they're not playing any game, just quit.
  if (!game) {
    return;
  }

  // The player who's now playing alone
  const otherPlayer = game.players
    .find(otherPlayer => otherPlayer !== player);

  // Remove game from list
  games = games.filter(g => g !== game);

  enter(otherPlayer.socket);

};

const actionHandler = socket => data => {

  const [ game, player ] = getGamePlayerBySocket(socket);

  // This shouldn't happen. But... better safe than sorry
  if (!game) {
    return;
  }

  const response = game.process(player, data);

  if (response.win) {
    games = games.filter(g => g !== game);
    // Calling enter on one of the two players is enough for both to re-enter
    // the waiting pool and immediately match on each other
    // The losing player will play as white
    enter(player.socket);
    return;
  }

  if (response.success) {
    game.players.forEach(
      player => send(player, response.name, response.data)
    );
  } else {
    send(player, response.name, response.data);
  }

};

// WebSockets
io.on('connection', socket => {

  console.log(`${socket.id.substr(socket.id.length-1)}: connected`);
  sockets.push(socket);

  // Register ALL handlers here.
  // Handlers should be registered once and globally upon socket connection.
  socket.on('disconnect', disconnectHandler(socket));
  socket.on('action', actionHandler(socket));

  enter(socket);

});