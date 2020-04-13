const Piece = require('./piece');
const { shareAxis, shareDiagonal } = require('../coords');
const { Teams } = require('../teams');

class Queen extends Piece {

  get points() {
    return 9;
  }

  get name() {
    return 'queen';
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

module.exports = Queen;