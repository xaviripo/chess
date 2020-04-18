import Manager from "../manager";
import { Socket } from "socket.io";
import Player from "../model/player";

const disconnectHandler = (manager: Manager, socket: Socket): void => {

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

export default disconnectHandler;