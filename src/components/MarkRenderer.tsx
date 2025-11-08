/**
 * Component to render different types of marks
 */

import React from 'react';
import type { Mark, Hotspot } from '../engine/types';
import { Geometry } from '../utils/geometry';

interface MarkRendererProps {
  mark: Mark;
  hotspot: Hotspot;
  isHovered?: boolean;
}

export const MarkRenderer: React.FC<MarkRendererProps> = React.memo(({
  mark,
  hotspot,
  isHovered = false
}) => {
  const center = Geometry.getHotspotCenter(hotspot);
  const size = hotspot.size || { width: 40, height: 40 };
  const halfWidth = size.width / 2;
  const halfHeight = size.height / 2;

  const renderMarkContent = () => {
    switch (mark.type) {
      case 'checkbox':
        if (mark.value === 'checked') {
          return (
            <path
              d={`M ${center.x - halfWidth * 0.5} ${center.y} L ${center.x - halfWidth * 0.2} ${center.y + halfHeight * 0.4} L ${center.x + halfWidth * 0.6} ${center.y - halfHeight * 0.5}`}
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          );
        } else if (mark.value === 'crossed') {
          return (
            <>
              <line
                x1={center.x - halfWidth * 0.5}
                y1={center.y - halfHeight * 0.5}
                x2={center.x + halfWidth * 0.5}
                y2={center.y + halfHeight * 0.5}
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <line
                x1={center.x + halfWidth * 0.5}
                y1={center.y - halfHeight * 0.5}
                x2={center.x - halfWidth * 0.5}
                y2={center.y + halfHeight * 0.5}
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
            x={center.x}
            y={center.y}
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
        if (hotspot.shape === 'rect' && hotspot.size) {
          return (
            <rect
              x={hotspot.position.x}
              y={hotspot.position.y}
              width={hotspot.size.width}
              height={hotspot.size.height}
              fill={mark.color || mark.value as string || '#cccccc'}
              opacity="0.6"
            />
          );
        } else if (hotspot.shape === 'circle' && hotspot.radius) {
          return (
            <circle
              cx={center.x}
              cy={center.y}
              r={hotspot.radius}
              fill={mark.color || mark.value as string || '#cccccc'}
              opacity="0.6"
            />
          );
        } else if (hotspot.shape === 'polygon' && hotspot.points) {
          const points = hotspot.points.map(p => `${p.x},${p.y}`).join(' ');
          return (
            <polygon
              points={points}
              fill={mark.color || mark.value as string || '#cccccc'}
              opacity="0.6"
            />
          );
        }
        return null;

      case 'circle':
        const radius = Math.min(halfWidth, halfHeight) * 0.7;
        if (mark.value === 'filled') {
          return (
            <circle
              cx={center.x}
              cy={center.y}
              r={radius}
              fill="currentColor"
            />
          );
        } else if (mark.value === 'half') {
          return (
            <>
              <circle
                cx={center.x}
                cy={center.y}
                r={radius}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d={`M ${center.x},${center.y - radius} A ${radius},${radius} 0 0,1 ${center.x},${center.y + radius} Z`}
                fill="currentColor"
              />
            </>
          );
        } else {
          return (
            <circle
              cx={center.x}
              cy={center.y}
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
            x={center.x}
            y={center.y}
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
            x={center.x}
            y={center.y}
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
            x={center.x}
            y={center.y}
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
      className={`transition-opacity ${isHovered ? 'opacity-75' : ''} ${
        !mark.isPermanent ? 'text-gray-400' : 'text-gray-900'
      }`}
      style={{
        animation: 'markAppear 0.2s ease-out'
      }}
    >
      {renderMarkContent()}
    </g>
  );
}, (prev, next) => {
  // Custom comparison for memoization
  return prev.mark.id === next.mark.id &&
         prev.isHovered === next.isHovered;
});

MarkRenderer.displayName = 'MarkRenderer';
