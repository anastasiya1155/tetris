import React, { useCallback, useEffect, useState } from 'react';
import blocks from './blocks.json';
import Preview from "./Preview";
import { getNSizedArray } from "../utils/basicUtils";

const levels = [
  0, 5, 12, 20, 30, 40, 50, 60, 70, 80, 90, 100
];

const width = getNSizedArray(10);
const height = getNSizedArray(20);

const getNewBlock = (isExtended) => {
  const randIndex = Math.floor((Math.random())*(isExtended ? Object.keys(blocks).length - 1 : 18));
  const nextBlock= JSON.stringify(Object.values(blocks)[randIndex])
  return JSON.parse(nextBlock);
}

const moveBlockDown = (
  prev,
  state,
  setState,
  setGameOver,
  nextBlock,
  setNextBlock,
  setScore,
  setLinesRemoved,
  level,
  fieldHeight,
  isExtended,
) => {
  const obstacleBelow = prev.some((row) => row.some((col) =>
    col[0] >= fieldHeight - 1 ||
    (state[col[0] + 1][col[1]] && col[2])
  ))
  if (obstacleBelow) {
    setState(prevState => {
      const newState = [...prevState.map(row => [...row])]
      prev.forEach((row) => row.forEach((col) => {
        newState[col[0]][col[1]] = newState[col[0]][col[1]] || col[2]
      }))
      return newState;
    });
    setState(prevState => {
      const newRows = [];
      prevState.forEach(row => {
        const isRowFull = row.every(b => !!b);
        if (!isRowFull) {
          newRows.push(row)
        }
      })
      const diffAfterFilter = prevState.length - newRows.length;
      setLinesRemoved(p => p + diffAfterFilter);
      setScore(p => p + (diffAfterFilter * 1000 * level));
      let diff = diffAfterFilter;
      while (diff) {
        newRows.unshift(width.map(_ => false));
        diff = prevState.length - newRows.length;
      }
      return newRows;
    })
    if (state[0].some(s => s) || state[1].some(s => s) || state[2].some(s => s)) {
      setGameOver(true);
    }
    setNextBlock(getNewBlock(isExtended));
    return [nextBlock, true];
  }
  return [prev.map(row => row.map(col => [col[0] + 1, col[1], col[2], col[3]])), false];
}

const initialBlock = getNewBlock();
const initialNextBlock = getNewBlock();
const initialState = height.map(_ => [...width.map(_ => false)])

