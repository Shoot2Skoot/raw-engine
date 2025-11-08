// examples/demo-sheet.ts

import { SheetBuilder } from '../builders/SheetBuilder';

/**
 * Demo Sheet - Showcases all mark types and features
 */
export const demoSheet = SheetBuilder.create('demo')
  .name('Feature Demo')
  .size(900, 700)
  .backgroundColor('#F8F9FA')
  .addGridRegion(
    'numbers',
    3,  // rows
    3,  // cols
    80, // cell size
    { x: 50, y: 50 },
    ['number'],
    8  // gap
  )
  .addGridRegion(
    'checkboxes',
    2,  // rows
    4,  // cols
    60, // cell size
    { x: 400, y: 50 },
    ['checkbox'],
    8  // gap
  )
  .addGridRegion(
    'circles',
    2,  // rows
    3,  // cols
    60, // cell size
    { x: 50, y: 350 },
    ['circle'],
    8  // gap
  )
  .addFreeformRegion(
    'fills-and-symbols',
    [
      // Color fill area
      ...Array.from({ length: 8 }, (_, i) => ({
        id: `fill-${i}`,
        shape: 'rect' as const,
        position: { x: 400 + (i % 4) * 70, y: 350 + Math.floor(i / 4) * 70 },
        size: { width: 60, height: 60 },
        allowedMarkTypes: ['fill' as const],
        maxMarks: 1
      })),
      // Symbol area
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `symbol-${i}`,
        shape: 'circle' as const,
        position: { x: 730 + (i % 2) * 70, y: 50 + Math.floor(i / 2) * 70 },
        radius: 25,
        allowedMarkTypes: ['symbol' as const],
        maxMarks: 1
      }))
    ]
  )
  .build();
