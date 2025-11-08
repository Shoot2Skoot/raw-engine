// examples/mixed-layout.ts

import { SheetBuilder } from '../builders/SheetBuilder';

/**
 * Example 2: Mixed Layout (Roll-and-Write style)
 * Combines grids with freeform hotspots for a more complex game sheet
 */
export const mixedLayoutSheet = SheetBuilder.create('mixed-layout')
  .name('Advanced Game Sheet')
  .size(800, 1000)
  .backgroundColor('#FFFFFF')
  .addGridRegion(
    'main-grid',
    5,  // rows
    5,  // cols
    80, // cell size
    { x: 50, y: 50 },
    ['number', 'fill', 'symbol'],
    4  // gap
  )
  .addFreeformRegion(
    'resource-tracks',
    [
      // Water track (horizontal)
      ...Array.from({ length: 10 }, (_, i) => ({
        id: `water-${i}`,
        shape: 'circle' as const,
        position: { x: 50 + i * 50, y: 550 },
        radius: 20,
        allowedMarkTypes: ['fill' as const, 'checkbox' as const],
        maxMarks: 1
      })),
      // Energy track (vertical)
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `energy-${i}`,
        shape: 'rect' as const,
        position: { x: 600, y: 50 + i * 60 },
        size: { width: 40, height: 40 },
        allowedMarkTypes: ['checkbox' as const],
        maxMarks: 1
      })),
      // Special polygon region
      {
        id: 'special-region',
        shape: 'polygon' as const,
        position: { x: 0, y: 0 },
        points: [
          { x: 50, y: 700 },
          { x: 150, y: 700 },
          { x: 150, y: 800 },
          { x: 100, y: 850 },
          { x: 50, y: 800 }
        ],
        allowedMarkTypes: ['symbol' as const, 'fill' as const],
        maxMarks: 2
      }
    ],
    1
  )
  .build();
