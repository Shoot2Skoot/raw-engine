/**
 * MarkRenderer Component
 * Renders different mark types (checkbox, number, fill, circle, etc.)
 */

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
  isHovered = false
}) => {
  const getTransform = () => {
    // Center mark within hotspot bounds
    const { position, size, shape } = hotspot;

    if (shape === 'rect' && size) {
      return `translate(${position.x + size.width / 2}, ${position.y + size.height / 2})`;
    } else if (shape === 'circle') {
      return `translate(${position.x}, ${position.y})`;
    } else if (shape === 'polygon' && hotspot.points) {
      // For polygons, use centroid
      const centroidX = hotspot.points.reduce((sum, p) => sum + p.x, 0) / hotspot.points.length;
      const centroidY = hotspot.points.reduce((sum, p) => sum + p.y, 0) / hotspot.points.length;
      return `translate(${centroidX}, ${centroidY})`;
    }

    return `translate(${position.x}, ${position.y})`;
  };

  const renderMarkContent = () => {
    const size = hotspot.size || { width: 40, height: 40 };
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    switch (mark.type) {
      case 'checkbox':
        if (mark.value === 'checked' || mark.value === true) {
          // Checkmark
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
          // X mark
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
        const fillColor = mark.color || (typeof mark.value === 'string' ? mark.value : '#cccccc');
        if (hotspot.shape === 'rect' && size) {
          return (
            <rect
              x={-halfWidth}
              y={-halfHeight}
              width={size.width}
              height={size.height}
              fill={fillColor}
              opacity="0.6"
            />
          );
        } else if (hotspot.shape === 'circle' && hotspot.radius) {
          return (
            <circle
              cx="0"
              cy="0"
              r={hotspot.radius}
              fill={fillColor}
              opacity="0.6"
            />
          );
        } else if (hotspot.shape === 'polygon' && hotspot.points) {
          const points = hotspot.points.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <polygon
              points={points}
              fill={fillColor}
              opacity="0.6"
              transform={`translate(${-hotspot.position.x}, ${-hotspot.position.y})`}
            />
          );
        }
        return null;

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
            fill="currentColor"
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

  const className = `transition-opacity ${isHovered ? 'opacity-75' : ''} ${
    !mark.isPermanent ? 'text-gray-400' : 'text-gray-900'
  }`;

  return (
    <g
      transform={getTransform()}
      className={className}
      style={{
        animation: 'markAppear 0.2s ease-out'
      }}
    >
      {renderMarkContent()}
    </g>
  );
};

export default React.memo(MarkRenderer);
