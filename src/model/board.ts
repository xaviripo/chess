import Square from './square';
import { King, Queen, Rook, Bishop, Knight, Pawn } from './pieces/pieces';
import Coords, { Col, Row, manhattanDistance, shareRow, shareCol, shareDiagonal, colArr, rowArr } from './coords';
import Team from './teams';
import Piece from './pieces/piece';
import Game from './game';
import { serialize } from 'v8';
import Payload from '../payload';

export default class Board {

  _contents: Map<Col, Map<Row, Square>>;
  _pieceIds: string[] = [];

  constructor() {
    this.createSquares();
    this.fillSquares();
  }

  /**
   * Returns a shallow copy of self.
   */
  copy(): Board {
    // ugh, how do I deal with copying pieces over?
    // maybe its a better idea to keep just one or two Board instances around
    // and copy over only the data in a standard format (a Payload subsecion?)
  }

  getPieceById(id: string): Piece {
    for (const col of colArr) {
      for (const row of rowArr) {
        const piece = this._contents.get(col).get(row).piece;
        if (piece && piece.id === id) {
          return piece;
        }
      }
    }
    return null;
  }

  /**
   * Given a list of moves, applies them to the board. When a piece doesn't move,
   * (e.g. because it's attacking and doesn't do enough damage), don't return
   * that movement. Otherwise, return it.
   * @param moves 
   */
  applyMoves(moves: {from: Coords, to: Coords}[]): {from: Coords, to: Coords}[] {

    const actualMoves = []; 

    for (const { from, to } of moves) {
      // TODO apply damage calculations and move only if appropriate
      const fromSquare = this.getSquareByCoords(from);
      const toSquare = this.getSquareByCoords(to);
      fromSquare.piece = toSquare.piece;
      toSquare.piece = null;

      actualMoves.push({from, to});
    }

    return actualMoves;

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

  get serialized(): Payload {
    // Transpose the board matrix
    const serialized: Payload = {
      pieces: {},
    };

    for (const row of rowArr) {
      for (const col of colArr) {
        const square = this.getSquareByCoords([col, row]);
        if (square.piece) {
          serialized.pieces[square.piece.id] = square.piece.serialized;
        }
      }
    }

    return serialized;
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
      this.getSquareByCoords([col, '1']).piece = new ColPiece(Game.getNextId(this._pieceIds), Team.White);
      this.getSquareByCoords([col, '2']).piece = new Pawn(Game.getNextId(this._pieceIds), Team.White);

      // Black pieces
      this.getSquareByCoords([col, '7']).piece = new Pawn(Game.getNextId(this._pieceIds), Team.Black);
      this.getSquareByCoords([col, '8']).piece = new ColPiece(Game.getNextId(this._pieceIds), Team.Black);

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
