import Manager from "../manager";
import { Socket } from "socket.io";

const connectHandler = (manager: Manager, socket: Socket) => {
  console.log(`${socket.id.substr(socket.id.length-1)}: connected`);
  manager.addSocket(socket);
  manager.enter(socket);
};

export default connectHandler;