import Game from "./model/game";
import { Socket, Server } from "socket.io";
import Player from "./model/player";
import Handler from "./handlers/handler";

export default class Manager {

  /**
   * List of games currently being played.
   */
  games: Game[];

  /**
   * List of connected sockets, independently of whether they are playing or
   * not.
   */
  sockets: Socket[];

  /**
   * Global socket.io server object.
   */
  io: Server;

  handlers: {name: string, handler: Handler}[] = [];

  constructor(io: Server) {
    this.games = [];
    this.sockets = [];
    this.io = io;
    io.on('connection', (socket: Socket): void => {
      for (const { name, handler } of this.handlers) {
        if (name === 'connect') {
          handler(this, socket, null);
        } else {
          socket.on(name, data => handler(this, socket, data));
        }
      }
    });
  }

  registerHandler(name: string, handler: Handler): void {
    this.handlers.push({name, handler});
  }

  getGamePlayerBySocket(socket: Socket): [Game, Player] {
    for (const game of this.games) {
      for (const player of game.players) {
        if (player.socket === socket) {
          return [game, player];
        }
      }
    }
    return [null, null];
  }

  send(player: Player, name: string, data: any): void {
    player.socket.emit(name, { ...data, team: player.team });
  }

  enter(socket: Socket): void {

    const player = new Player(socket);

    const playingSockets = [].concat(...this.games.map(game => game.players.map(player => player.socket)));
    const waitingSocket = this.sockets.find(
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
    this.addGame(game);

    for (const player of [playerA, playerB]) {
      this.send(player, 'accepted', { scene: game.board.serialized });
    }

  }

  addGame(game: Game): void {
    this.games.push(game);
  }

  removeGame(game: Game): void {
    this.games = this.games.filter(g => g !== game);
  }

  addSocket(socket: Socket): void {
    this.sockets.push(socket);
  }

  removeSocket(socket: Socket): void {
    this.sockets = this.sockets.filter(s => s !== socket);
  }

}