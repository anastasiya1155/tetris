export const getNSizedArray = (n, startFrom1) => {
  const arr = Array.from(new Array(n).keys());
  if (startFrom1) {
    return arr.map(r => r + 1);
  }
  return arr;
}