const Field = () => {
  const [state, setState] = useState(initialState);
  const [currentBlock, setCurrentBlock] = useState(initialBlock)
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const [holdBlock, setHoldBlock] = useState(null);
  const [nextBlock, setNextBlock] = useState(initialNextBlock);
  const [score, setScore] = useState(0);
  const [linesRemoved, setLinesRemoved] = useState(0);
  const [level, setLevel] = useState(1);
  const [fieldWidth, setFieldWidth] = useState(10);
  const [fieldHeight, setFieldHeight] = useState(20);

  useEffect(() => {
    const handler = () => {
      if (!gameOver && gameStarted) {
        setCurrentBlock(prev => moveBlockDown(prev, state, setState, setGameOver, nextBlock, setNextBlock, setScore, setLinesRemoved, level, fieldHeight, isExtended)[0]);
      }
    }
    const intervalId = setInterval(handler, 900 - (level * 50));

    return () => {
      clearInterval(intervalId);
    }
  }, [state, gameOver, nextBlock, level, gameStarted, fieldHeight, isExtended]);

  useEffect(() => {
    let levelByScore
    for (let i = levels.length - 1; i >= 0; i--) {
      if (levels[i] <= linesRemoved) {
        levelByScore = i;
        break;
      }
    }
    setLevel(prev => levelByScore >= 0 ? Math.max(levelByScore + 1, prev) : levels.length + 1);
  }, [linesRemoved])

  useEffect(() => {
    const handler = e => {
      if (gameOver || !gameStarted) {
        return;
      }
      const key = e.key;
      switch (key) {
        // TODO: add space handler (drops immediately)
        case 'ArrowLeft':
          setCurrentBlock(prev => {
            const obstacleLeft = prev.some((row) => row.some((col) =>
              col[1] <= 0 ||
              (state[col[0]][col[1] - 1] && col[2])
            ));
            if (!obstacleLeft) {
              return prev.map(row => row.map(col => [col[0], col[1] - 1, col[2], col[3]]))
            }
            return prev;
          })
          break;
        case 'ArrowRight':
          setCurrentBlock(prev => {
            const obstacleRight = prev.some((row) => row.some((col) =>
              col[1] >= fieldWidth - 1 ||
              (state[col[0]][col[1] + 1] && col[2])
            ));
            if (!obstacleRight) {
              return prev.map(row => row.map(col => [col[0], col[1] + 1, col[2], col[3]]))
            }
            return prev;
          })
          break;
        case 'ArrowDown':
          setScore(prev => prev + 100);
          setCurrentBlock(prev => {
            const [first, isNew] = moveBlockDown(prev, state, setState, setGameOver, nextBlock, setNextBlock, setScore, setLinesRemoved, level, fieldHeight, isExtended);
            if (isNew) {
              return first;
            }
            const [second, isNewB] = moveBlockDown(first, state, setState, setGameOver, nextBlock, setNextBlock, setScore, setLinesRemoved, level, fieldHeight, isExtended);
            if (isNewB) {
              return second;
            }
            return moveBlockDown(second, state, setState, setGameOver, nextBlock, setNextBlock, setScore, setLinesRemoved, level, fieldHeight, isExtended)[0];
          })
          break;
        case 'ArrowUp':
          setCurrentBlock(prev => {
            const prevHeight = prev.length;
            const prevWidth = prev[0].length;
            const isWide = prevWidth - prevHeight > 0;
            const sidesDiff = Math.abs(prevWidth - prevHeight);
            const diffRange = sidesDiff ? getNSizedArray(sidesDiff, true) : [];
            const obstacleLeft = prev.some((row) => row.some((col) =>
              (!isWide && diffRange.some(r => state[col[0]][col[1] - r]) && col[2])
            ));
            const obstacleRight = prev.some((row) => row.some((col) =>
              (!isWide && col[1] >= fieldWidth - 1) ||
              (!isWide && diffRange.some(r => state[col[0]][col[1] + r]) && col[2])
            ));
            const obstacleBelow = prev.some((row) => row.some((col) =>
              (isWide && diffRange.some(r => col[0] + r >= fieldHeight - 1)) ||
              (isWide && diffRange.some(r => state[col[0] + r]?.[col[1]]) && col[2])
            ));
            const newR = getNSizedArray(prevWidth);
            const newC = getNSizedArray(prevHeight);

            const getNewColPosition = (c) => prev[0][0][1] + c + (obstacleLeft ? sidesDiff : obstacleRight ? -sidesDiff : 0);

            const willStickOut = newC.some(c => {
              const newColumn = getNewColPosition(c);
              return newColumn < 0 || newColumn > fieldWidth - 1
            });

            if ((obstacleRight && obstacleLeft) || willStickOut) {
              return prev;
            }

            const newBlock = newR.map(r => newC.map(c => [
              prev[0][0][0] + r - (obstacleBelow ? sidesDiff : 0),
              getNewColPosition(c),
              true,
            ]));

            newBlock.forEach((row, i) => {
              row.forEach((col, j) => {
                newBlock[i][j][2] = prev[prev.length - 1 - j][i][2]
                newBlock[i][j][3] = prev[prev.length - 1 - j][i][3]
              })
            })
            return newBlock;
          })
          break;
        case 'Shift':
          setCurrentBlock(prev => {
            const prevTopLeftCoords = prev[0][0];
            if (!holdBlock) {
              setHoldBlock(prev);
              let newBlock = nextBlock;
              newBlock = newBlock.map((r, ri) => r.map((c, ci) => [prevTopLeftCoords[0] + ri, prevTopLeftCoords[1] + ci, c[2], c[3]]));
              setNextBlock(getNewBlock(isExtended))
              return newBlock
            }
            let newBlock = holdBlock;
            newBlock = newBlock.map((r, ri) => r.map((c, ci) => [prevTopLeftCoords[0] + ri, prevTopLeftCoords[1] + ci, c[2], c[3]]));
            setHoldBlock(prev);
            return newBlock;
          })
          break;
        default:
          break;
      }
    }
    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [state, gameOver, holdBlock, nextBlock, level, gameStarted, fieldWidth, fieldHeight, isExtended]);

  const handleStart = useCallback(() => {
    setGameOver(false);
    setHoldBlock(null);
    setCurrentBlock(getNewBlock());
    setNextBlock(getNewBlock());
    setState(getNSizedArray(fieldHeight).map(_ => [...getNSizedArray(fieldWidth).map(_ => false)]));
    setGameStarted(true);
  }, [fieldWidth, fieldHeight])

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-4 w-40">
        <Preview block={holdBlock} title="HOLD"/>
        <div className="flex-1 bg-amber-50 border border-amber-800 p-2 text-center">
          <p>Lines removed:</p>
          <p>{linesRemoved}</p>
          <br/>
          <p>Score:</p>
          <p>{score}</p>
          <br/>
          <p>Level:</p>
          <p>{level}</p>
          <br/>
          <p>Game speed:</p>
          <p>{1000 - (900 - (level * 50))}</p>
        </div>
      </div>
      <div className="relative flex flex-col gap-0.5">
        {gameOver || !gameStarted ? (
          <div className="absolute top-0 bottom-0 left-0 right-0 backdrop-blur-sm text-3xl flex items-center justify-center flex-col gap-2">
            <div className="w-32 flex flex-col gap-2">
              {gameOver && <p className="text-2xl">Game over</p>}
              <label className="text-lg">
                Level:
                <select value={level} onChange={e => setLevel(Number(e.target.value))}  className="w-full border border-amber-800 rounded px-1 text-lg">
                  {levels.map((_, i) => (<option key={i}>{i}</option>))}
                </select>
              </label>
              <label className="text-lg">
                Field width:
                <input
                  type="number"
                  name="width"
                  className="w-full border border-amber-800 rounded px-1 text-lg"
                  value={fieldWidth} onChange={e => setFieldWidth(Number(e.target.value))}
                  min={7}
                  max={30}
                />
              </label>
              <label className="text-lg">
                Field height:
                <input
                  type="number"
                  name="height"
                  className="w-full border border-amber-800 rounded px-1 text-lg"
                  value={fieldHeight} onChange={e => setFieldHeight(Number(e.target.value))}
                  min={10}
                  max={60}
                />
              </label>
              <label className="text-lg">
                Extended:
                <input
                  type="checkbox"
                  name="isExtended"
                  className="ml-2"
                  checked={isExtended} onChange={e => setIsExtended(e.target.checked)}
                />
              </label>
            </div>
            <button
              className="border border-amber-800 rounded px-4 py-1 bg-white"
              onClick={handleStart}
            >
              Start
            </button>
          </div>
        ) : null}
        {state.map((row, i) => (
          <div key={`row-${i}`} className={`flex gap-0.5 ${i === 1 || i === 0 ? 'hidden': ''}`}>
            {row.map((col, j) => {
              let blockPart;
              for (let k = 0; k < currentBlock.length; k++) {
                blockPart = currentBlock[k].find(c => c[0] === i && c[1] === j)
                if (blockPart) {
                  break;
                }
              }
              return (
                <div
                  key={`col-${i}-${j}`}
                  className={`w-7 h-7 border border-amber-800 ${blockPart?.[2] ? 'border-2 bg-amber-600' : ''} ${state[i][j] ? 'bg-amber-800' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <Preview block={nextBlock} title="NEXT BLOCK"/>
    </div>
  );
};

export default Field;
