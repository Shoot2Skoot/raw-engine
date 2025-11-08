// components/MarkRenderer.tsx - Renders different mark types

import React from 'react';
import type { Mark, Hotspot } from '../engine/types';
import { Geometry } from '../utils/geometry';

interface MarkRendererProps {
  mark: Mark;
  hotspot: Hotspot;
  isHovered?: boolean;
}

export const MarkRenderer: React.FC<MarkRendererProps> = React.memo(
  ({ mark, hotspot, isHovered = false }) => {
    const getTransform = (): string => {
      // Center mark within hotspot bounds
      const bounds = Geometry.getBounds(hotspot);

      if (hotspot.shape === 'rect' && hotspot.size) {
        return `translate(${hotspot.position.x + hotspot.size.width / 2}, ${
          hotspot.position.y + hotspot.size.height / 2
        })`;
      } else if (hotspot.shape === 'circle') {
        return `translate(${hotspot.position.x}, ${hotspot.position.y})`;
      } else if (hotspot.shape === 'polygon' && hotspot.points) {
        // Use center of bounding box
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        return `translate(${centerX}, ${centerY})`;
      }

      return `translate(${hotspot.position.x}, ${hotspot.position.y})`;
    };

    const renderMarkContent = () => {
      const bounds = Geometry.getBounds(hotspot);
      const size = { width: bounds.width, height: bounds.height };
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
              fill={mark.color || String(mark.value) || '#cccccc'}
              opacity="0.6"
            />
          );

        case 'circle': {
          const radius = Math.min(halfWidth, halfHeight) * 0.7;
          if (mark.value === 'filled') {
            return <circle cx="0" cy="0" r={radius} fill="currentColor" />;
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

    return (
      <g
        transform={getTransform()}
        className={`transition-opacity ${isHovered ? 'opacity-75' : ''} ${
          !mark.isPermanent ? 'text-gray-400' : 'text-gray-900'
        }`}
        style={{
          animation: 'mark-appear 0.2s ease-out',
        }}
      >
        {renderMarkContent()}
      </g>
    );
  },
  (prev, next) =>
    prev.mark.id === next.mark.id && prev.isHovered === next.isHovered
);

MarkRenderer.displayName = 'MarkRenderer';
