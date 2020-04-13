class Square {

  constructor(board, piece) {
    this._board = board;
    this._piece = piece;
  }

  get board() {
    return this._board;
  }

  get col() {
    return this.coords[0];
  }

  get row() {
    return this.coords[1];
  }

  get coords() {
    return this._board.getCoordsBySquare(this);
  }

  get piece() {
    return this._piece;
  }

  set piece(piece) {
    this._piece = piece;
    if (piece) piece.square = this;
  }

  get serialized() {
    return this.piece ? this.piece.serialized : ' ';
  }

}

module.exports = Square;