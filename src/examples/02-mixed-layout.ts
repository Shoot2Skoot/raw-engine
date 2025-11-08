/**
 * Example 2: Mixed Layout
 * Demonstrates grid + freeform hotspots with multiple mark types
 */

import { SheetBuilder } from '../builders/SheetBuilder';

export const mixedLayoutSheet = SheetBuilder.create('mixed-demo')
  .name('Mixed Layout Demo')
  .size(800, 1000)
  .backgroundColor('#E8F4F8')

  // Resource track (grid)
  .addGridRegion(
    'resource-track',
    1,  // rows
    10, // cols
    60, // cell size
    { x: 50, y: 50 },
    ['number', 'fill'],
    { gap: 5 }
  )

  // Achievement checkboxes (grid)
  .addGridRegion(
    'achievements',
    3,  // rows
    4,  // cols
    50, // cell size
    { x: 50, y: 150 },
    ['checkbox', 'symbol'],
    { gap: 10 }
  )

  // Freeform regions for special areas
  .addFreeformRegion(
    'special-zones',
    [
      // Circular bonus zones
      SheetBuilder.circle('bonus-1', 100, 400, 40, ['circle', 'fill']),
      SheetBuilder.circle('bonus-2', 200, 400, 40, ['circle', 'fill']),
      SheetBuilder.circle('bonus-3', 300, 400, 40, ['circle', 'fill']),

      // Rectangular score boxes
      SheetBuilder.rect('score-box-1', 400, 380, 80, 80, ['number']),
      SheetBuilder.rect('score-box-2', 500, 380, 80, 80, ['number']),

      // Polygon-shaped regions
      SheetBuilder.polygon(
        'special-area',
        [
          { x: 100, y: 600 },
          { x: 250, y: 600 },
          { x: 200, y: 750 },
          { x: 150, y: 750 }
        ],
        ['fill', 'symbol']
      ),

      // Point hotspots (small targets)
      SheetBuilder.point('milestone-1', 400, 600, ['checkbox']),
      SheetBuilder.point('milestone-2', 500, 600, ['checkbox']),
      SheetBuilder.point('milestone-3', 600, 600, ['checkbox'])
    ]
  )

  // Large grid for main game area
  .addGridRegion(
    'main-grid',
    5,  // rows
    8,  // cols
    70, // cell size
    { x: 50, y: 800 },
    ['checkbox', 'number', 'fill', 'symbol'],
    { gap: 3 }
  )

  .build();
