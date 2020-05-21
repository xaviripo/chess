import Team from '../teams';
import Square from '../square';
import Board from '../board';
import Coords from '../coords';
import { PRank, PPiece } from '../../payload';

export default class Piece {

  private _team: Team;
  private _square: Square;
  private _virgin: boolean;
  private _id: string;

  constructor(id: string, team: Team) {
    this._team = team;
    this._virgin = true;
    this._id = id;
  }

  /**
   * Given a destination square for this piece, check if it's valid. If it is,
   * calculate other collateral moves to be also applied (e.g. rooks when
   * castling). Otherwise, return null.
   * @param to square to move this piece to
   * @returns list of [from, to] movements to apply, or null if invalid movement
   * is given
   */
  getMoves(to: Coords): {from: Coords, to: Coords}[] {
    return null;
  }

  get id(): string {
    return this._id;
  }

  get team(): Team {
    return this._team;
  }

  get points(): number {
    throw new Error('Must implement this method');
  }

  get square(): Square {
    return this._square;
  }

  set square(square: Square) {
    this._square = square;
  }

  get board(): Board {
    return this._square.board;
  }

  get name(): PRank {
    throw new Error('Must implement this method');
  }

  get serialized(): PPiece {
    return {
      square: this.square.serialized,
      team: this.team,
      rank: this.name,
    };
  }

  get virgin(): boolean {
    return this._virgin;
  }

  set virgin(virgin: boolean) {
    this._virgin = virgin;
  }

  canMove(to: Coords): boolean {
    throw new Error('Must implement this method');
  }

}
