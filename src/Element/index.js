import React from 'react';

const form = [[false, true, false], [true, true, true]]

const Element = () => {
  return (
    <div className="absolute top-px left-1/2 flex flex-col gap-0.5">
      {form.map((row,i) => (
        <div key={`row-${i}`} className="flex gap-0.5">
          {row.map((col, j) => (
            <div key={`col-${i}-${j}`} className={`w-7 h-7 ${form[i][j] ? 'bg-amber-800' : ''}`}/>
          ))}
        </div>
      ))}
    </div>
  );
};

export default Element;
