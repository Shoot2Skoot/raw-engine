// examples/yahtzee-sheet.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F5F5DC')
  .addGridRegion(
    'upper-section',
    6, // rows: Aces, Twos, Threes, Fours, Fives, Sixes
    1, // cols
    80, // cell size
    { x: 160, y: 50 },
    ['number']
  )
  .addGridRegion(
    'lower-section',
    7, // rows: 3 of kind, 4 of kind, Full house, Small straight, Large straight, Yahtzee, Chance
    1, // cols
    80, // cell size
    { x: 160, y: 550 },
    ['number']
  )
  .build();
