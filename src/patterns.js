//  The pattern data structure consists of up to 7 rows, each
//  one defining a stage in the creation of the pattern. Each
//  row is assigned a unique color. The X and Y positions given
//  in each array refer to the position relative to the cursor
//  at the centre. 'Minus' values relative to the cursor are
//  given by values such as FF (-1), FE (-2), and so on.
// 
//  In this illustration the number used represents which row
//  the 'pixel' comes from. So for example the first row
//  in starOneXPosArray and starOneYPosArray 
//  draws the square of 0s at the centre of the star.
// 

import * as mandelbrot from './patterns/mandelbrot.js'
import * as paisley from './patterns/paisley.js'
import * as mistake from './patterns/mistake.js'
import * as julia from './patterns/julia.js'
import * as sheep from './patterns/sheep.js'
import * as psy from './patterns/psych.js'
import * as bull from './patterns/bull.js'
export const patterns = [
  [mandelbrot.xArray, mandelbrot.yArray],
  [mistake.xArray, mistake.yArray],
  [julia.xArray, julia.yArray],
  [sheep.xArray, sheep.yArray],
  [psy.xArray, psy.yArray],
  [bull.xArray, bull.yArray],
  [mistake.xArray, mistake.yArray],
];
export const names = [
  'Mandelbrot',
  'Mistake',
  'Julia',
  'Sheep',
  'Psych',
  'Bull',
  'Mistake',
];
