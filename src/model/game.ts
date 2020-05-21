'use strict';

import Coords, { Col, Row, colArr, rowArr } from './coords';
import Team from './teams';
import Board from './board';
import Player from './player';
import Payload, { adds } from '../payload';
import Message from '../message';
import State from './state';

export default class Game {

  states: State[];
  players: Player[];

  constructor(player0, player1) {
    player0.team = Team.White;
    player0.game = this;
    player1.team = Team.Black;
    player1.game = this;
    this.players = [player0, player1];
    this.states = [
      {
        board: new Board(),
        next: Team.White,
      }
    ];
  }

  getState(i: number): State {
    const l = this.states.length;
    return this.states[((i % l) + l) % l];
  }

  get currentState(): State {
    return this.states[this.states.length - 1];
  }

  process(player: Player, data: Payload): [Message, Payload] {

    if (player.team !== this.currentState.next) {
      return ['not accepted', {
        message: {
          type: 'clientError',
          text: 'It\'s not your turn to play',
        },
      }];
    }

    const isBuying = adds(data.effects);
    const isMoving = adds(data.pieces);

    /* The client is trying to buy and move in the same message.
    This is not allowed. */
    if (isBuying && isMoving) {
      return ['not accepted', {
        message: {
          type: 'clientError',
          text: 'You can\'t move and buy in the same message',
        },
      }];
    }

    // The client is trying to buy an effect
    if (isBuying) {
      // TODO
    }

    // The client is trying to move a piece
    if (isMoving) {
      return this.processMove(data);
    }

    // The client is neither trying to buy nor move
    return ['not accepted', {
      message: {
        type: 'clientError',
        text: 'You must either buy an effect or make a move',
      },
    }];

  }

  // TODO
  // processBuy(player: Player, effect: Effect): Payload {
  //   
  // }

  /**
   * Processes a move, modifying the scene appropriately.
   * @param {Payload} data the data sent by the client
   * @returns the message and payload to send back to the client
   */
  processMove(data: Payload): [Message, Payload] {

    if (Object.keys(data.pieces).length !== 1) {
      return ['not accepted', {
        message: {
          type: 'clientError',
          text: 'You must move exactly one piece per turn',
        },
      }];
    }

    const [ [ pieceId, dataPiece ] ] = Object.entries(data.pieces);

    /* TODO change this check to allow for pawn promotion (e.g. the client
      passes the new piece rank as well as the new position) */
    if (Object.keys(dataPiece).length !== 1) {
      return ['not accepted', {
        message: {
          type: 'clientError',
          text: 'You must only send the square of the piece',
        },
      }];
    }

    const coords: Coords = [dataPiece.square.col, dataPiece.square.row];

    const piece = this.currentState.board.getPieceById(pieceId);

    if (!piece) {
      return ['not accepted', {
        message: {
          type: 'clientError',
          text: 'You sent an invalid piece id',
        },
      }];
    }

    const moves = piece.getMoves(coords);

    // The given move is invalid
    if (!moves) {
      return ['not accepted', {
        message: {
          type: 'clientError',
          text: 'You can\'t move that piece there',
        },
      }];
    }

    const newState = {
      next: this.currentState.next === Team.White ? Team.Black : Team.White,
      board: this.currentState.board.copy(),
    };

    const actualMoves = this.board.applyMoves(moves);

    this.next = this.next === Team.White ? Team.Black : Team.White;

    // TODO check for win around here
    // set the response.winner to the appropriate winner, don't set otherwise

    const response = {
      pieces: {},
      next: this.next,
    };

    for (const {from, to} of actualMoves) {
      response.pieces[this.board.getSquareByCoords(from).piece.id] = {
        square: {
          col: to[0],
          row: to[1],
        },
      };
    }

    return ['accepted', response];

  }

  static getNextId(ids: string[]): string {
    // https://gist.github.com/gordonbrander/2230317
    let id;
    do {
      /* This generation is guaranteed to be unique by random's seeding, but
      still better to check */
      id = Math.random().toString(36).substr(2, 9);
    } while(ids.includes(id));
    ids.push(id);
    return id;
  }

}
