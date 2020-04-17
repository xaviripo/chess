import Team from "./teams";
import Game from "./game";

export default class Player {

  // TODO find proper signature for _socket
  _socket: any;
  _game: Game;
  _team: Team;

  constructor(socket) {
    this._socket = socket;
  }

  get socket() {
    return this._socket;
  }

  get id() {
    return this._socket.id;
  }

  get team(): Team {
    return this._team;
  }

  set team(team) {
    this._team = team;
  }

  get game() {
    return this._game;
  }

  set game(game) {
    this._game = game;
  }
}
