import React from 'react';

const Preview = ({element, title}) => {
  return (
    <div className="bg-amber-50 p-2 border border-amber-800 flex flex-col gap-1 items-center">
      <p className="text-center">{title}</p>
      <div className="flex flex-col gap-1 items-center justify-center min-h-[9rem]">
        <div className="flex flex-col gap-0.5">
          {element ? element.map((r, ri) => (
            <div key={`preview-${ri}`} className="flex gap-0.5">
              {r.map((c, ci) => {
                return (
                  <div
                    key={`preview-${ri}-${ci}`}
                    className={`w-7 h-7 border border-amber-800 ${c[2] ? 'border-2 bg-amber-600' : 'opacity-0'}`}
                  />
                )
              })}
            </div>
          )) : <div className="h-36 w-full"/>}
        </div>
      </div>
    </div>
  );
};

export default Preview;
