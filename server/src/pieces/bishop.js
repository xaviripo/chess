const Piece = require('./piece');
const { shareDiagonal } = require('../coords');
const { Teams } = require('../teams');

class Bishop extends Piece {

  get points() {
    return 3;
  }

  get name() {
    return 'bishop';
  }

  canMove(to) {
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

module.exports = Bishop;