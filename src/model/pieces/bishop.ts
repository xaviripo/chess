import Piece from './piece';
import Coords, { shareDiagonal } from '../coords';

export default class Bishop extends Piece {

  get points(): number {
    return 3;
  }

  get name(): string {
    return 'bishop';
  }

  canMove(to: Coords): boolean {
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
