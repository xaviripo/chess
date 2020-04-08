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

let game = [];

// WebSockets
io.on('connection', socket => {

  // Send initial data to client
  console.log(`${socket.id}: connected`);
  socket.emit('init', { game });

  socket.on('disconnect', data => {
    console.log(`${socket.id}: disconnected`);
  });

  socket.on('action', data => {

    let response = {};

    // Apply the action
    switch (data.type) {
      case 'APPEND':
        game.push(data.payload);
        response = {
          success: true,
          name: 'accepted',
          data: {
            game,
          }
        };
        break;
      case 'REMOVE':
        if (game.length === 0) {
          response = {
            success: false,
            name: 'illegal',
            data: {
              message: 'Cannot remove from empty array',
              game,
            }
          };
        } else {
          game.pop()
          response = {
            success: true,
            name: 'accepted',
            data: {
              game,
            }
          }
        }
        break;
      default:
        response = {
          success: false,
          name: 'unknown',
          data: {
            message: 'Unknown operation',
            game,
          }
        };
    }

    if (response.success) {
      io.emit(response.name, response.data);
    } else {
      socket.emit(response.name, response.data);
    }

  });

});