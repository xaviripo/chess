import Piece from './piece';
import Coords, { manhattanDistance, shareAxis, shareDiagonal } from '../coords';

export default class Knight extends Piece {

  get points(): number {
    return 3;
  }

  get name(): string {
    return 'knight';
  }

  canMove(to: Coords): boolean {
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
