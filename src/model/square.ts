import Board from "./board";
import Piece from "./pieces/piece";
import Coords, { Col, Row } from "./coords";

export default class Square {

  _board: Board;
  _piece: Piece;

  constructor(board: Board) {
    this._board = board;
  }

  get board(): Board {
    return this._board;
  }

  get col(): Col {
    return this.coords[0];
  }

  get row(): Row {
    return this.coords[1];
  }

  get coords(): Coords {
    return this._board.getCoordsBySquare(this);
  }

  get piece() {
    return this._piece;
  }

  set piece(piece: Piece) {
    this._piece = piece;
    if (piece) piece.square = this;
  }

  get serialized(): string {
    return this.piece ? this.piece.serialized : ' ';
  }

}
