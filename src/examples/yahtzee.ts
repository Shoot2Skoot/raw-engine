// examples/yahtzee.ts - Simple grid example (Yahtzee-style)

import { SheetBuilder } from '../builders/SheetBuilder';

export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F8F9FA')
  .addGridRegion(
    'upper-section',
    6, // rows: Ones, Twos, Threes, Fours, Fives, Sixes
    1, // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number']
  )
  .addGridRegion(
    'lower-section',
    7, // rows: 3 of a kind, 4 of a kind, Full House, Small Straight, Large Straight, Yahtzee, Chance
    1, // cols
    80, // cell size
    { x: 50, y: 600 },
    ['number']
  )
  .build();
