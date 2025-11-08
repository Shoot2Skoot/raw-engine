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
    const { position, size, shape } = hotspot;

    if (shape === 'rect' && size) {
      return `translate(${position.x + size.width / 2}, ${position.y + size.height / 2})`;
    } else if (shape === 'circle') {
      return `translate(${position.x}, ${position.y})`;
    }

    return `translate(${position.x}, ${position.y})`;
  };

  const renderMarkContent = () => {
    const size = hotspot.size || { width: 40, height: 40 };
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;

    switch (mark.type) {
      case 'checkbox':
        if (mark.value === 'checked') {
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
            fill={mark.color || String(mark.value)}
            opacity="0.6"
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
        // Render icons from symbol set
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
        // Similar to number but lighter, italic
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
        animation: 'markAppear 0.2s ease-out'
      }}
    >
      {renderMarkContent()}
    </g>
  );
};

// Helper component for hotspot highlight
export const HotspotHighlight: React.FC<{ hotspot: Hotspot }> = ({ hotspot }) => {
  const renderHighlight = () => {
    switch (hotspot.shape) {
      case 'rect':
        return (
          <rect
            x={hotspot.position.x}
            y={hotspot.position.y}
            width={hotspot.size?.width}
            height={hotspot.size?.height}
            fill="blue"
            opacity="0.1"
            pointerEvents="none"
          />
        );
      case 'circle':
        return (
          <circle
            cx={hotspot.position.x}
            cy={hotspot.position.y}
            r={hotspot.radius}
            fill="blue"
            opacity="0.1"
            pointerEvents="none"
          />
        );
      case 'polygon':
        const points = hotspot.points?.map(p => `${p.x},${p.y}`).join(' ');
        return (
          <polygon
            points={points}
            fill="blue"
            opacity="0.1"
            pointerEvents="none"
          />
        );
      default:
        return null;
    }
  };

  return <>{renderHighlight()}</>;
};

// Helper component for debug outlines
export const HotspotOutline: React.FC<{ hotspot: Hotspot }> = ({ hotspot }) => {
  const renderOutline = () => {
    switch (hotspot.shape) {
      case 'rect':
        return (
          <rect
            x={hotspot.position.x}
            y={hotspot.position.y}
            width={hotspot.size?.width}
            height={hotspot.size?.height}
            fill="none"
            stroke="red"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.3"
            pointerEvents="none"
          />
        );
      case 'circle':
        return (
          <circle
            cx={hotspot.position.x}
            cy={hotspot.position.y}
            r={hotspot.radius}
            fill="none"
            stroke="red"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.3"
            pointerEvents="none"
          />
        );
      case 'polygon':
        const points = hotspot.points?.map(p => `${p.x},${p.y}`).join(' ');
        return (
          <polygon
            points={points}
            fill="none"
            stroke="red"
            strokeWidth="1"
            strokeDasharray="2,2"
            opacity="0.3"
            pointerEvents="none"
          />
        );
      default:
        return null;
    }
  };

  return <>{renderOutline()}</>;
};
