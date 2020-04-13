const Piece = require('./piece');
const { manhattanDistance, shareAxis, shareDiagonal } = require('../coords');
const { Teams } = require('../teams');

class King extends Piece {

  get points() {
    return Infinity;
  }

  get name() {
    return 'king';
  }

  canMove(to) {
    const from = this.square.coords;
    const axis = shareAxis(from, to);
    const diag = shareDiagonal(from, to);
    if (axis || diag) {
      const distance = manhattanDistance(from, to);

      const piece = this.board.getSquareByCoords(to).piece;
      if (piece && piece.team === this.team) {
        return false;
      }

      return (axis && distance === 1) || (diag && distance === 2);

    }

    return false;

  }

}

module.exports = King;