import Manager from "../manager";
import { Socket } from "socket.io";

const actionHandler = (manager: Manager, socket: Socket, data: any): void => {

  const [ game, player ] = manager.getGamePlayerBySocket(socket);

  // This shouldn't happen. But... better safe than sorry
  if (!game) {
    throw new Error(`No game found for ${socket.id.substr(socket.id.length-1)}`);
  }

  const [ message, response ] = game.process(player, data);

  if (response.winner) {
    manager.removeGame(game);
    // Calling enter on one of the two players is enough for both to re-enter
    // the waiting pool and immediately match on each other
    // The losing player will play as white
    manager.enter(player.socket);
    return;
  }

  switch (message) {
    case 'accepted':
      // Broadcast response
      for (const player of game.players) {
        manager.send(player, message, response);
      }
      break;
    case 'not accepted':
      // Just send the error message to the currently playing client
      manager.send(player, message, response);
      break;
    default:
      throw new Error('Unmanaged message case received from Game.process()');
  }

};

export default actionHandler;