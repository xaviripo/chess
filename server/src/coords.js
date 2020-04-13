const COLS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ROWS = ['1', '2', '3', '4', '5', '6', '7', '8'];

const manhattanDistance = ([ col0, row0 ], [ col1, row1 ]) =>
  Math.abs(COLS.indexOf(col1) - COLS.indexOf(col0))
  + Math.abs(ROWS.indexOf(row1) - ROWS.indexOf(row0));

const shareRow = ([ , row0 ], [ , row1 ]) =>
  row0 === row1;

const shareCol = ([ col0, ], [ col1, ]) =>
  col0 === col1;

const shareAxis = (coords0, coords1) =>
  shareRow(coords0, coords1) || shareCol(coords0, coords1);

const shareDiagonal = ([ col0, row0 ], [ col1, row1 ]) =>
  Math.abs(COLS.indexOf(col1) - COLS.indexOf(col0))
  === Math.abs(ROWS.indexOf(row1) - ROWS.indexOf(row0));

module.exports = { COLS, ROWS, manhattanDistance, shareRow, shareCol, shareAxis, shareDiagonal };