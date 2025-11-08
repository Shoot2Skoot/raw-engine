// examples/simple-grid.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const simpleGridSheet = SheetBuilder.create('simple-grid')
  .name('Simple Grid Demo')
  .size(600, 600)
  .backgroundColor('#FFFFFF')
  .addGridRegion(
    'main-grid',
    5, // rows
    5, // cols
    100, // cell size
    { x: 50, y: 50 },
    ['number', 'fill', 'checkbox', 'circle', 'symbol']
  )
  .build();
