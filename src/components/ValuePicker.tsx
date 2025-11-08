/**
 * Popup value picker for marks that require user input
 */

import React, { useEffect, useRef } from 'react';
import type { MarkType, Point } from '../engine/types';
import { X } from 'lucide-react';

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
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCancel]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
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
                className="w-14 h-14 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-xl font-bold transition-all active:scale-95"
              >
                {num}
              </button>
            ))}
            <button
              onClick={() => onSelect(10)}
              className="w-14 h-14 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-lg font-bold transition-all active:scale-95"
            >
              10
            </button>
            <button
              onClick={() => onSelect(11)}
              className="w-14 h-14 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-lg font-bold transition-all active:scale-95"
            >
              11
            </button>
            <button
              onClick={() => onSelect(12)}
              className="w-14 h-14 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-lg font-bold transition-all active:scale-95"
            >
              12
            </button>
          </div>
        );

      case 'fill':
        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
          '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2',
          '#E8DAEF', '#FADBD8', '#D5F4E6', '#FCF3CF'
        ];
        return (
          <div className="grid grid-cols-4 gap-2 p-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onSelect(color)}
                className="w-12 h-12 rounded-lg border-2 border-gray-300 hover:border-gray-800 hover:scale-110 transition-all active:scale-95"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        );

      case 'symbol':
        const symbols = ['★', '♦', '♥', '♠', '♣', '●', '■', '▲', '✓', '✗', '⬤', '◆'];
        return (
          <div className="grid grid-cols-4 gap-2 p-3">
            {symbols.map(symbol => (
              <button
                key={symbol}
                onClick={() => onSelect(symbol)}
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-2xl transition-all active:scale-95"
              >
                {symbol}
              </button>
            ))}
          </div>
        );

      case 'text':
        return (
          <div className="p-3">
            <input
              type="text"
              autoFocus
              placeholder="Enter text..."
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSelect(e.currentTarget.value);
                }
              }}
            />
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                if (input.value) {
                  onSelect(input.value);
                }
              }}
              className="mt-2 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add Text
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  // Position the picker, ensuring it stays within viewport
  const pickerStyle: React.CSSProperties = {
    left: position.x + 10,
    top: position.y + 10,
  };

  // Adjust if too close to right edge
  if (position.x > window.innerWidth - 250) {
    pickerStyle.left = position.x - 240;
  }

  // Adjust if too close to bottom
  if (position.y > window.innerHeight - 300) {
    pickerStyle.top = position.y - 290;
  }

  return (
    <div
      ref={ref}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border-2 border-gray-300 animate-in fade-in zoom-in duration-200"
      style={pickerStyle}
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-700">
          Select {tool}
        </span>
        <button
          onClick={onCancel}
          className="p-1 rounded hover:bg-gray-100 transition-colors"
          aria-label="Close"
        >
          <X size={16} />
        </button>
      </div>

      {renderPicker()}

      <button
        onClick={onCancel}
        className="w-full p-2 text-sm text-gray-600 hover:bg-gray-100 border-t border-gray-200 rounded-b-lg transition-colors"
      >
        Cancel
      </button>
    </div>
  );
};
