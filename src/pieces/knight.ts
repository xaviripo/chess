import Piece from './piece';
import { manhattanDistance, shareAxis, shareDiagonal } from '../coords';

export default class Knight extends Piece {

  get points() {
    return 3;
  }

  get name() {
    return 'knight';
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
