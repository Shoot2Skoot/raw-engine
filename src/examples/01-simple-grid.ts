import { SheetBuilder } from '../builders/SheetBuilder';

export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 800)
  .backgroundColor('#F5F5F0')
  .addGridRegion(
    'upper-section',
    6,  // rows (Ones, Twos, Threes, Fours, Fives, Sixes)
    1,  // cols
    80, // cell size
    { x: 100, y: 100 },
    ['number']
  )
  .addGridRegion(
    'lower-section',
    7,  // rows (3 of a kind, 4 of a kind, Full House, etc.)
    1,  // cols
    80, // cell size
    { x: 100, y: 600 },
    ['number']
  )
  .build();
