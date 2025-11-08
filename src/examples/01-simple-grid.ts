import { SheetBuilder } from '../builders/SheetBuilder';

// Simple Yahtzee-style grid sheet
export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(400, 700)
  .backgroundColor('#FFFEF0')
  .addGridRegion(
    'upper-section',
    6, // rows (Ones, Twos, Threes, Fours, Fives, Sixes)
    1, // cols
    80, // cell size
    { x: 50, y: 100 },
    ['number'],
    5 // gap
  )
  .addGridRegion(
    'lower-section',
    7, // rows (Three of a kind, Four of a kind, Full House, etc.)
    1, // cols
    80, // cell size
    { x: 50, y: 600 },
    ['number'],
    5 // gap
  )
  .build();
