import { SheetBuilder } from '../builders/SheetBuilder';

export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#F5F5DC')
  .addGridRegion(
    'upper-section',
    6,  // rows (Ones, Twos, Threes, Fours, Fives, Sixes)
    1,  // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number'],
    { gap: 5 }
  )
  .addGridRegion(
    'lower-section',
    7,  // rows (3 of kind, 4 of kind, Full House, Sm Straight, Lg Straight, Yahtzee, Chance)
    1,  // cols
    80, // cell size
    { x: 50, y: 600 },
    ['number'],
    { gap: 5 }
  )
  .build();
