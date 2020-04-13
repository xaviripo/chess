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

// Iternal
const { Game } = require('./game');
const { Teams } = require('./teams');


/******************************************************************************/
// Globals
/******************************************************************************/

const PORT = 3001;


/******************************************************************************/
// Setup
/******************************************************************************/

const app = express();
const server = http.Server(app);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = socketIO(server);





class Player {
  constructor(socket) {
    this._socket = socket;
  }

  get socket() {
    return this._socket;
  }

  get id() {
    return this._socket.id;
  }

  get team() {
    return this._team;
  }

  set team(team) {
    this._team = team;
  }

  get game() {
    return this._game;
  }

  set game(game) {
    this._game = game;
  }
}

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

const disconnectHandler = player => () => {

  console.log(`${player.socket.id}: disconnected`);

  const game = player.game;

  // If they're not playing any game, just quit.
  if (!game) {
    return;
  }

  // The player who's now playing alone
  const otherPlayer = game.players
    .find(otherPlayer => otherPlayer !== player);

  games = games.filter(g => g !== game);

  // TODO this isn't really what we want.
  // if there is another player waiting, then they both
  // will stay waiting instead of being matched.
  otherPlayer.game = null;
  otherPlayer.socket.emit('init', {});

};

const actionHandler = player => data => {

  const game = player.game;

  // This shouldn't happen. But... better safe than sorry
  if (!game) {
    return;
  }

  const response = game.process(player, data);

  if (response.success) {
    game.players.forEach(
      player => send(player, response.name, response.data)
    );
  } else {
    send(player, response.name, response.data);
  }

};

let games = [];
let players = [];

// WebSockets
io.on('connection', socket => {

  console.log(`${socket.id}: connected`);

  // Send initial data to client
  socket.emit('init', {});

  const player = new Player(socket);

  socket.on('disconnect', disconnectHandler(player));
  socket.on('action', actionHandler(player));

  const waiting = players.find(player => !player.game);

  players.push(player);

  // If everybody is already in a game, wait for somebody else to enter
  if (!waiting) {
    return;
  }

  const playerA = waiting;
  const playerB = player;

  console.log(`playing game between ${playerA.id} and ${playerB.id}`);

  let game = new Game(playerA, playerB);
  games.push(game);

  for (const player of [playerA, playerB]) {
    send(player, 'accepted', { scene: game.board.serialized });
  }

});