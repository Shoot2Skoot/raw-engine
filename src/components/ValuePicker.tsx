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
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onCancel();
      }
    };

    // Add slight delay to prevent immediate closing
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onCancel]);

  // Close on Escape key
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
                className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-500 text-xl font-bold transition-colors"
              >
                {num}
              </button>
            ))}
          </div>
        );

      case 'fill':
        const colors = [
          '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
          '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6',
          '#F97316', '#84CC16', '#06B6D4', '#A855F7'
        ];
        return (
          <div className="grid grid-cols-4 gap-2 p-3">
            {colors.map(color => (
              <button
                key={color}
                onClick={() => onSelect(color)}
                className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-800 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        );

      case 'symbol':
        const symbols = ['★', '♦', '♥', '♠', '♣', '●', '■', '▲', '✓', '✗', '○', '□'];
        return (
          <div className="grid grid-cols-4 gap-2 p-3">
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
            <button
              onClick={(e) => {
                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                onSelect(input.value);
              }}
              className="mt-2 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
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
