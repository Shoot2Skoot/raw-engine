// components/MarkRenderer.tsx

import React from 'react';
import type { Mark, Hotspot } from '../engine/types';

interface MarkRendererProps {
  mark: Mark;
  hotspot: Hotspot;
  isHovered?: boolean;
}

export const MarkRenderer: React.FC<MarkRendererProps> = ({
  mark,
  hotspot,
  isHovered
}) => {
  const getTransform = () => {
    // Center mark within hotspot bounds
    const { position, size, radius, shape } = hotspot;

    if (shape === 'rect' && size) {
      return `translate(${position.x + size.width / 2}, ${position.y + size.height / 2})`;
    } else if (shape === 'circle' && radius) {
      return `translate(${position.x}, ${position.y})`;
    } else if (shape === 'polygon' && hotspot.points && hotspot.points.length > 0) {
      // Calculate centroid of polygon
      const centroid = hotspot.points.reduce(
        (acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }),
        { x: 0, y: 0 }
      );
      centroid.x /= hotspot.points.length;
      centroid.y /= hotspot.points.length;
      return `translate(${centroid.x}, ${centroid.y})`;
    }

    return `translate(${position.x}, ${position.y})`;
  };

  const getSize = () => {
    if (hotspot.shape === 'rect' && hotspot.size) {
      return hotspot.size;
    } else if (hotspot.shape === 'circle' && hotspot.radius) {
      return { width: hotspot.radius * 2, height: hotspot.radius * 2 };
    }
    return { width: 40, height: 40 };
  };

  const renderMarkContent = () => {
    const size = getSize();
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    switch (mark.type) {
      case 'checkbox':
        if (mark.value === 'checked' || mark.value === true) {
          return (
            <path
              d={`M ${-halfWidth * 0.5} 0 L ${-halfWidth * 0.2} ${halfHeight * 0.4} L ${halfWidth * 0.6} ${-halfHeight * 0.5}`}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          );
        } else if (mark.value === 'crossed') {
          return (
            <>
              <line
                x1={-halfWidth * 0.5}
                y1={-halfHeight * 0.5}
                x2={halfWidth * 0.5}
                y2={halfHeight * 0.5}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1={halfWidth * 0.5}
                y1={-halfHeight * 0.5}
                x2={-halfWidth * 0.5}
                y2={halfHeight * 0.5}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </>
          );
        }
        return null;

      case 'number':
        return (
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(size.width, size.height) * 0.6}
            fontWeight="bold"
            fill="currentColor"
          >
            {mark.value}
          </text>
        );

      case 'fill':
        return (
          <rect
            x={-halfWidth}
            y={-halfHeight}
            width={size.width}
            height={size.height}
            fill={mark.color || mark.value as string || '#cccccc'}
            opacity="0.7"
          />
        );

      case 'circle':
        const radius = Math.min(halfWidth, halfHeight) * 0.7;
        if (mark.value === 'filled') {
          return (
            <circle
              cx="0"
              cy="0"
              r={radius}
              fill="currentColor"
            />
          );
        } else if (mark.value === 'half') {
          return (
            <>
              <circle
                cx="0"
                cy="0"
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d={`M 0,${-radius} A ${radius},${radius} 0 0,1 0,${radius} Z`}
                fill="currentColor"
              />
            </>
          );
        } else {
          return (
            <circle
              cx="0"
              cy="0"
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          );
        }

      case 'text':
        return (
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(size.width, size.height) * 0.4}
            fill="currentColor"
          >
            {mark.value}
          </text>
        );

      case 'symbol':
        return (
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(size.width, size.height) * 0.6}
          >
            {mark.value}
          </text>
        );

      case 'pencil':
        return (
          <text
            x="0"
            y="0"
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={Math.min(size.width, size.height) * 0.5}
            fontStyle="italic"
            fill="currentColor"
            opacity="0.5"
          >
            {mark.value}
          </text>
        );

      default:
        return null;
    }
  };

  return (
    <g
      transform={getTransform()}
      className={`transition-opacity ${isHovered ? 'opacity-75' : ''} ${!mark.isPermanent ? 'text-gray-400' : 'text-gray-900'
        }`}
      style={{
        animation: 'markAppear 0.2s ease-out'
      }}
    >
      {renderMarkContent()}
    </g>
  );
};
