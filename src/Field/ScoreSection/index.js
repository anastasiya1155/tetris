import React from 'react';

const ScoreSection = ({linesRemoved, score, level, speed}) => {
  return (
    <div className="flex-1 bg-amber-100 border border-amber-800 p-2 text-center">
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
      <p>{speed}</p>
    </div>
  );
};

export default ScoreSection;
