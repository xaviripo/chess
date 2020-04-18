const colArr = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
type Col = typeof colArr[number];

const rowArr = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;
type Row = typeof rowArr[number];

const manhattanDistance = ([ col0, row0 ]: Coords, [ col1, row1 ]: Coords): number =>
  Math.abs(colArr.indexOf(col1) - colArr.indexOf(col0))
  + Math.abs(rowArr.indexOf(row1) - rowArr.indexOf(row0));

const shareRow = ([ , row0 ]: Coords, [ , row1 ]: Coords): boolean =>
  row0 === row1;

const shareCol = ([ col0, ]: Coords, [ col1, ]: Coords): boolean =>
  col0 === col1;

const shareAxis = (coords0: Coords, coords1: Coords): boolean =>
  shareRow(coords0, coords1) || shareCol(coords0, coords1);

const shareDiagonal = ([ col0, row0 ]: Coords, [ col1, row1 ]: Coords): boolean =>
  Math.abs(colArr.indexOf(col1) - colArr.indexOf(col0))
  === Math.abs(rowArr.indexOf(row1) - rowArr.indexOf(row0));

type Coords = [Col, Row];

export default Coords;
export { Col, Row, colArr, rowArr, manhattanDistance, shareRow, shareCol, shareAxis, shareDiagonal };