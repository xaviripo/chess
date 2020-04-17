import Square from './square';
import { King, Queen, Rook, Bishop, Knight, Pawn } from './pieces/pieces';
import Coords, { Col, Row, manhattanDistance, shareRow, shareCol, shareDiagonal, colArr, rowArr } from './coords';
import Team from './teams';

export default class Board {

  _contents: Map<Col, Map<Row, Square>>;

  constructor() {
    this.createSquares();
    this.fillSquares();
  }

  move(from: Coords, to: Coords): void {
    const piece = this.getSquareByCoords(from).piece;
    if (!piece) throw new Error(`There's no piece in coords ${from}`);

    // Castling
    if (piece instanceof King && shareRow(from, to) && manhattanDistance(from, to) === 2) {
      // TODO in the future, refactor this so that piece.canMove already
      // returns all the pieces to move
      const rook = piece.getCastlingRook(to);
      rook.square.piece = null;
      this.getSquareByCoords([
        colArr[colArr.indexOf(to[0]) + (to[0] > from[0] ? -1 : +1)],
        to[1],
      ]).piece = rook;
      rook.virgin = false;
    }

    this.getSquareByCoords(from).piece = null;
    this.getSquareByCoords(to).piece = piece;

    if (from !== to) {
      piece.virgin = false;
    }

    // TODO allow choosing which piece to upgrade to
    if (piece instanceof Pawn) {
      const lastRowIndex = piece.team === Team.White ? rowArr.length - 1 : 0;
      if (rowArr.indexOf(to[1]) === lastRowIndex) {
        this.getSquareByCoords(to).piece = new Queen(piece.team);
        this.getSquareByCoords(to).piece.square = this.getSquareByCoords(to);
      }
    }
  }

  setSquare([ col, row ]: Coords, square: Square): void {
    this._contents.get(col).set(row, square);
  }

  getSquareByCoords([ col, row ]: Coords): Square {
    return this._contents.get(col).get(row);
  }

  getCoordsBySquare(square: Square): Coords {
    for (const col of colArr) {
      for (const row of rowArr) {
        if (this._contents.get(col).get(row) === square) {
          return [col, row];
        }
      }
    }
    return null;
  }

  get serialized(): string[][] {
    // Transpose the board matrix
    return rowArr.map(
      row => colArr.map(
        col => this.getSquareByCoords([col, row]).serialized
      )
    );
  }

  createSquares(): void {
    this._contents = new Map<Col, Map<Row, Square>>();
    colArr.forEach(col => {
      this._contents.set(col, new Map<Row, Square>());
      rowArr.forEach(row => {
        this.setSquare([col, row], new Square(this));
      });
    });
  }

  fillSquares(): void {

    // Set the order of the top and bottom row pieces
    const order = [Rook, Knight, Bishop, Queen, King, Bishop, Knight, Rook];

    // Now set the pieces
    colArr.forEach((col, i) => {

      // This column's piece
      const ColPiece = order[i];

      // White pieces
      this.getSquareByCoords([col, '1']).piece = new ColPiece(Team.White);
      this.getSquareByCoords([col, '2']).piece = new Pawn(Team.White);

      // Black pieces
      this.getSquareByCoords([col, '7']).piece = new Pawn(Team.Black);
      this.getSquareByCoords([col, '8']).piece = new ColPiece(Team.Black);

    });

  }

  getColPath([ fromCol, fromRow ]: Coords, [ toCol, toRow ]: Coords): Square[] {
    const fromRowIndex = rowArr.indexOf(fromRow);
    const toRowIndex = rowArr.indexOf(toRow);
    const getSquareByRow = row => this.getSquareByCoords([fromCol, row]);
    if (fromRowIndex <= toRowIndex) {
      return rowArr
        .slice(fromRowIndex, toRowIndex + 1)
        .map(getSquareByRow);
    } else {
      return rowArr
        .slice(toRowIndex, fromRowIndex + 1)
        .reverse()
        .map(getSquareByRow);
    }
  }

  getRowPath([ fromCol, fromRow ]: Coords, [ toCol, toRow ]: Coords): Square[] {
    const fromColIndex = colArr.indexOf(fromCol);
    const toColIndex = colArr.indexOf(toCol);
    const getSquareByCol = col => this.getSquareByCoords([col, fromRow]);
    if (fromColIndex <= toColIndex) {
      return colArr
        .slice(fromColIndex, toColIndex + 1)
        .map(getSquareByCol);
    } else {
      return colArr
        .slice(toColIndex, fromColIndex + 1)
        .reverse()
        .map(getSquareByCol);
    }
  }

  getDiagonalPath([ fromCol, fromRow ]: Coords, [ toCol, toRow ]: Coords): Square[] {

    const
      fromColIndex = colArr.indexOf(fromCol),
      toColIndex = colArr.indexOf(toCol),
      fromRowIndex = rowArr.indexOf(fromRow),
      toRowIndex = rowArr.indexOf(toRow);

    let cols, rows;

    // Obtain cols
    if (fromColIndex <= toColIndex) {
      cols = colArr
        .slice(fromColIndex, toColIndex + 1);
    } else {
      cols = colArr
        .slice(toColIndex, fromColIndex + 1)
        .reverse();
    }

    // Obtain rows
    if (fromRowIndex <= toRowIndex) {
      rows = rowArr
        .slice(fromRowIndex, toRowIndex + 1);
    } else {
      rows = rowArr
        .slice(toRowIndex, fromRowIndex + 1)
        .reverse();
    }

    const zip = (arr1, arr2) => arr1.map((e, i) => [e, arr2[i]]);

    // Put it all together
    return zip(cols, rows)
      .map(coords => this.getSquareByCoords(coords));

  }

  getPath(from: Coords, to: Coords): Square[] {

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
