import React, { useRef, useState } from 'react';
import { useEngine } from '../context/EngineContext';
import { CoordinateTransform } from '../utils/coordinates';
import { MarkRenderer } from './MarkRenderer';
import { ValuePicker } from './ValuePicker';
import type { Point, Hotspot } from '../engine/types';

// Helper component for hotspot highlights
const HotspotHighlight: React.FC<{ hotspot: Hotspot }> = ({ hotspot }) => {
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
      case 'point':
        return (
          <circle
            cx={hotspot.position.x}
            cy={hotspot.position.y}
            r={20}
            fill="blue"
            opacity="0.1"
            pointerEvents="none"
          />
        );
      default:
        return null;
    }
  };

  return renderHighlight();
};

// Helper component for debug outlines
const HotspotOutline: React.FC<{ hotspot: Hotspot }> = ({ hotspot }) => {
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
            stroke="#999"
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
            stroke="#999"
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
            stroke="#999"
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

  return renderOutline();
};

export const SheetCanvas: React.FC = () => {
  const { engine, currentSheet, currentTool } = useEngine();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [showValuePicker, setShowValuePicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<Point>({ x: 0, y: 0 });
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  if (!currentSheet) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        No sheet loaded
      </div>
    );
  }

  const { definition } = currentSheet;

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const screenPoint = { x: e.clientX, y: e.clientY };
    const sheetPoint = CoordinateTransform.screenToSheet(screenPoint, svgRef.current);
    const hotspot = engine.getHotspotAt(sheetPoint);

    if (!hotspot) return;

    // Check if we can place a mark
    if (!engine.canPlaceMark(hotspot)) {
      return;
    }

    // For tools that need value selection, show picker
    if (['number', 'fill', 'symbol'].includes(currentTool)) {
      setSelectedHotspot(hotspot.id);
      setPickerPosition(screenPoint);
      setShowValuePicker(true);
    } else {
      // Direct mark for checkbox, circle, etc.
      engine.addMark(hotspot.id);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const screenPoint = { x: e.clientX, y: e.clientY };
    const sheetPoint = CoordinateTransform.screenToSheet(screenPoint, svgRef.current);
    const hotspot = engine.getHotspotAt(sheetPoint);

    setHoveredHotspot(hotspot?.id || null);

    // Update cursor
    if (hotspot && engine.canPlaceMark(hotspot)) {
      e.currentTarget.style.cursor = 'pointer';
    } else {
      e.currentTarget.style.cursor = 'default';
    }
  };

  const handleValueSelected = (value: string | number) => {
    if (selectedHotspot) {
      engine.setCurrentValue(value);
      engine.addMark(selectedHotspot);
    }
    setShowValuePicker(false);
    setSelectedHotspot(null);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${definition.width} ${definition.height}`}
        className="w-full h-auto border border-gray-300 rounded-lg touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{ backgroundColor: definition.backgroundColor || 'white' }}
      >
        {/* Background image */}
        {definition.backgroundImage && (
          <image
            href={definition.backgroundImage}
            width={definition.width}
            height={definition.height}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* Render regions */}
        {definition.regions.map(region => (
          <g key={region.id} style={{ zIndex: region.zIndex }}>
            {region.hotspots?.map(hotspot => (
              <g key={hotspot.id}>
                {/* Hotspot highlight on hover */}
                {hoveredHotspot === hotspot.id && (
                  <HotspotHighlight hotspot={hotspot} />
                )}

                {/* Debug outline (only in development) */}
                {import.meta.env.DEV && (
                  <HotspotOutline hotspot={hotspot} />
                )}

                {/* Render mark if exists */}
                {hotspot.currentMark && (
                  <MarkRenderer
                    mark={hotspot.currentMark}
                    hotspot={hotspot}
                    isHovered={hoveredHotspot === hotspot.id}
                  />
                )}
              </g>
            ))}
          </g>
        ))}
      </svg>

      {/* Value picker popover */}
      {showValuePicker && selectedHotspot && (
        <ValuePicker
          tool={currentTool}
          position={pickerPosition}
          onSelect={handleValueSelected}
          onCancel={() => {
            setShowValuePicker(false);
            setSelectedHotspot(null);
          }}
        />
      )}
    </div>
  );
};
