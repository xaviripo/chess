const { ROWS, manhattanDistance, shareCol, shareAxis, shareDiagonal } = require('./coords');
const { Teams } = require('./teams');

class Piece {

  static get pieces() {
    return new Map([
      [Teams.WHITE, new Map([
        [King, '♔'],
        [Queen, '♕'],
        [Rook, '♖'],
        [Bishop, '♗'],
        [Knight, '♘'],
        [Pawn, '♙'],
      ])],
      [Teams.BLACK, new Map([
        [King, '♚'],
        [Queen, '♛'],
        [Rook, '♜'],
        [Bishop, '♝'],
        [Knight, '♞'],
        [Pawn, '♟'],
      ])],
    ])
  }

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

  get serialized() {
    return Piece.pieces
      .get(this.team)
      .get(this.constructor);
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

class King extends Piece {

  get points() {
    return Infinity;
  }

  canMove(to) {
    const from = this.square.coords;
    if (shareAxis(from, to) || shareDiagonal(from, to)) {
      const distance = manhattanDistance(from, to);

      const piece = this.board.getSquareByCoords(to).piece;
      if (piece && piece.team === this.team) {
        return false;
      }

      return distance === 1;

    }

    return false;

  }

}

class Queen extends Piece {

  get points() {
    return 9;
  }

  canMove(to) {
    const from = this.square.coords;
    if (shareAxis(from, to) || shareDiagonal(from, to)) {
      const path = this.board.getPath(from, to);

      const piece = path[path.length-1].piece;
      if (piece && piece.team === this.team) {
        return false;
      }

      for (const square of path.slice(1, -1)) {
        if (square.piece) {
          return false;
        }
      }

      return true;

    }

    return false;

  }

}

class Rook extends Piece {

  get points() {
    return 5;
  }

  canMove(to) {
    const from = this.square.coords;
    if (shareAxis(from, to)) {
      const path = this.board.getPath(from, to);

      const piece = path[path.length-1].piece;
      if (piece && piece.team === this.team) {
        return false;
      }

      for (const square of path.slice(1, -1)) {
        if (square.piece) {
          return false;
        }
      }

      return true;

    }

    return false;

  }

}

class Bishop extends Piece {

  get points() {
    return 3;
  }

  canMove(to) {
    const from = this.square.coords;
    if (shareDiagonal(from, to)) {
      const path = this.board.getPath(from, to);

      const piece = path[path.length-1].piece;
      if (piece && piece.team === this.team) {
        return false;
      }

      for (const square of path.slice(1, -1)) {
        if (square.piece) {
          return false;
        }
      }

      return true;

    }

    return false;

  }

}

class Knight extends Piece {

  get points() {
    return 3;
  }

  canMove(to) {
    const from = this.square.coords;

    if (!shareAxis(from, to) && !shareDiagonal(from, to)) {
      const piece = this.board.getSquareByCoords(to).piece;
      if (piece && piece.team === this.team) {
        return false;
      }
      return manhattanDistance(from, to) === 3;
    }

    return false; 

  }

}

class Pawn extends Piece {

  get points() {
    return 1;
  }

  canMove(to) {
    const from = this.square.coords;
    if (shareCol(from, to)) {
      const path = this.board.getPath(from, to);
      const distance = manhattanDistance(from, to);

      if (path[path.length-1].piece) return false;
      if (distance <= 1) return true;

      // When moving two squares, check that the middle one is empty
      if (this.virgin && distance === 2) return !path[1].piece;

    } else if (shareDiagonal(from, to)) {
      const distance = manhattanDistance(from, to);
      const dest = this.board.getSquareByCoords(to);

      if (distance !== 2) return false;
      if (!dest.piece) return false;
      if (dest.piece.team === this.team) return false;
      if (this.team === Teams.WHITE) {
        if (ROWS.indexOf(from[1]) >= ROWS.indexOf(to[1])) return false;
      } else {
        if (ROWS.indexOf(from[1]) <= ROWS.indexOf(to[1])) return false;
      }

      return true;

    }
    return false;
  }

}

module.exports = {King, Queen, Rook, Bishop, Knight, Pawn};