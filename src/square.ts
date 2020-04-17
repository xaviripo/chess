import Board from "./board";
import Piece from "./pieces/piece";
import Coords from "./coords";

export default class Square {

  _board: Board;
  _piece: Piece;

  constructor(board) {
    this._board = board;
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

  get coords(): Coords {
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
