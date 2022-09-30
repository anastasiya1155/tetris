import React, { useCallback, useEffect, useState } from 'react';
import blocks from './blocks.json';
import Preview from "./Preview";
import { getNSizedArray } from "../utils/basicUtils";
import Input from "../Input";
import ScoreSection from "./ScoreSection";
import { isObstacleBelow, moveDown, moveLeft, moveRight, placeBlockAt, rotateBlock } from "../utils/blockUtils";
import { addBlockToField, isFieldFull, removeFullRowsFromField } from "../utils/fieldUtils";

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

const initialBlock = getNewBlock();
const initialNextBlock = getNewBlock();
const initialState = height.map(_ => [...width.map(_ => false)])

const Field = () => {
  const [state, setState] = useState(initialState);
  const [currentBlock, setCurrentBlock] = useState(initialBlock)
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isExtended, setIsExtended] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [holdBlock, setHoldBlock] = useState(null);
  const [nextBlock, setNextBlock] = useState(initialNextBlock);
  const [score, setScore] = useState(0);
  const [linesRemoved, setLinesRemoved] = useState(0);
  const [level, setLevel] = useState(1);
  const [fieldWidth, setFieldWidth] = useState(10);
  const [fieldHeight, setFieldHeight] = useState(20);

  const moveBlockDown = useCallback((
    block,
  ) => {
    const obstacleBelow = isObstacleBelow(block, state, fieldHeight);
    if (obstacleBelow) {
      setState(prevState => addBlockToField(block, prevState));
      setState(prevState => {
        const { newState, diff } = removeFullRowsFromField(prevState);
        setLinesRemoved(p => p + diff);
        setScore(p => p + (diff * 1000 * level));
        return newState;
      })
      if (isFieldFull(state)) {
        setGameOver(true);
        setLevel(1);
      }
      setNextBlock(getNewBlock(isExtended));
      return [nextBlock, true];
    }
    return [moveDown(block), false];
  }, [state, nextBlock, level, fieldHeight, isExtended])

  useEffect(() => {
    const handler = () => {
      if (!gameOver && gameStarted) {
        setCurrentBlock(prev => moveBlockDown(prev)[0]);
      }
    }
    const intervalId = setInterval(handler, 900 - (level * 50));
    if (isPaused) {
      clearInterval(intervalId);
    }

    return () => {
      clearInterval(intervalId);
    }
  }, [gameOver, level, gameStarted, moveBlockDown, isPaused]);

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
      if (key === "Enter") {
        setIsPaused(prev => !prev);
      }
      if (isPaused) {
        return;
      }
      switch (key) {
        // TODO: add space handler (drops immediately)
        case 'ArrowLeft':
          setCurrentBlock(prev => moveLeft(prev, state));
          break;
        case 'ArrowRight':
          setCurrentBlock(prev => moveRight(prev, state, fieldWidth));
          break;
        case 'ArrowDown':
          setScore(prev => prev + 100);
          setCurrentBlock(prev => {
            const [first, isNew] = moveBlockDown(prev);
            if (isNew) {
              return first;
            }
            const [second, isNewB] = moveBlockDown(first);
            if (isNewB) {
              return second;
            }
            return moveBlockDown(second)[0];
          })
          break;
        case 'ArrowUp':
          setCurrentBlock(prev => rotateBlock(prev, state, fieldWidth, fieldHeight))
          break;
        case 'Shift':
          setCurrentBlock(prev => {
            const prevTopLeftCoords = prev[0][0];
            if (!holdBlock) {
              setNextBlock(getNewBlock(isExtended))
            }
            const newBlock = placeBlockAt(holdBlock ? holdBlock : nextBlock, prevTopLeftCoords);
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
  }, [state, gameOver, holdBlock, nextBlock, gameStarted, fieldWidth, fieldHeight, isExtended, moveBlockDown, isPaused]);

  const handleStart = useCallback(() => {
    setGameOver(false);
    setHoldBlock(null);
    setCurrentBlock(getNewBlock());
    setNextBlock(getNewBlock());
    setState(getNSizedArray(fieldHeight).map(_ => [...getNSizedArray(fieldWidth).map(_ => false)]));
    setGameStarted(true);
    setLinesRemoved(0);
    setScore(0);
  }, [fieldWidth, fieldHeight])

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-4 w-40">
        <Preview block={holdBlock} title="HOLD"/>
        <ScoreSection level={level} score={score} linesRemoved={linesRemoved} speed={1000 - (900 - (level * 50))}/>
      </div>
      <div className="relative flex flex-col gap-0.5">
        {gameOver || !gameStarted || isPaused ? (
          <div className="absolute top-0 bottom-0 left-0 right-0 backdrop-blur-sm text-3xl flex items-center justify-center flex-col gap-2">
            {(gameOver || !gameStarted) && (
              <>
                <div className="w-32 flex flex-col gap-2">
                  {gameOver && <p className="text-2xl">Game over</p>}
                  <label className="text-lg">
                    Level:
                    <select
                      value={level}
                      onChange={e => setLevel(Number(e.target.value))}
                      className="w-full border border-amber-800 rounded px-1 text-lg"
                    >
                      {levels.map((_, i) => (<option key={i}>{i + 1}</option>))}
                    </select>
                  </label>
                  <Input
                    type="number"
                    name="width"
                    value={fieldWidth}
                    onChange={e => setFieldWidth(Number(e.target.value))}
                    min={7}
                    max={30}
                    label="Field width:"
                  />
                  <Input
                    type="number"
                    name="height"
                    value={fieldHeight}
                    onChange={e => setFieldHeight(Number(e.target.value))}
                    min={10}
                    max={60}
                    label="Field height:"
                  />
                  <Input
                    label="Extended:"
                    type="checkbox"
                    name="isExtended"
                    className="ml-2"
                    checked={isExtended}
                    onChange={e => setIsExtended(e.target.checked)}
                  />
                </div>
                <button
                  className="border border-amber-800 rounded px-4 py-1 bg-white"
                  onClick={handleStart}
                >
                  Start
                </button>
              </>)}
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
                  className={`w-7 h-7 border border-amber-800 ${
                    blockPart?.[2] ? 'border-2 bg-amber-600' : ''
                  } ${state[i][j] ? 'bg-amber-800' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <div className="w-40 flex flex-col gap-4">
        <Preview block={nextBlock} title="NEXT BLOCK"/>
        <div className=" w-40 h-40 border border-amber-800 bg-amber-100 flex flex-col gap-2 items-center justify-center">
          <p>{isPaused ? 'Resume': 'Pause'}</p>
          <button
            className="w-24 h-24 bg-amber-50 text-5xl bolder rounded border border-amber-800 flex items-center focus:outline-none justify-center"
            onClick={(e) => {
              console.log('here')
              setIsPaused(prev => !prev)
              e.target.blur();
            }}
          >
            {isPaused ? "▶" : "| |"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Field;
