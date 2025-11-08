/**
 * ValuePicker Component
 * Popover for selecting values (numbers, colors, symbols)
 */

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
  const ref = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onCancel]);

  const renderPicker = () => {
    switch (tool) {
      case 'number':
        return (
          <div className="grid grid-cols-3 gap-2 p-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
              <button
                key={num}
                onClick={() => onSelect(num)}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-xl font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {num}
              </button>
            ))}
          </div>
        );

      case 'fill':
        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
          '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
          '#F8B500', '#E74C3C', '#3498DB', '#2ECC71'
        ];
        return (
          <div className="grid grid-cols-4 gap-2 p-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onSelect(color)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-800"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        );

      case 'symbol':
        const symbols = ['★', '♦', '♥', '♠', '♣', '●', '■', '▲'];
        return (
          <div className="grid grid-cols-4 gap-2 p-3">
            {symbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => onSelect(symbol)}
                className="w-10 h-10 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-xl transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {symbol}
              </button>
            ))}
          </div>
        );

      case 'text':
      case 'pencil':
        return (
          <div className="p-3">
            <input
              type="text"
              autoFocus
              placeholder="Enter text..."
              className="w-48 px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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

  // Don't show picker for checkbox and circle (they cycle)
  if (tool === 'checkbox' || tool === 'circle') {
    return null;
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-300"
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
        Cancel (Esc)
      </button>
    </div>
  );
};

export default ValuePicker;
