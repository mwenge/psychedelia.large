import {psychedelia} from "./src/psychedelia.js";
import * as controls from "./src/controls.js";

const NUM_COLS = Math.floor(visualViewport.width*0.6);
const NUM_ROWS = Math.floor(visualViewport.height*0.7);
const SCALE_FACTOR = 1;
const DEMO_MODE = false;
const ARRAY_SIZE = 0xFFF;
const BUFFER_LENGTH = 0x780;

let psy = largePsychedelia();
controls.initializeControls(psy);

symmetry.textContent = psy.updateSymmetry();
pattern.textContent = psy.updatePattern();
delay.textContent = psy.updateSmoothingDelay();
buffer.textContent = psy.updateBufferLength();
demo.textContent = (psy.pausePlay()) ? "On" : "Off";

function createCanvas() {
  function updateImage(o, rgba, pixelXPos, pixelYPos) {
    for (var i=0; i<4; i++) {
      imageData.data[(o*4)+i] = rgba[i];
    }
  }
  function updateCanvas() {
    bufferCtx.putImageData(imageData,0,0);
    ctx.drawImage(bufferCanvas,0,0);
  }
  function clearCanvas() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    imageData = bufferCtx.createImageData(NUM_COLS * SCALE_FACTOR, NUM_ROWS * SCALE_FACTOR);
  }
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = NUM_COLS * SCALE_FACTOR;
  canvas.height = NUM_ROWS * SCALE_FACTOR;

  const bufferCanvas = document.createElement("canvas");
  const bufferCtx = bufferCanvas.getContext("2d");
  bufferCanvas.width = NUM_COLS * SCALE_FACTOR;
  bufferCanvas.height = NUM_ROWS * SCALE_FACTOR;

  const imgData = new Uint8ClampedArray(new Array(NUM_COLS * SCALE_FACTOR * NUM_ROWS * SCALE_FACTOR)
    .fill(0).map(x => [0,0,0,255]).flat());
  let imageData = new ImageData(imgData, NUM_COLS * SCALE_FACTOR, NUM_ROWS * SCALE_FACTOR);

  return {canvas: canvas, updateImage: updateImage, updateCanvas: updateCanvas, clearCanvas: clearCanvas};
}

function largePsychedelia() {
  let c = createCanvas();
  container.appendChild(c.canvas);
  return psychedelia(NUM_COLS, NUM_ROWS, SCALE_FACTOR, c.updateCanvas, c.updateImage, c.clearCanvas, controls.getGamepadMovements,
    controls.getGamepadButtons, DEMO_MODE, ARRAY_SIZE, BUFFER_LENGTH);
}

