import React, { useEffect, useState } from 'react';
import elements from './elements.json';
import Preview from "./Preview";

const w = 10;
const h = 20;

const levels = [
  0, 5, 12, 20, 30, 45, 65, 90
];

const width = Array.from(new Array(w).keys());
const height = Array.from(new Array(h).keys());

const getNewElement = () => {
  const randIndex = Math.floor((Math.random())*(Object.keys(elements).length - 1));
  const nextElem = JSON.stringify(Object.values(elements)[randIndex])
  return JSON.parse(nextElem);
}

const moveElementDown = (prev, state, setState, setGameOver, nextElement, setNextElement, setScore, setLinesRemoved, level) => {
  const obstacleBelow = prev.some((row) => row.some((col) =>
    col[0] >= h - 1 ||
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
    setNextElement(getNewElement());
    return [nextElement, true];
  }
  return [prev.map(row => row.map(col => [col[0] + 1, col[1], col[2], col[3]])), false];
}

const initialElement = getNewElement();
const initialNextElement = getNewElement();
const initialState = height.map(_ => [...width.map(_ => false)])

const Field = () => {
  // TODO: allow configuring field and initial level
  const [state, setState] = useState(initialState);
  const [currentElement, setCurrentElement] = useState(initialElement)
  const [gameOver, setGameOver] = useState(false);
  const [holdElement, setHoldElement] = useState(null);
  const [nextElement, setNextElement] = useState(initialNextElement);
  const [score, setScore] = useState(0);
  const [linesRemoved, setLinesRemoved] = useState(0);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    const handler = () => {
      if (!gameOver) {
        setCurrentElement(prev => moveElementDown(prev, state, setState, setGameOver, nextElement, setNextElement, setScore, setLinesRemoved, level)[0]);
      }
    }
    const intervalId = setInterval(handler, 900 - (level * 50));

    return () => {
      clearInterval(intervalId);
    }
  }, [state, gameOver, nextElement, level]);

  useEffect(() => {
    let levelByScore
    for (let i = levels.length - 1; i >= 0; i--) {
      if (levels[i] <= linesRemoved) {
        levelByScore = i;
        break;
      }
    }
    setLevel(levelByScore >= 0 ? levelByScore + 1 : levels.length + 1);
  }, [linesRemoved])

  useEffect(() => {
    const handler = e => {
      if (gameOver) {
        return;
      }
      const key = e.key;
      switch (key) {
        case 'ArrowLeft':
          setCurrentElement(prev => {
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
          setCurrentElement(prev => {
            const obstacleRight = prev.some((row) => row.some((col) =>
              col[1] >= w - 1 ||
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
          setCurrentElement(prev => {
            const [first, isNew] = moveElementDown(prev, state, setState, setGameOver, nextElement, setNextElement, setScore, setLinesRemoved, level);
            if (isNew) {
              return first;
            }
            const [second, isNewElem] = moveElementDown(first, state, setState, setGameOver, nextElement, setNextElement, setScore, setLinesRemoved, level);
            if (isNewElem) {
              return second;
            }
            return moveElementDown(second, state, setState, setGameOver, nextElement, setNextElement, setScore, setLinesRemoved, level)[0];
          })
          break;
        case 'ArrowUp':
          setCurrentElement(prev => {
            // TODO: limit rotation if there are obstacles or move element away
            // const obstacleLeft = prev.some((row) => row.some((col) =>
            //   col[1] <= 0 ||
            //   (state[col[0]][col[1] - 1] && col[2])
            // ));
            // const obstacleRight = prev.some((row) => row.some((col) =>
            //   col[1] >= w - 1 ||
            //   (state[col[0]][col[1] + 1] && col[2])
            // ));
            // const obstacleBelow = prev.some((row) => row.some((col) =>
            //   col[0] >= h - 1 ||
            //   (state[col[0] + 1][col[1]] && col[2])
            // ));
            // if (obstacleRight && obstacleLeft) {
            //   return;
            // }
            // const newR = Array.from(new Array(prev[0].length).keys());
            // const newC = Array.from(new Array(prev.length).keys());
            // const newElem = newR.map(r => newC.map(c => [prev[0][0][0] + r + Number(obstacleBelow), prev[0][0][1] + c + (obstacleLeft ? 1 : obstacleRight ? -1 : 0), true, ]));

            const newR = Array.from(new Array(prev[0].length).keys());
            const newC = Array.from(new Array(prev.length).keys());
            const newElem = newR.map(r => newC.map(c => [prev[0][0][0] + r, prev[0][0][1] + c, true, ]));

            newElem.forEach((row, i) => {
              row.forEach((col, j) => {
                newElem[i][j][2] = prev[prev.length - 1 - j][i][2]
                newElem[i][j][3] = prev[prev.length - 1 - j][i][3]
              })
            })
            return newElem;
          })
          break;
        case 'Shift':
          setCurrentElement(prev => {
            const prevTopLeftCoords = prev[0][0];
            if (!holdElement) {
              setHoldElement(prev);
              let newElement = nextElement;
              newElement = newElement.map((r, ri) => r.map((c, ci) => [prevTopLeftCoords[0] + ri, prevTopLeftCoords[1] + ci, c[2], c[3]]));
              setNextElement(getNewElement())
              return newElement
            }
            let newElement = holdElement;
            newElement = newElement.map((r, ri) => r.map((c, ci) => [prevTopLeftCoords[0] + ri, prevTopLeftCoords[1] + ci, c[2], c[3]]));
            setHoldElement(prev);
            return newElement;
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
  }, [state, gameOver, holdElement, nextElement, level]);

  return (
    <div className="flex gap-4">
      <div className="flex flex-col gap-4 w-40">
        <Preview element={holdElement} title="HOLD"/>
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
        {gameOver ? (
          <div className="absolute top-0 bottom-0 left-0 right-0 backdrop-blur-sm text-3xl flex items-center justify-center flex-col gap-2">
            Game over
            <button
              className="border border-amber-800 rounded px-4 py-1"
              onClick={() => {
                setGameOver(false);
                setHoldElement(null);
                setCurrentElement(getNewElement());
                setNextElement(getNewElement());
                setState(height.map(_ => [...width.map(_ => false)]));
              }}
            >
              Restart
            </button>
          </div>
        ) : null}
        {state.map((row, i) => (
          <div key={`row-${i}`} className={`flex gap-0.5 ${i === 1 || i === 0 ? 'hidden': ''}`}>
            {row.map((col, j) => {
              let elemPart;
              for (let k = 0; k < currentElement.length; k++) {
                elemPart = currentElement[k].find(c => c[0] === i && c[1] === j)
                if (elemPart) {
                  break;
                }
              }
              return (
                <div
                  key={`col-${i}-${j}`}
                  className={`w-7 h-7 border border-amber-800 ${elemPart?.[2] ? 'border-2 bg-amber-600' : ''} ${state[i][j] ? 'bg-amber-800' : ''}`}
                />
              )
            })}
          </div>
        ))}
      </div>
      <Preview element={nextElement} title="NEXT ELEMENT"/>
    </div>
  );
};

export default Field;
