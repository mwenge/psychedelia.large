import * as pattern from "./patterns.js";
import * as c from './constants.js'

export function psychedelia(NUM_COLS, NUM_ROWS, SCALE_FACTOR, updateCanvas, updateImage, clearCanvas, DEMO_MODE = false,
                            ARRAY_SIZE = 64, BUFFER_LENGTH = 0x1F) {

  const COLOR_MAX = 0x07;
  const MAX_ELEMENTS = 100;

  let directionX = 0;
  let directionY = 0;

  let cursorXPosition = 20;
  let cursorYPosition = 10;
  let currentXPosArray,currentYPosArray;

  const MAX_SMOOTHING_DELAY = 0x0F;
  let smoothingDelay = 0x0c;
  let currentSymmetrySettingForStep = 0x02;
  let currentPatternIndex = 0x00;
  let baseLevel = COLOR_MAX;

  let pixelXPositionArray = new Array(ARRAY_SIZE).fill(0); 
  let pixelYPositionArray = new Array(ARRAY_SIZE).fill(0); 
  let baseLevelArray = new Array(ARRAY_SIZE).fill(0);
  const initialFramesRemainingToNextPaintForStep  = new Array(ARRAY_SIZE).fill(MAX_SMOOTHING_DELAY);
  let framesRemainingToNextPaintForStep  = new Array(ARRAY_SIZE).fill(0);
                                                                
  const presetColorValuesArray = [c.BLACK,c.BLUE,c.RED,c.PURPLE,c.GREEN,c.CYAN,c.YELLOW,c.WHITE];

  let pixel_matrix = new Array(NUM_COLS * NUM_ROWS).fill(0);

  let currentColorScheme = c.updateColorScheme();

  function paintPixel(pixelXPos, pixelYPos, baseLevelForCurrentPixel) {
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

    let cx = baseLevelForCurrentPixel + 1;

    if (cx < indexOfCurrentColor) {
      return;
    }

    const newColor = presetColorValuesArray[baseLevelForCurrentPixel];
    pixel_matrix[x] = newColor;

    const rgba = currentColorScheme[newColor];
    const o = ((pixelYPos * SCALE_FACTOR) * (NUM_COLS * SCALE_FACTOR)) + (pixelXPos * SCALE_FACTOR);
    updateImage(o, rgba, pixelXPos, pixelYPos);
  }

  function PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, baseLevelForCurrentPixel) {
    paintPixel(pixelXPosition, pixelYPosition, baseLevelForCurrentPixel);

    if (!currentSymmetrySettingForStep) {
      return;
    }

    const symmPixelXPosition = NUM_COLS - pixelXPosition;
    paintPixel(symmPixelXPosition, pixelYPosition, baseLevelForCurrentPixel);

    if (currentSymmetrySettingForStep == 0x01) {
      return;
    }

    const symmPixelYPosition = NUM_ROWS - pixelYPosition;
    paintPixel(pixelXPosition, symmPixelYPosition, baseLevelForCurrentPixel);

    if (currentSymmetrySettingForStep == 0x02) {
      return;
    }

    paintPixel(symmPixelXPosition, symmPixelYPosition, baseLevelForCurrentPixel);
  }

  function LoopThroughPatternAndPaint(pixelXPosition, pixelYPosition, baseLevelForCurrentPixel) {
    PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, baseLevelForCurrentPixel);
    
    if (baseLevelForCurrentPixel == COLOR_MAX) {
      return;
    }

    let countToMatchCurrentIndex = Math.floor(currentXPosArray.length /9);

    const initialPixelXPosition = pixelXPosition;
    const initialPixelYPosition = pixelYPosition;

    let i = 0;
    while (true) {
      pixelXPosition = (initialPixelXPosition + currentXPosArray[i]) & ARRAY_SIZE;
      pixelYPosition = (initialPixelYPosition + currentYPosArray[i]) & ARRAY_SIZE;

      PaintPixelForCurrentSymmetry(pixelXPosition, pixelYPosition, baseLevelForCurrentPixel);

      i++;
      if (currentXPosArray[i] != 0x55) {
        continue;
      }

      countToMatchCurrentIndex--;
      if (countToMatchCurrentIndex == baseLevelForCurrentPixel) {
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
    while (true) {
      runs++;
      if (runs % Math.floor(BUFFER_LENGTH/8) == 0) {
        interruptHandler();
        continue;
      }
      currentIndexToPixelBuffers++;
      if (currentIndexToPixelBuffers >= BUFFER_LENGTH) {
        currentIndexToPixelBuffers = 0;
      }


      // Wait for this to hit zero before actually painting the pixels.
      framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] = --framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] & 0xFF;
      if (framesRemainingToNextPaintForStep[currentIndexToPixelBuffers]) {
        continue;
      }
      framesRemainingToNextPaintForStep[currentIndexToPixelBuffers] = initialFramesRemainingToNextPaintForStep[currentIndexToPixelBuffers];

      // Hitting 0xFF means we have decremented below zero for this phase.
      if (baseLevelArray[currentIndexToPixelBuffers] == 0xFF) {
        continue;
      }

      let baseLevelForCurrentPixel = baseLevelArray[currentIndexToPixelBuffers];

      let pixelXPosition = pixelXPositionArray[currentIndexToPixelBuffers];
      let pixelYPosition = pixelYPositionArray[currentIndexToPixelBuffers];

      LoopThroughPatternAndPaint(pixelXPosition, pixelYPosition, baseLevelForCurrentPixel);

      baseLevelArray[currentIndexToPixelBuffers] = --baseLevelArray[currentIndexToPixelBuffers] & 0xFF;

      if (runs > BUFFER_LENGTH/2) {
        break;
      }
    }

    window.requestAnimationFrame(MainPaintLoop);
    updateCanvas();
  }

  let indexIntoArrays = 0;
  /*
   * Cycles through each of the first 32 bytes in the arrays.
   * Resets the array once it has cycle through all the colors.
   */
  function interruptHandler() {
    indexIntoArrays++;
    if (indexIntoArrays >= BUFFER_LENGTH) {
      indexIntoArrays = 0;
    }

    if (baseLevelArray[indexIntoArrays] != 0xFF) {
      return;
    }

    pixelXPositionArray[indexIntoArrays] = cursorXPosition;
    pixelYPositionArray[indexIntoArrays] = cursorYPosition;
    baseLevelArray[indexIntoArrays] = baseLevel;
    initialFramesRemainingToNextPaintForStep[indexIntoArrays] = smoothingDelay;
    framesRemainingToNextPaintForStep[indexIntoArrays] = smoothingDelay;

    if (DEMO_MODE) {
      randomCursorUpdate();
      return;
    }
    updateCursor();
  }

  function LaunchPsychedelia() {
    [currentXPosArray, currentYPosArray] = pattern.patterns[currentPatternIndex];
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

  /* Interface Functions */
  function updateBaseLevel() {
    const MAX_SETTINGS = 0x07;
    baseLevel++;
    if (baseLevel > MAX_SETTINGS) {
      baseLevel = 0x01;
    }
    return baseLevel;
  }

  function updateBufferLength() {
    const MAX_SETTINGS = 0xEFF;
    BUFFER_LENGTH += 0x80;
    if (BUFFER_LENGTH >= MAX_SETTINGS) {
      clearCanvas();
      BUFFER_LENGTH = 0x1FF;
    }
    return BUFFER_LENGTH;
  }

  function updateSymmetry() {
    const MAX_SETTINGS = 0x03;
    currentSymmetrySettingForStep = ++currentSymmetrySettingForStep & MAX_SETTINGS;
    if (!currentSymmetrySettingForStep) clearCanvas();
    return c.symmetries[currentSymmetrySettingForStep];
  }

  function updateSmoothingDelay() {
    smoothingDelay++;
    if (smoothingDelay > MAX_SMOOTHING_DELAY) smoothingDelay = 0x06;
    return smoothingDelay;
  }

  function updatePattern() {
    clearCanvas();
    const MAX_SETTINGS = 0x07;
    currentPatternIndex = ++currentPatternIndex & MAX_SETTINGS;
    [currentXPosArray, currentYPosArray] = pattern.patterns[currentPatternIndex];
    return pattern.names[currentPatternIndex];
  }

  function pausePlay() {
    DEMO_MODE = !DEMO_MODE;
    return DEMO_MODE;
  }

  const MOVES = 25;
  let xMovements = [];
  let yMovements = [];
  const movesUp = new Array(MOVES).fill(-1); 
  const movesDown = new Array(MOVES).fill(1); 
  const movesLeft = new Array(MOVES).fill(-1); 
  const movesRight = new Array(MOVES).fill(1); 
  function addMovements(keys) {
    if (keys & 0x01) {
      yMovements.push(...movesUp);
    }
    if (keys & 0x02) {
      yMovements.push(...movesDown);
    }
    if (keys & 0x04) {
      xMovements.push(...movesLeft);
    }
    if (keys & 0x08) {
      xMovements.push(...movesRight);
    }
  }

  function updateCursor() {
    if (xMovements.length) updateXPos(xMovements.pop());
    if (yMovements.length) updateYPos(yMovements.pop());
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
    updateSmoothingDelay: updateSmoothingDelay,
    updatePattern: updatePattern,
    addMovements: addMovements,
    updateBufferLength: updateBufferLength,
    updateBaseLevel: updateBaseLevel,
  };
}
