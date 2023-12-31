import {patterns} from "./patterns.js";
import * as c from './constants.js'

export function psychedelia(NUM_COLS, NUM_ROWS, SCALE_FACTOR, updateCanvas, updateImage, DEMO_MODE = false,
                            ARRAY_SIZE = 64, MAX_INDEX_VALUE = 0x1F) {

  const COLOR_MAX = 0x07;
  const MAX_ELEMENTS = 100;

  let cursorXPosition = 20;
  let cursorYPosition = 10;
  let currentXPosArray,currentYPosArray;

  let flushRemaining = 0;

  let smoothingDelay = 0x0c;
  let currentSymmetrySettingForStep = 0x03;

  let pixelXPositionArray = new Array(ARRAY_SIZE).fill(0); 
  let pixelYPositionArray = new Array(ARRAY_SIZE).fill(0); 
  let currentColorIndexArray = new Array(ARRAY_SIZE).fill(0);
  const initialFramesRemainingToNextPaintForStep  = new Array(ARRAY_SIZE).fill(smoothingDelay);
  let framesRemainingToNextPaintForStep  = new Array(ARRAY_SIZE).fill(0);
                                                                
  const presetColorValuesArray = [c.BLACK,c.BLUE,c.RED,c.PURPLE,c.GREEN,c.CYAN,c.YELLOW,c.WHITE];

  let pixel_matrix = new Array(NUM_COLS * NUM_ROWS).fill(0);

  let currentColorScheme = c.updateColorScheme();

  function paintPixel(pixelXPos, pixelYPos, colorIndexForCurrentPixel) {
    if (pixelXPos < 0) {
      return;
    }
    if (pixelXPos >= NUM_COLS) {
      return;
    }
    if (pixelYPos < 0) {
      return;
    }
    if (pixelYPos >= NUM_ROWS) {
      return;
    }

    const x = (pixelYPos * NUM_COLS) + pixelXPos;
    const currentColorForPixel = pixel_matrix[x] & COLOR_MAX;

    const indexOfCurrentColor = presetColorValuesArray.indexOf(currentColorForPixel);

    let cx = colorIndexForCurrentPixel + 1;

    if (cx < indexOfCurrentColor) {
      return;
    }

    const newColor = presetColorValuesArray[colorIndexForCurrentPixel];
    pixel_matrix[x] = newColor;

    const rgba = currentColorScheme[newColor];
    const o = ((pixelYPos * SCALE_FACTOR) * (NUM_COLS * SCALE_FACTOR)) + (pixelXPos * SCALE_FACTOR);
    updateImage(o, rgba, pixelXPos, pixelYPos);
  }

  function PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel) {
    paintPixel(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel);
    let flush = flushRemaining && (flushRemaining < currentIndexToPixelBuffers);

    if (!currentSymmetrySettingForStep && !flush) {
      return;
    }

    const symmPixelXPosition = NUM_COLS - pixelXPosition;
    paintPixel(symmPixelXPosition, pixelYPosition, colorIndexForCurrentPixel);

    if (currentSymmetrySettingForStep == 0x01 && !flush) {
      return;
    }

    const symmPixelYPosition = NUM_ROWS - pixelYPosition;
    paintPixel(pixelXPosition, symmPixelYPosition, colorIndexForCurrentPixel);

    if (currentSymmetrySettingForStep == 0x02 && !flush) {
      return;
    }

    paintPixel(symmPixelXPosition, symmPixelYPosition, colorIndexForCurrentPixel);
  }

  function LoopThroughPatternAndPaint(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel) {
    PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel);
    
    if (colorIndexForCurrentPixel == COLOR_MAX) {
      return;
    }

    let countToMatchCurrentIndex = Math.floor(currentXPosArray.length /9);

    const initialPixelXPosition = pixelXPosition;
    const initialPixelYPosition = pixelYPosition;

    let i = 0;
    while (true) {
      pixelXPosition = (initialPixelXPosition + currentXPosArray[i]) & ARRAY_SIZE;
      pixelYPosition = (initialPixelYPosition + currentYPosArray[i]) & ARRAY_SIZE;

      PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel);

      i++;
      if (currentXPosArray[i] != 0x55) {
        continue;
      }

      countToMatchCurrentIndex--;
      if (countToMatchCurrentIndex == colorIndexForCurrentPixel) {
        break;
      }
      if (countToMatchCurrentIndex == 0x01) {
        break;
      }

      i++;
    }
    pixelXPosition = initialPixelXPosition;
    pixelYPosition = initialPixelYPosition;

  }

  let currentIndexToPixelBuffers = 0x00;
  function MainPaintLoop(timeStamp) {
    let runs = 0;
    let [minPixelX, maxPixelX, minPixelY, maxPixelY] = [0xFFFF,0,0xFFFF,0];
    while (true) {
      runs++;
      if (runs % Math.floor(MAX_INDEX_VALUE/6) == 0) {
        interruptHandler();
        continue;
      }
      currentIndexToPixelBuffers = ++currentIndexToPixelBuffers & MAX_INDEX_VALUE;


      // Wait for this to hit zero before actually painting the pixels.
      framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] = --framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] & 0xFF;
      if (framesRemainingToNextPaintForStep[currentIndexToPixelBuffers]) {
        continue;
      }
      framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] = initialFramesRemainingToNextPaintForStep[currentIndexToPixelBuffers];

      // Hitting 0xFF means we have decremented below zero for this phase.
      if (currentColorIndexArray[currentIndexToPixelBuffers] == 0xFF) {
        continue;
      }

      let colorIndexForCurrentPixel = currentColorIndexArray[currentIndexToPixelBuffers];
      if (!currentIndexToPixelBuffers && !colorIndexForCurrentPixel) {
        flushRemaining = 0;
        console.log({currentIndexToPixelBuffers});
      }
      let pixelXPosition = pixelXPositionArray[currentIndexToPixelBuffers];
      let pixelYPosition = pixelYPositionArray[currentIndexToPixelBuffers];
      minPixelX = Math.min(pixelXPosition, minPixelX);
      minPixelY = Math.min(pixelYPosition, minPixelY);
      maxPixelX = Math.max(pixelXPosition, maxPixelX);
      maxPixelY = Math.max(pixelYPosition, maxPixelY);

      LoopThroughPatternAndPaint(pixelXPosition, pixelYPosition, colorIndexForCurrentPixel);

      currentColorIndexArray[currentIndexToPixelBuffers] = --currentColorIndexArray[currentIndexToPixelBuffers] & 0xFF;

      if (runs > MAX_INDEX_VALUE/2) {
        break;
      }
    }

    // Randomly change the pattern every now and then.
    if(Math.floor(Math.random() * (500 + 1)) == 0) {
      let pi = Math.floor(Math.random() * ((patterns.length-1) + 1));
      [currentXPosArray, currentYPosArray] = patterns[pi];
    }

    if (DEMO_MODE) {
      window.requestAnimationFrame(MainPaintLoop);
    }
    updateCanvas(minPixelX, maxPixelX, minPixelY, maxPixelY);
  }

  let indexIntoArrays = 0;
  /*
   * Cycles through each of the first 32 bytes in the arrays.
   * Resets the array once it has cycle through all the colors.
   */
  function interruptHandler() {
    indexIntoArrays++;
    indexIntoArrays = indexIntoArrays & MAX_INDEX_VALUE;
    if (currentColorIndexArray[indexIntoArrays] != 0xFF) {
      return;
    }

    pixelXPositionArray[indexIntoArrays] = cursorXPosition;
    pixelYPositionArray[indexIntoArrays] = cursorYPosition;
    currentColorIndexArray[indexIntoArrays] = COLOR_MAX;
    initialFramesRemainingToNextPaintForStep[indexIntoArrays] = smoothingDelay;
    framesRemainingToNextPaintForStep[indexIntoArrays] = smoothingDelay;

    if (DEMO_MODE) randomCursorUpdate();
  }

  function LaunchPsychedelia() {
    [currentXPosArray, currentYPosArray] = patterns[0];
    window.requestAnimationFrame(MainPaintLoop);
  }

  LaunchPsychedelia();

  const oneOrZero = () => Math.floor(Math.random() * (1 - 0 + 1) + 0);
  const oneZeroOrMinusOne = () => Math.floor(Math.random() * (1 - -1 + 1) + -1);
  function nextRandomStep(cur) {
    if (cur && oneOrZero()) return cur;
    const next = oneZeroOrMinusOne();
    return next;
  }

  let randInterval = 0;
  let randX = 1, randY = 1;
  function randomCursorUpdate() {
    randInterval++;
    if (randInterval % 200 == 0) {
      randX = nextRandomStep(randX);
    }
    updateXPos(randX);
    if (randInterval % 350 == 0) {
      randY = nextRandomStep(randY);
      currentColorScheme = c.updateColorScheme();
    }
    updateYPos(randY);
  }

  /* Interface Function */
  function updateSymmetry() {
    const MAX_SETTINGS = 0x03;
    currentSymmetrySettingForStep = ++currentSymmetrySettingForStep & MAX_SETTINGS;
    flushRemaining = currentIndexToPixelBuffers;
  }

  function pausePlay() {
    DEMO_MODE = !DEMO_MODE;
    if (DEMO_MODE) {
      window.requestAnimationFrame(MainPaintLoop);
    }
    return DEMO_MODE;
  }

  function updateXPos(x) {
    cursorXPosition += x;
    if (cursorXPosition == NUM_COLS) {
      cursorXPosition = 0;
    }
    if (cursorXPosition < 0) {
      cursorXPosition = NUM_COLS;
    }
  }

  function updateYPos(y) {
    cursorYPosition += y;
    if (cursorYPosition == NUM_ROWS) {
      cursorYPosition = 0;
    }
    if (cursorYPosition < 0) {
      cursorYPosition = NUM_ROWS;
    }
  }


  return {
    updateXPos: updateXPos,
    updateYPos: updateYPos,
    pausePlay: pausePlay,
    updateSymmetry: updateSymmetry,
  };
}
