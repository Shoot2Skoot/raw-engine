// examples/simple-grid.ts

import { SheetBuilder } from '../builders/SheetBuilder';

/**
 * Example 1: Simple Grid (Yahtzee-style)
 * A basic score sheet with two grids for upper and lower sections
 */
export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 900)
  .backgroundColor('#F0F0F0')
  .addGridRegion(
    'upper-section',
    6,  // rows
    1,  // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number'],
    4  // gap
  )
  .addGridRegion(
    'lower-section',
    7,  // rows
    1,  // cols
    80, // cell size
    { x: 50, y: 600 },
    ['number'],
    4  // gap
  )
  .build();
