/**
 * Example 1: Simple Grid (Yahtzee-style)
 * Demonstrates basic grid layout with number inputs
 */

import { SheetBuilder } from '../builders/SheetBuilder';

export const yahtzeeSheet = SheetBuilder.create('yahtzee')
  .name('Yahtzee Score Sheet')
  .size(500, 800)
  .backgroundColor('#F5F5F5')
  .addGridRegion(
    'upper-section',
    6,  // rows: Aces, Twos, Threes, Fours, Fives, Sixes
    1,  // cols
    60, // cell size
    { x: 150, y: 100 },
    ['number'],
    { gap: 5 }
  )
  .addGridRegion(
    'lower-section',
    7,  // rows: 3 of a kind, 4 of a kind, Full House, Small Straight, Large Straight, Yahtzee, Chance
    1,  // cols
    60, // cell size
    { x: 150, y: 500 },
    ['number'],
    { gap: 5 }
  )
  .build();

/**
 * Example: A more visual grid sheet
 */
export const ticTacToeSheet = SheetBuilder.create('tictactoe')
  .name('Tic Tac Toe')
  .size(400, 400)
  .backgroundColor('#FFFFFF')
  .addGridRegion(
    'board',
    3,  // rows
    3,  // cols
    120, // cell size
    { x: 20, y: 20 },
    ['symbol', 'text'],
    { gap: 5 }
  )
  .build();
