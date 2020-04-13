const { Teams } = require('../teams');

class Piece {

  constructor(team, square) {
    this._team = team;
    this._square = square;
    this._virgin = true;
  }

  get team() {
    return this._team;
  }

  get points() {
    throw new Error('Must implement this method');
  }

  get square() {
    return this._square;
  }

  set square(square) {
    this._square = square;
  }

  get board() {
    return this._square.board;
  }

  get name() {
    throw new Error('Must implement this method');
  }

  get serialized() {
    return `${this.team.toLowerCase()}_${this.name}`;
  }

  get virgin() {
    return this._virgin;
  }

  set virgin(virgin) {
    this._virgin = virgin;
  }

  canMove(to) {
    throw new Error('Must implement this method');
  }

}

module.exports = Piece;