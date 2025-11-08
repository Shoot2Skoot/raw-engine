// components/SheetCanvas.tsx

import React, { useRef, useState, useMemo } from 'react';
import { useEngine } from '../context/EngineContext';
import { CoordinateTransform } from '../utils/coordinates';
import { MarkRenderer, HotspotHighlight, HotspotOutline } from './MarkRenderer';
import { ValuePicker } from './ValuePicker';
import { useKeyboardNavigation } from '../hooks/useKeyboardNavigation';
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

  // Get all hotspots for keyboard navigation
  const allHotspots = useMemo(() => {
    return definition.regions.flatMap(r => r.hotspots || []);
  }, [definition]);

  // Enable keyboard navigation
  const { focusedIndex } = useKeyboardNavigation(engine, allHotspots);

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;

    const screenPoint = { x: e.clientX, y: e.clientY };
    const sheetPoint = CoordinateTransform.screenToSheet(screenPoint, svgRef.current);
    const hotspot = engine.getHotspotAt(sheetPoint);

    if (!hotspot) return;

    // For tools that need value selection, show picker
    if (['number', 'fill', 'symbol', 'text', 'pencil'].includes(currentTool)) {
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
      engine.addMark(selectedHotspot, value);
    }
    setShowValuePicker(false);
    setSelectedHotspot(null);
  };

  const handleCancel = () => {
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
            {region.hotspots?.map((hotspot) => {
              const globalIndex = allHotspots.findIndex(h => h.id === hotspot.id);
              const isFocused = globalIndex === focusedIndex;
              return (
                <g
                  key={hotspot.id}
                  role="button"
                  tabIndex={0}
                  aria-label={`Hotspot ${hotspot.id}${hotspot.currentMark ? ', marked' : ', empty'}`}
                >
                  {/* Hotspot highlight on hover or focus */}
                  {(hoveredHotspot === hotspot.id || isFocused) && (
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
                      isHovered={hoveredHotspot === hotspot.id || isFocused}
                    />
                  )}
                </g>
              );
            })}
          </g>
        ))}
      </svg>

      {/* Value picker popover */}
      {showValuePicker && selectedHotspot && (
        <ValuePicker
          tool={currentTool}
          position={pickerPosition}
          onSelect={handleValueSelected}
          onCancel={handleCancel}
        />
      )}
    </div>
  );
};
