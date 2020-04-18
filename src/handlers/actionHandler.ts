import Manager from "../manager";
import { Socket } from "socket.io";

const actionHandler = (manager: Manager, socket: Socket, data: any): void => {

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

export default actionHandler;