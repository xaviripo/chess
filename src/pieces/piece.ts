import Team from '../teams';
import Square from '../square';
import Board from '../board';
import Coords from '../coords';

export default class Piece {

  private _team: Team;
  private _square: Square;
  private _virgin: boolean;

  constructor(team) {
    this._team = team;
    this._virgin = true;
  }

  get team() {
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

  get name(): String {
    throw new Error('Must implement this method');
  }

  get serialized(): String {
    return `${this.team.toLowerCase()}_${this.name}`;
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
