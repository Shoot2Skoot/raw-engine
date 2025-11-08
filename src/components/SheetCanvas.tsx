// components/SheetCanvas.tsx

import React, { useRef, useState } from 'react';
import { useEngine } from '../context/EngineContext';
import { CoordinateTransform } from '../utils/coordinates';
import { MarkRenderer, HotspotHighlight, HotspotOutline } from './MarkRenderer';
import { ValuePicker } from './ValuePicker';
import type { Point } from '../engine/types';

export const SheetCanvas: React.FC = () => {
  const { engine, currentSheet, currentTool } = useEngine();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [showValuePicker, setShowValuePicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<Point>({ x: 0, y: 0 });
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  if (!currentSheet) return null;

  const { definition } = currentSheet;

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const screenPoint = { x: e.clientX, y: e.clientY };
    const sheetPoint = CoordinateTransform.screenToSheet(screenPoint, svgRef.current);
    const hotspot = engine.getHotspotAt(sheetPoint);

    if (!hotspot) return;

    // Check if the hotspot can be marked
    if (!engine.canPlaceMark(hotspot)) {
      return;
    }

    // For tools that need value selection, show picker
    if (['number', 'fill', 'symbol', 'text'].includes(currentTool)) {
      setSelectedHotspot(hotspot.id);
      setPickerPosition(screenPoint);
      setShowValuePicker(true);
    } else if (currentTool === 'checkbox') {
      // Cycle through checkbox states: empty -> checked -> crossed -> empty
      const currentValue = hotspot.currentMark?.value;
      let nextValue: string | boolean;

      if (currentValue === 'checked' || currentValue === true) {
        nextValue = 'crossed';
      } else if (currentValue === 'crossed') {
        // Remove the mark to reset
        engine.removeMark(hotspot.id);
        return;
      } else {
        // Empty or false state
        nextValue = 'checked';
      }

      engine.addMark(hotspot.id, nextValue);
    } else if (currentTool === 'circle') {
      // Cycle through circle states: empty -> half -> filled -> empty
      const currentValue = hotspot.currentMark?.value;
      let nextValue: string;

      if (!currentValue || currentValue === 'empty') {
        nextValue = 'half';
      } else if (currentValue === 'half') {
        nextValue = 'filled';
      } else {
        // Remove the mark to reset
        engine.removeMark(hotspot.id);
        return;
      }

      engine.addMark(hotspot.id, nextValue);
    } else {
      // Direct mark for other tools
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
      engine.addMark(selectedHotspot, value);
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

                {/* Debug outline (remove in production) */}
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
          onCancel={() => setShowValuePicker(false)}
        />
      )}
    </div>
  );
};
