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
import Game from './model/game';
import Player from './model/player';
import { Socket } from 'socket.io';
import Manager from './manager';


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

const disconnectHandler = (manager: Manager, socket: Socket) => (): void => {

  console.log(`${socket.id.substr(socket.id.length-1)}: disconnected`);

  // Remove player from list
  manager.removeSocket(socket);

  const [ game, player ] = manager.getGamePlayerBySocket(socket);

  // If they're not playing any game, just quit.
  if (!game) {
    return;
  }

  // The player who's now playing alone
  const otherPlayer: Player = game.players
    .find(otherPlayer => otherPlayer !== player);

  // Remove game from list
  manager.removeGame(game);

  manager.enter(otherPlayer.socket);

};

const actionHandler = (manager: Manager, socket: Socket) => (data: any): void => {

  const [ game, player ] = manager.getGamePlayerBySocket(socket);

  // This shouldn't happen. But... better safe than sorry
  if (!game) {
    throw new Error(`No game found for ${socket.id.substr(socket.id.length-1)}`);
  }

  const response = game.process(player, data);

  if (response.win) {
    manager.removeGame(game);
    // Calling enter on one of the two players is enough for both to re-enter
    // the waiting pool and immediately match on each other
    // The losing player will play as white
    manager.enter(player.socket);
    return;
  }

  if (response.success) {
    game.players.forEach(
      player => manager.send(player, response.name, response.data)
    );
  } else {
    manager.send(player, response.name, response.data);
  }

};

const manager = new Manager();

// WebSockets
io.on('connection', (socket: Socket): void => {

  console.log(`${socket.id.substr(socket.id.length-1)}: connected`);
  manager.addSocket(socket);

  // Register ALL handlers here.
  // Handlers should be registered once and globally upon socket connection.
  socket.on('disconnect', disconnectHandler(manager, socket));
  socket.on('action', actionHandler(manager, socket));

  manager.enter(socket);

});