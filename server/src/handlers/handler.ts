import Manager from "../manager";
import { Socket } from "socket.io";

/**
 * Functions that receive data and perform actions, with only access to the
 * manager and socket passed beforehand.
 */
type Handler = (manager: Manager, socket: Socket, data?: any) => void;

export default Handler;