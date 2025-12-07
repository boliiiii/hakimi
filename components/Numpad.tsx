
import React from 'react';

interface NumpadProps {
  onInput: (num: number) => void;
  onClear: () => void;
  disabled: boolean;
  highlightKey?: number | null; // Optional prop to highlight a specific key
  clearLabel: string;
}

const Numpad: React.FC<NumpadProps> = ({ onInput, onClear, disabled, highlightKey, clearLabel }) => {
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="grid grid-cols-3 gap-2 w-full max-w-[280px] mx-auto px-4">
      {keys.map((key) => {
        const isHighlighted = highlightKey === key;
        return (
          <button
            key={key}
            onClick={() => onInput(key)}
            disabled={disabled}
            className={`
              h-12 rounded-xl text-2xl font-display font-bold shadow-[0px_3px_0px_0px_rgba(0,0,0,0.1)] transition-all touch-manipulation
              ${disabled 
                ? 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none border border-gray-100' 
                : isHighlighted
                  ? 'bg-yellow-100 text-ghibli-dark border-2 border-yellow-400 ring-2 ring-yellow-200 animate-pulse scale-105 shadow-[0px_4px_0px_0px_rgba(250,204,21,1)]'
                  : 'bg-white text-ghibli-dark border border-gray-200 hover:bg-orange-50 active:bg-orange-100 active:shadow-none active:translate-y-[3px]'
              }
            `}
          >
            {key}
          </button>
        );
      })}
      <button
        onClick={onClear}
        disabled={disabled}
        className={`
          col-span-2 h-12 rounded-xl text-xl font-cute font-bold shadow-[0px_3px_0px_0px_rgba(0,0,0,0.1)] transition-all active:shadow-none active:translate-y-[3px] touch-manipulation
          ${disabled 
            ? 'bg-gray-100 text-gray-300 shadow-none border border-gray-100' 
            : 'bg-red-50 text-red-400 hover:bg-red-100 border border-red-100 active:bg-red-200'
          }
        `}
      >
        {clearLabel}
      </button>
    </div>
  );
};

export default Numpad;
