class Player {
  constructor(socket) {
    this._socket = socket;
  }

  get socket() {
    return this._socket;
  }

  get id() {
    return this._socket.id;
  }

  get team() {
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

module.exports = Player;