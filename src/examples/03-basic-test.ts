import { SheetBuilder } from '../builders/SheetBuilder';

// Simple test sheet for quick demos
export const basicTestSheet = SheetBuilder.create('basic-test')
  .name('Basic Test Sheet')
  .size(600, 600)
  .backgroundColor('#FFFFFF')
  .addGridRegion(
    'main-grid',
    8, // rows
    8, // cols
    60, // cell size
    { x: 30, y: 30 },
    ['number', 'checkbox', 'fill', 'symbol', 'circle', 'pencil'],
    5 // gap
  )
  .build();
