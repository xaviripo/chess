const Piece = require('./piece');
const { manhattanDistance, shareAxis, shareDiagonal } = require('../coords');
const { Teams } = require('../teams');

class Knight extends Piece {

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

module.exports = Knight;