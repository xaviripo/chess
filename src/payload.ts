// All types in this file are prefixed with "P" (for protocol or payload)
// in order to distinguish them from their model analogs (Piece, Col, Row, etc.)

type PTeam = 'white' | 'black';

type PRank = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';

type PCol = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
type PRow = '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8';

type PCoords = {
  col: PCol,
  row: PRow,
};

type PTextType = 'serverError' | 'clientError';

interface Message {
  text: string,
  type: PTextType,
}

interface PPiece {
  square?: PCoords,
  team?: PTeam,
  rank?: PRank,
};

interface PEffect {
  name?: string,
  data?: any,
};

// TODO narrow this down
type PScope = any;

interface PActiveEffect {
  effectId?: string,
  scope?: PScope,
  data?: any,
};

interface Payload {
  winner?: PTeam,
  message?: Message,
  team?: PTeam,
  score?: number,
  next?: PTeam,
  pieces?: Record<string, PPiece>,
  effects?: Record<string, PEffect>,
  activeEffects?: Record<string, PActiveEffect>,
};

const adds = (property) => property !== undefined
  && Object.keys(property).length !== 0;

export default Payload;
export { adds, PCoords, PRank, PPiece };