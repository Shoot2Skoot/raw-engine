import { SheetBuilder } from '../builders/SheetBuilder';

export const moonMissionSheet = SheetBuilder.create('moon-mission-1')
  .name('Mission 1: First Steps')
  .size(800, 1000)
  .backgroundColor('#1a1a2e')
  .addFreeformRegion('resources', [
    {
      id: 'water-1',
      shape: 'circle',
      position: { x: 120, y: 80 },
      radius: 25,
      allowedMarkTypes: ['checkbox'],
      maxMarks: 1
    },
    {
      id: 'water-2',
      shape: 'circle',
      position: { x: 180, y: 80 },
      radius: 25,
      allowedMarkTypes: ['checkbox'],
      maxMarks: 1
    },
    {
      id: 'water-3',
      shape: 'circle',
      position: { x: 240, y: 80 },
      radius: 25,
      allowedMarkTypes: ['checkbox'],
      maxMarks: 1
    },
    {
      id: 'energy-track',
      shape: 'rect',
      position: { x: 100, y: 150 },
      size: { width: 150, height: 50 },
      allowedMarkTypes: ['number'],
      maxMarks: 1
    }
  ])
  .addGridRegion(
    'planet-grid',
    3,  // rows
    3,  // cols
    60, // cell size
    { x: 300, y: 300 },
    ['fill', 'symbol'],
    { gap: 10 }
  )
  .build();
