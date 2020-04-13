'use strict';

const { COLS, ROWS } = require('./coords');
const { Teams } = require('./teams');
const Board = require('./board');

class Game {
  constructor(player0, player1) {
    player0.team = Teams.WHITE;
    player0.game = this;
    player1.team = Teams.BLACK;
    player1.game = this;
    this.players = [player0, player1];
    this.next = Teams.WHITE;
    this.board = new Board();
  }

  process(player, data) {

    let response = {};

    const idxToChessCoords = ([ i, j ]) => [
      COLS[j],
      ROWS[i],
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
  processMove(player, from, to) {

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
    this.next = this.next === Teams.WHITE ? Teams.BLACK : Teams.WHITE;

    return {
      success: true,
      data: {
        scene: this.board.serialized,
      }
    }

  }

}

module.exports = { Game };