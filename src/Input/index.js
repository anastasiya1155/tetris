import React from 'react';

const Input = ({label, ...rest}) => {
  return (
    <label className="text-lg">
      {label}
      <input className="w-full border border-amber-800 rounded px-1 text-lg" {...rest} />
    </label>
  );
};

export default Input;
