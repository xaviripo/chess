# ♟️🔌 WebSocket Chess

WebSocket-based chess server and client

## Description

This repo contains two different applications: a frontend (`client`) and a backend (`server`).

The client is a React app that connects, using WebSockets, to the specified domain which controls the logic of the game.
The server is a Node.js app that listents to WebSocket connections.
When a new client connects, it's added to a waiting list.
Whenever two clients are waiting, they are automatically matched and a game starts between them, until the game ends or one of the two disconnects.

## Deployment

TODO
