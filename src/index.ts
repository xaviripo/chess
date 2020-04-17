/* app.js
Main entry point for the server.
*/

'use strict';


/******************************************************************************/
// Imports
/******************************************************************************/

// External
import * as http from 'http';
import express, { Application, NextFunction } from 'express';
import socketIO from 'socket.io';

// Iternal
import Game from './game';
import Player from './player';
import { Socket } from 'socket.io';


/******************************************************************************/
// Globals
/******************************************************************************/

const PORT = process.env.PORT || 3001;


/******************************************************************************/
// Setup
/******************************************************************************/

const app: Application = express();
const server = new http.Server(app);

app.get('/socket.io/', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
	res.setHeader('Access-Control-Request-Method', '*');
	res.setHeader('Access-Control-Allow-Methods', 'GET');
	res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = socketIO(server);



/******************************************************************************/
// Managing messages and state
/******************************************************************************/

let games: Game[] = [];
let sockets: Socket[] = [];

function getGamePlayerBySocket(socket: Socket): [Game, Player] {
  for (const game of games) {
    for (const player of game.players) {
      if (player.socket === socket) {
        return [game, player];
      }
    }
  }
  return [null, null];
}

const enter = (socket: Socket): void => {

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

const send = (player: Player, name: string, data: any): void => {
  player.socket.emit(name, { ...data, team: player.team });
}

const disconnectHandler = (socket: Socket) => (): void => {

  console.log(`${socket.id.substr(socket.id.length-1)}: disconnected`);

  // Remove player from list
  sockets = sockets.filter(s => s !== socket);

  const [ game, player ] = getGamePlayerBySocket(socket);

  // If they're not playing any game, just quit.
  if (!game) {
    return;
  }

  // The player who's now playing alone
  const otherPlayer: Player = game.players
    .find(otherPlayer => otherPlayer !== player);

  // Remove game from list
  games = games.filter(g => g !== game);

  enter(otherPlayer.socket);

};

const actionHandler = (socket: Socket) => (data: any): void => {

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
io.on('connection', (socket: Socket): void => {

  console.log(`${socket.id.substr(socket.id.length-1)}: connected`);
  sockets.push(socket);

  // Register ALL handlers here.
  // Handlers should be registered once and globally upon socket connection.
  socket.on('disconnect', disconnectHandler(socket));
  socket.on('action', actionHandler(socket));

  enter(socket);

});