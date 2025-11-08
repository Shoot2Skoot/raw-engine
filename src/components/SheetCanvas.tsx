import React, { useRef, useState } from 'react';
import { useEngine } from '../context/EngineContext';
import { CoordinateTransform } from '../utils/coordinates';
import type { Point } from '../engine/types';
import { MarkRenderer, HotspotHighlight, HotspotOutline } from './MarkRenderer';
import { ValuePicker } from './ValuePicker';

export const SheetCanvas: React.FC = () => {
  const { engine, currentSheet, currentTool } = useEngine();
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<string | null>(null);
  const [showValuePicker, setShowValuePicker] = useState(false);
  const [pickerPosition, setPickerPosition] = useState<Point>({ x: 0, y: 0 });
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);

  if (!currentSheet) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
        <p className="text-gray-500">No sheet loaded</p>
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
      engine.setCurrentValue(value);
      engine.addMark(selectedHotspot);
    }
    setShowValuePicker(false);
    setSelectedHotspot(null);
  };

  const handleCancelPicker = () => {
    setShowValuePicker(false);
    setSelectedHotspot(null);
  };

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${definition.width} ${definition.height}`}
        className="w-full h-auto border-2 border-gray-300 rounded-lg touch-none select-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        style={{
          backgroundColor: definition.backgroundColor || 'white',
          maxHeight: '80vh'
        }}
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
          onCancel={handleCancelPicker}
        />
      )}
    </div>
  );
};
