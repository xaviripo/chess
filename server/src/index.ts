/* app.js
Main entry point for the server.
*/

'use strict';


/******************************************************************************/
// Imports
/******************************************************************************/

// External
import * as http from 'http';
import express, { Application } from 'express';
import { Server } from 'socket.io';

// Iternal
import Manager from './manager';
import connectHandler from './handlers/connectHandler';
import disconnectHandler from './handlers/disconnectHandler';
import actionHandler from './handlers/actionHandler';


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
  // Allow CORS
  // TODO play a little with these headers to find out if they are all necessary
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Request-Method', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', '*');
  next();
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io: Server = new Server(server);

const manager: Manager = new Manager(io);

manager.registerHandler('connect', connectHandler);
manager.registerHandler('disconnect', disconnectHandler);
manager.registerHandler('action', actionHandler);