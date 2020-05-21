import Team from '../teams';
import Coords, { Row, manhattanDistance, shareCol, shareDiagonal, rowArr } from '../coords';
import Piece from './piece';
import { PRank } from '../../payload';

export default class Pawn extends Piece {

  get points(): number {
    return 1;
  }

  get name(): PRank {
    return 'pawn';
  }

  getMoves(to: Coords): {from: Coords, to: Coords}[] {
    const from = this.square.coords;
    const moves = [{from, to}];
    if (shareCol(from, to)) {
      const path = this.board.getPath(from, to);
      const distance = manhattanDistance(from, to);

      if (path[path.length-1].piece) return null;
      if (distance <= 1) return moves;

      // When moving two squares, check that the middle one is empty
      if (this.virgin && distance === 2) return path[1].piece ? null : moves;

    } else if (shareDiagonal(from, to)) {
      const distance = manhattanDistance(from, to);
      const dest = this.board.getSquareByCoords(to);

      if (distance !== 2) return null;
      if (!dest.piece) return null;
      if (dest.piece.team === this.team) return null;
      if (this.team === Team.White) {
        if (rowArr.indexOf(from[1]) >= rowArr.indexOf(to[1])) return null;
      } else {
        if (rowArr.indexOf(from[1]) <= rowArr.indexOf(to[1])) return null;
      }

      return moves;

    }
    return null;
  }

  canMove(to: Coords): boolean {
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
      if (this.team === Team.White) {
        if (rowArr.indexOf(from[1]) >= rowArr.indexOf(to[1])) return false;
      } else {
        if (rowArr.indexOf(from[1]) <= rowArr.indexOf(to[1])) return false;
      }

      return true;

    }
    return false;
  }

}
