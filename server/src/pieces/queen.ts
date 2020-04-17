import Piece from './piece';
import Coords, { shareAxis, shareDiagonal } from '../coords';

export default class Queen extends Piece {

  get points(): number {
    return 9;
  }

  get name(): string {
    return 'queen';
  }

  canMove(to: Coords): boolean {
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
