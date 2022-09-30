import { getNSizedArray } from "./basicUtils";

export const addBlockToField = (block, state) => {
  const newState = [...state.map(row => [...row])]
  block.forEach((row) => row.forEach((col) => {
    newState[col[0]][col[1]] = newState[col[0]][col[1]] || col[2]
  }))
  return newState;
}

export const removeFullRowsFromField = state => {
  const newState = [];
  state.forEach(row => {
    const isRowFull = row.every(b => !!b);
    if (!isRowFull) {
      newState.push(row)
    }
  })
  const diffAfterFilter = state.length - newState.length;
  let diff = diffAfterFilter;
  while (diff) {
    newState.unshift(getNSizedArray(state[0].length).map(_ => false));
    diff = state.length - newState.length;
  }
  return { newState, diff: diffAfterFilter };
}

export const isFieldFull = state => state[0].some(s => s) || state[1].some(s => s) || state[2].some(s => s);
