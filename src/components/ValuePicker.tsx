// components/ValuePicker.tsx

import React, { useEffect, useRef } from 'react';
import type { MarkType, Point } from '../engine/types';

interface ValuePickerProps {
  tool: MarkType;
  position: Point;
  onSelect: (value: string | number) => void;
  onCancel: () => void;
}

export const ValuePicker: React.FC<ValuePickerProps> = ({
  tool,
  position,
  onSelect,
  onCancel
}) => {
  const pickerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    // Add small delay to prevent immediate closure
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onCancel]);

  const renderPicker = () => {
    switch (tool) {
      case 'number':
        return (
          <div className="grid grid-cols-3 gap-2 p-2">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
              <button
                key={num}
                onClick={() => onSelect(num)}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-xl font-bold transition-colors"
              >
                {num}
              </button>
            ))}
          </div>
        );

      case 'fill':
        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
          '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
        ];
        return (
          <div className="grid grid-cols-4 gap-2 p-2">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onSelect(color)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-800 transition-colors"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        );

      case 'symbol':
        const symbols = ['★', '♦', '♥', '♠', '♣', '●', '■', '▲'];
        return (
          <div className="grid grid-cols-4 gap-2 p-2">
            {symbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => onSelect(symbol)}
                className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-xl transition-colors"
              >
                {symbol}
              </button>
            ))}
          </div>
        );

      case 'text':
      case 'pencil':
        return (
          <div className="p-2">
            <input
              type="text"
              autoFocus
              placeholder="Enter text..."
              className="w-48 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSelect(e.currentTarget.value);
                }
              }}
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={pickerRef}
      className="absolute z-50 bg-white rounded-lg shadow-2xl border border-gray-300"
      style={{
        left: position.x + 10,
        top: position.y + 10
      }}
      onClick={e => e.stopPropagation()}
    >
      {renderPicker()}
      <button
        onClick={onCancel}
        className="w-full p-2 text-sm text-gray-600 hover:bg-gray-100 border-t border-gray-300 rounded-b-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};
