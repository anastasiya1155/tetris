import React, { useEffect, useState } from 'react';

const w = 10;
const h = 20;

const width = Array.from(new Array(w).keys());
const height = Array.from(new Array(h).keys());

const getNewElement = () => [
  [[0, 3, false, 1], [0, 4, true, 2], [0, 5, false, 3]],
  [[1, 3, true, 4], [1, 4, true, 5], [1, 5, true, 6]]
]

const moveElementDown = (prev, state, setState, setGameOver) => {
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
    if (state[0].some(s => s) || state[1].some(s => s) || state[2].some(s => s)) {
      setGameOver(true);
    }
    return getNewElement()
  }
  return prev.map(row => row.map(col => [col[0] + 1, col[1], col[2], col[3]]));
}

const Field = () => {
  const [state, setState] = useState(height.map(_ => [...width.map(_ => false)]));
  const [currentElement, setCurrentElement] = useState(getNewElement())
  const [gameOver, setGameOver] = useState(false);

  useEffect(() => {
    const handler = () => {
      if (!gameOver) {
        setCurrentElement(prev => moveElementDown(prev, state, setState, setGameOver));
      }
    }
    const intervalId = setInterval(handler, 500);

    return () => {
      clearInterval(intervalId);
    }
  }, [state, gameOver]);

  useEffect(() => {
    const handler = e => {
      if (gameOver) {
        return;
      }
      const key = e.key;
      console.log(key);
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
          setCurrentElement(prev => {
            const first = moveElementDown(prev, state, setState)
            const second = moveElementDown(first, state, setState)
            return moveElementDown(second, state, setState)
          })
          break;
        case 'ArrowUp':
          setCurrentElement(prev => {
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
        default:
          break;
      }
    }
    document.addEventListener('keydown', handler);

    return () => {
      document.removeEventListener('keydown', handler)
    }
  }, [state, gameOver])

  return (
    <div className="relative flex flex-col gap-0.5">
      {gameOver ? (
        <div className="absolute top-0 bottom-0 left-0 right-0 backdrop-blur-sm text-3xl flex items-center justify-center flex-col gap-2">
          Game over
          <button
            className="border border-amber-800 rounded px-4 py-1"
            onClick={() => {
              setGameOver(false);
              setCurrentElement(getNewElement())
              setState(height.map(_ => [...width.map(_ => false)]))
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
  );
};

export default Field;
