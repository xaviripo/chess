import Piece from './piece';
import Rook from './rook';
import Coords, { manhattanDistance, shareRow, shareAxis, shareDiagonal, colArr } from '../coords';

export default class King extends Piece {

  get points(): number {
    return Infinity;
  }

  get name(): string {
    return 'king';
  }

  /**
   * Given a destination for the king, return the coords of the rook it's
   * trying to castle with.
   */
  getCastlingRook(to: Coords): Rook {
    const isLong = colArr.indexOf(to[0]) < colArr.indexOf(this.square.col);
    return this.board.getSquareByCoords([isLong ? 'a' : colArr[colArr.length-1], to[1]]).piece as Rook;
  }

  canMove(to: Coords): boolean {

    // Normal movement
    const from = this.square.coords;
    const axis = shareAxis(from, to);
    const diag = shareDiagonal(from, to);
    const distance = manhattanDistance(from, to);
    if (axis || diag) {

      const piece = this.board.getSquareByCoords(to).piece;
      if (piece && piece.team === this.team) {
        return false;
      }

      if ((axis && distance === 1) || (diag && distance === 2)) return true;
    }

    // Castling
    if (this.virgin && shareRow(from, to) && distance === 2) {

      const rook = this.getCastlingRook(to);

      if (!rook || !(rook instanceof Rook) || (rook.team !== this.team) || !rook.virgin) {
        return false;
      }

      const kingToRook = this.board.getPath(from, rook.square.coords);
      return kingToRook.slice(1, kingToRook.length - 1).every(
        square => !square.piece
      );
    }

    return false;

  }

}
