// examples/02-image-hotspots.ts - Image with freeform hotspots (Welcome to Moon style)

import { SheetBuilder } from '../builders/SheetBuilder';

/**
 * Example 2: Image with freeform hotspots
 * Demonstrates custom hotspot shapes overlaid on background images
 */
export const moonMissionSheet = SheetBuilder.create('moon-mission-1')
  .name('Mission 1: First Steps')
  .size(800, 1000)
  .backgroundColor('#1a1a2e')
  // Note: Background image would be added here in a real implementation
  // .background('/demo-sheets/moon-mission-1.png')
  .addFreeformRegion(
    'resources',
    [
      // Circular resource markers
      {
        id: 'water-1',
        shape: 'circle',
        position: { x: 120, y: 80 },
        radius: 25,
        allowedMarkTypes: ['checkbox'],
        maxMarks: 1
      },
      {
        id: 'water-2',
        shape: 'circle',
        position: { x: 180, y: 80 },
        radius: 25,
        allowedMarkTypes: ['checkbox'],
        maxMarks: 1
      },
      {
        id: 'water-3',
        shape: 'circle',
        position: { x: 240, y: 80 },
        radius: 25,
        allowedMarkTypes: ['checkbox'],
        maxMarks: 1
      },
      // Energy track (polygon)
      {
        id: 'energy-track',
        shape: 'polygon',
        position: { x: 0, y: 0 },
        points: [
          { x: 100, y: 150 },
          { x: 250, y: 150 },
          { x: 250, y: 200 },
          { x: 100, y: 200 }
        ],
        allowedMarkTypes: ['number'],
        maxMarks: 1
      }
    ],
    1 // zIndex
  )
  .addFreeformRegion(
    'planets',
    [
      // Planet grid cells
      {
        id: 'planet-grid-1',
        shape: 'rect',
        position: { x: 300, y: 300 },
        size: { width: 40, height: 40 },
        allowedMarkTypes: ['fill', 'symbol'],
        maxMarks: 1
      },
      {
        id: 'planet-grid-2',
        shape: 'rect',
        position: { x: 350, y: 300 },
        size: { width: 40, height: 40 },
        allowedMarkTypes: ['fill', 'symbol'],
        maxMarks: 1
      },
      {
        id: 'planet-grid-3',
        shape: 'rect',
        position: { x: 400, y: 300 },
        size: { width: 40, height: 40 },
        allowedMarkTypes: ['fill', 'symbol'],
        maxMarks: 1
      }
    ],
    2 // zIndex - render on top of resources
  )
  .build();
