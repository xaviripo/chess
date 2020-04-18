'use strict';

import Coords, { Col, Row, colArr, rowArr } from './coords';
import Team from './teams';
import Board from './board';
import King from './pieces/king';
import Player from './player';

export default class Game {

  board: Board;
  players: Player[];
  next: Team;

  constructor(player0, player1) {
    player0.team = Team.White;
    player0.game = this;
    player1.team = Team.Black;
    player1.game = this;
    this.players = [player0, player1];
    this.next = Team.White;
    this.board = new Board();
  }

  process(player: Player, data: any): any {

    let response: any = {};

    const idxToChessCoords = ([ i, j ]: [number, number]): Coords => [
      colArr[j],
      rowArr[i],
    ];

    // Apply the action
    switch (data.type) {
      case 'MOVE_PIECE':
        response = this.processMove(player, idxToChessCoords(data.from), idxToChessCoords(data.to));
        response.name = response.success ? 'accepted' : 'illegal';
        break;
      default:
        response = {
          success: false,
          name: 'unknown',
          data: {
            message: 'Unknown operation',
            scene: this.board.serialized,
          },
        };
    }

    return response;

  }

  /**
   * Processes a move, modifying the scene appropriately, and returning a
   * response object.
   * @param {Array} from 
   * @param {Array} to 
   */
  processMove(player: Player, from: Coords, to: Coords): any {

    if (player.game !== this) {
      throw new Error(`This player is not allowed to participate in this game`);
    }

    // To begin with, check if it's the player's turn
    if (player.team !== this.next) {
      return {
        success: false,
        data: {
          message: 'It\'s not your turn to play',
          scene: this.board.serialized,
        },
      };
    }

    const piece = this.board.getSquareByCoords(from).piece;

    // Check if the origin square contains a piece
    if (!piece) {
      return {
        success: false,
        data: {
          message: 'You can\'t move an empty square',
          scene: this.board.serialized,
        },
      };
    }

    // Then, check if they're moving a piece of their own
    if (player.team !== piece.team) {
      return {
        success: false,
        data: {
          message: 'You can\'t move an opponent\'s piece',
          scene: this.board.serialized,
        },
      };
    }

    // Finally, check if the piece can move to the destination square
    if (!piece.canMove(to)) {
      return {
        success: false,
        data: {
          message: 'You can\'t move that piece there',
          scene: this.board.serialized,
        },
      };
    }

    // The move is good
    this.board.move(from, to);
    this.next = this.next === Team.White ? Team.Black : Team.White;

    // Check for win
    for (const team of [Team.White, Team.Black]) {
      const kingAlive = [].concat(...colArr.map(
        col => rowArr.map(
          row => this.board.getSquareByCoords([col, row]).piece
        )
      ))
        .some(piece => piece instanceof King && piece.team === team);

      if (!kingAlive) {
        return {
          success: true,
          win: (team === Team.White) ? Team.Black : Team.White,
          data: {
            scene: this.board.serialized,
          }
        };
      }
    }

    return {
      success: true,
      data: {
        scene: this.board.serialized,
      }
    };

  }

}
