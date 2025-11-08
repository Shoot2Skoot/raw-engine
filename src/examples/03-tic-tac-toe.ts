// examples/03-tic-tac-toe.ts

import { SheetBuilder } from '../builders/SheetBuilder';
import type { MarkType } from '../engine/types';

// Simple Tic-Tac-Toe game sheet
export const ticTacToeSheet = SheetBuilder.create('tic-tac-toe')
  .name('Tic-Tac-Toe')
  .size(400, 400)
  .backgroundColor('#F3F4F6')
  .addGridRegion(
    'board',
    3,  // rows
    3,  // cols
    100, // cell size
    { x: 50, y: 50 },
    ['symbol', 'text'] as MarkType[],
    5   // gap
  )
  .build();
