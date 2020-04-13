const Square = require('./square');
const { King, Queen, Rook, Bishop, Knight, Pawn } = require('./pieces');
const { COLS, ROWS, shareRow, shareCol, shareDiagonal } = require('./coords');
const { Teams } = require('./teams');

class Board {

  constructor() {
    this.createSquares();
    this.fillSquares();
  }

  move(from, to) {
    const piece = this.getSquareByCoords(from).piece;
    if (!piece) throw new Error(`There's no piece in coords ${from}`);
    this.getSquareByCoords(from).piece = null;
    this.getSquareByCoords(to).piece = piece;

    if (from !== to) {
      piece.virgin = false;
    }

    // TODO allow choosing which piece to upgrade to
    if (piece instanceof Pawn) {
      const lastRowIndex = piece.team === Teams.WHITE ? ROWS.length - 1 : 0;
      if (ROWS.indexOf(to[1]) === lastRowIndex) {
        this.getSquareByCoords(to).piece = new Queen(piece.team, this.getSquareByCoords(to));
      }
    }
  }

  setSquare([ col, row ], piece) {
    this._contents.get(col).set(row, piece);
  }

  getSquareByCoords([ col, row ]) {
    return this._contents.get(col).get(row);
  }

  getCoordsBySquare(square) {
    for (const col of COLS) {
      for (const row of ROWS) {
        if (this._contents.get(col).get(row) === square) {
          return [col, row];
        }
      }
    }
    return null;
  }

  get serialized() {
    // Transpose the board matrix
    return ROWS.map(
      row => COLS.map(
        col => this.getSquareByCoords([col, row]).serialized
      )
    );
  }

  createSquares() {
    this._contents = new Map();
    COLS.forEach(col => {
      this._contents.set(col, new Map());
      ROWS.forEach(row => {
        this.setSquare([col, row], new Square(this));
      });
    });
  }

  fillSquares() {

    // Set the order of the top and bottom row pieces
    const order = [Rook, Knight, Bishop, King, Queen, Bishop, Knight, Rook];

    // Now set the pieces
    COLS.forEach((col, i) => {

      // This column's piece
      const ColPiece = order[i];

      // White pieces
      this.getSquareByCoords([col, '1']).piece = new ColPiece(Teams.WHITE);
      this.getSquareByCoords([col, '2']).piece = new Pawn(Teams.WHITE);

      // Black pieces
      this.getSquareByCoords([col, '7']).piece = new Pawn(Teams.BLACK);
      this.getSquareByCoords([col, '8']).piece = new ColPiece(Teams.BLACK);

    });

  }

  getColPath([ fromCol, fromRow ], [ toCol, toRow ]) {
    const fromRowIndex = ROWS.indexOf(fromRow);
    const toRowIndex = ROWS.indexOf(toRow);
    const getSquareByRow = row => this.getSquareByCoords([fromCol, row]);
    if (fromRowIndex <= toRowIndex) {
      return ROWS
        .slice(fromRowIndex, toRowIndex + 1)
        .map(getSquareByRow);
    } else {
      return ROWS
        .slice(toRowIndex, fromRowIndex + 1)
        .reverse()
        .map(getSquareByRow);
    }
  }

  getRowPath([ fromCol, fromRow ], [ toCol, toRow ]) {
    const fromColIndex = COLS.indexOf(fromCol);
    const toColIndex = COLS.indexOf(toCol);
    const getSquareByCol = col => this.getSquareByCoords([col, fromRow]);
    if (fromColIndex <= toColIndex) {
      return COLS
        .slice(fromColIndex, toColIndex + 1)
        .map(getSquareByCol);
    } else {
      return COLS
        .slice(toColIndex, fromColIndex + 1)
        .reverse()
        .map(getSquareByCol);
    }
  }

  getDiagonalPath([ fromCol, fromRow ], [ toCol, toRow ]) {
    let cols, rows;

    // Obtain cols
    const fromColIndex = COLS.indexOf(fromCol);
    const toColIndex = COLS.indexOf(toCol);
    const getSquareByCol = col => this.getSquareByCoords([col, fromRow]);
    if (fromColIndex <= toColIndex) {
      cols = COLS
        .slice(fromColIndex, toColIndex + 1);
    } else {
      cols = COLS
        .slice(toColIndex, fromColIndex + 1)
        .reverse();
    }

    // Obtain rows
    const fromRowIndex = ROWS.indexOf(fromRow);
    const toRowIndex = ROWS.indexOf(toRow);
    const getSquareByRow = row => this.getSquareByCoords([fromCol, row]);
    if (fromRowIndex <= toRowIndex) {
      rows = ROWS
        .slice(fromRowIndex, toRowIndex + 1);
    } else {
      rows = ROWS
        .slice(toRowIndex, fromRowIndex + 1)
        .reverse();
    }

    const zip = (arr1, arr2) => arr1.map((e, i) => [e, arr2[i]]);

    // Put it all together
    return zip(cols, rows)
      .map(coords => this.getSquareByCoords(coords));
  }

  getPath(from, to) {

    if (shareCol(from, to)) {
      return this.getColPath(from, to);
    } else if (shareRow(from, to)) {
      return this.getRowPath(from, to);
    } else if (shareDiagonal(from, to)) {
      return this.getDiagonalPath(from, to);
    }

    // No path shared
    return null;

  }

}

module.exports = Board;