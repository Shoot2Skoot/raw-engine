// examples/01-simple-grid.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F0F0F0')
  .addGridRegion(
    'upper-section',
    6,  // rows
    1,  // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number']
  )
  .addGridRegion(
    'lower-section',
    7,  // rows
    1,  // cols
    80, // cell size
    { x: 50, y: 600 },
    ['number']
  )
  .build();
