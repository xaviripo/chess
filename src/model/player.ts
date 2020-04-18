import Team from "./teams";
import Game from "./game";
import { Socket } from "socket.io";

export default class Player {

  // TODO find proper signature for _socket
  _socket: any;
  _game: Game;
  _team: Team;

  constructor(socket: Socket) {
    this._socket = socket;
  }

  get socket(): Socket {
    return this._socket;
  }

  get id(): string {
    return this._socket.id;
  }

  get team(): Team {
    return this._team;
  }

  set team(team: Team) {
    this._team = team;
  }

  get game(): Game {
    return this._game;
  }

  set game(game: Game) {
    this._game = game;
  }
}
