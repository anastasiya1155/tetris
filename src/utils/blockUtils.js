import { getNSizedArray } from "./basicUtils";

export const moveDown = block => block.map(row => row.map(col => [col[0] + 1, col[1], col[2], col[3]]));

export const moveLeft = (block, state) => {
  const obstacleLeft = block.some((row) => row.some((col) =>
    col[1] <= 0 ||
    (state[col[0]][col[1] - 1] && col[2])
  ));
  if (!obstacleLeft) {
    return block.map(row => row.map(col => [col[0], col[1] - 1, col[2], col[3]]))
  }
  return block;
}

export const moveRight = (block, state, fieldWidth) => {
  const obstacleRight = block.some((row) => row.some((col) =>
    col[1] >= fieldWidth - 1 ||
    (state[col[0]][col[1] + 1] && col[2])
  ));
  if (!obstacleRight) {
    return block.map(row => row.map(col => [col[0], col[1] + 1, col[2], col[3]]))
  }
  return block;
}

export const rotateBlock = (block, state, fieldWidth, fieldHeight) => {
  const prevHeight = block.length;
  const prevWidth = block[0].length;
  const isWide = prevWidth - prevHeight > 0;
  const sidesDiff = Math.abs(prevWidth - prevHeight);
  const diffRange = sidesDiff ? getNSizedArray(sidesDiff, true) : [];

  const obstacleLeft = block.some((row) => row.some((col) =>
    (!isWide && diffRange.some(r => state[col[0]][col[1] - r]) && col[2])
  ));
  const obstacleRight = block.some((row) => row.some((col) =>
    (!isWide && col[1] >= fieldWidth - 1) ||
    (!isWide && diffRange.some(r => state[col[0]][col[1] + r]) && col[2])
  ));
  const obstacleBelow = block.some((row) => row.some((col) =>
    (isWide && diffRange.some(r => col[0] + r >= fieldHeight - 1)) ||
    (isWide && diffRange.some(r => state[col[0] + r]?.[col[1]]) && col[2])
  ));

  const newR = getNSizedArray(prevWidth);
  const newC = getNSizedArray(prevHeight);

  const getNewColPosition = (c) => block[0][0][1] + c + (obstacleLeft ? sidesDiff : obstacleRight ? -sidesDiff : 0);

  const willStickOut = newC.some(c => {
    const newColumn = getNewColPosition(c);
    return newColumn < 0 || newColumn > fieldWidth - 1
  });

  if ((obstacleRight && obstacleLeft) || willStickOut) {
    return block;
  }

  const newBlock = newR.map(r => newC.map(c => [
    block[0][0][0] + r - (obstacleBelow ? sidesDiff : 0),
    getNewColPosition(c),
    true,
  ]));

  newBlock.forEach((row, i) => {
    row.forEach((col, j) => {
      newBlock[i][j][2] = block[block.length - 1 - j][i][2]
      newBlock[i][j][3] = block[block.length - 1 - j][i][3]
    })
  })
  return newBlock;
}

export const isObstacleBelow = (block, state, fieldHeight) => block.some((row) => row.some((col) =>
  col[0] >= fieldHeight - 1 ||
  (state[col[0] + 1][col[1]] && col[2])
))

export const placeBlockAt = (block, topLeft) => block.map((r, ri) => r.map((c, ci) => [topLeft[0] + ri, topLeft[1] + ci, c[2], c[3]]))
