import Board from './board';
import Team from './teams';

type State = {
  board: Board,
  next: Team,
};

export default State;