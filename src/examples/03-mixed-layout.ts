// examples/03-mixed-layout.ts - Mixed grid and freeform layout

import { SheetBuilder } from '../builders/SheetBuilder';

/**
 * Example 3: Mixed layout (grid + freeform)
 * Demonstrates combining grid regions with custom hotspots
 */
export const complexGameSheet = SheetBuilder.create('complex-game')
  .name('Adventure Sheet')
  .size(1000, 1400)
  .backgroundColor('#FAF9F6')
  // Tech tree grid at top
  .addGridRegion(
    'tech-tree',
    3,  // rows
    4,  // cols
    60, // cell size
    { x: 50, y: 50 },
    ['checkbox', 'circle'],
    5   // gap
  )
  // Resource track with individual cells
  .addFreeformRegion(
    'resource-tracks',
    Array.from({ length: 10 }, (_, i) => ({
      id: `resource-${i}`,
      shape: 'rect' as const,
      position: { x: 100 + i * 45, y: 300 },
      size: { width: 40, height: 40 },
      allowedMarkTypes: ['fill' as const, 'number' as const],
      maxMarks: 1
    })),
    1
  )
  // Irregular shaped regions
  .addFreeformRegion(
    'planet-map',
    [
      {
        id: 'region-alpha',
        shape: 'polygon',
        position: { x: 0, y: 0 },
        points: [
          { x: 500, y: 600 },
          { x: 580, y: 620 },
          { x: 560, y: 700 },
          { x: 480, y: 680 }
        ],
        allowedMarkTypes: ['symbol', 'fill'],
        maxMarks: 1
      },
      {
        id: 'region-beta',
        shape: 'polygon',
        position: { x: 0, y: 0 },
        points: [
          { x: 600, y: 600 },
          { x: 680, y: 620 },
          { x: 660, y: 700 },
          { x: 580, y: 680 }
        ],
        allowedMarkTypes: ['symbol', 'fill'],
        maxMarks: 1
      }
    ],
    2
  )
  // Score track at bottom
  .addGridRegion(
    'score-track',
    1,  // rows
    10, // cols
    50, // cell size
    { x: 200, y: 1200 },
    ['number'],
    10  // gap
  )
  .build();
