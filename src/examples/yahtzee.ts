// examples/yahtzee.ts

import { SheetBuilder } from '../builders/SheetBuilder';

export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F0F0F0')
  .addGridRegion(
    'upper-section',
    6,  // rows (Aces, Twos, Threes, Fours, Fives, Sixes)
    1,  // cols
    80, // cell size
    { x: 160, y: 50 },
    ['number']
  )
  .addGridRegion(
    'lower-section',
    7,  // rows (3 of kind, 4 of kind, Full House, Sm Straight, Lg Straight, Yahtzee, Chance)
    1,  // cols
    80, // cell size
    { x: 160, y: 600 },
    ['number']
  )
  .build();
