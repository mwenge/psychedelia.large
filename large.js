import {psychedelia} from "./src/psychedelia.js";

const arrowKeys = {
  'ArrowUp':    0x01,
  'ArrowDown':  0x02, 
  'ArrowLeft':  0x04, 
  'ArrowRight': 0x08,
};

const NUM_COLS = Math.floor(visualViewport.width*0.6);
const NUM_ROWS = Math.floor(visualViewport.height*0.7);
const SCALE_FACTOR = 1;
const DEMO_MODE = false;
const ARRAY_SIZE = 0xFFF;
const BUFFER_LENGTH = 0x780;

let psy = largePsychedelia();
symmetry.textContent = psy.updateSymmetry();
pattern.textContent = psy.updatePattern();
delay.textContent = psy.updateSmoothingDelay();
buffer.textContent = psy.updateBufferLength();
demo.textContent = (psy.pausePlay()) ? "On" : "Off";


let keysPressed = 0x00;
document.body.addEventListener('keyup', (event) => {
  if (!event.repeat && arrowKeys[event.key]) {
    keysPressed = keysPressed ^ arrowKeys[event.key];
  }
});

document.body.addEventListener('keydown', (event) => {
  const keyName = event.key;
  if (keyName == 'a') {
    event.preventDefault();
    event.stopPropagation();
    const newValue = psy.updateBaseLevel();
    base.textContent = newValue;
    return;
  }
  if (keyName == 'b') {
    event.preventDefault();
    event.stopPropagation();
    const newValue = psy.updateBufferLength();
    buffer.textContent = newValue;
    return;
  }
  if (keyName == 's') {
    event.preventDefault();
    event.stopPropagation();
    const newValue = psy.updateSymmetry();
    symmetry.textContent = newValue;
    return;
  }
  if (keyName == 'd') {
    event.preventDefault();
    event.stopPropagation();
    const newValue = psy.updateSmoothingDelay();
    delay.textContent = newValue;
    return;
  }
  if (keyName == 'p') {
    event.preventDefault();
    event.stopPropagation();
    const newValue = psy.updatePattern();
    pattern.textContent = newValue;
    return;
  }
  if (keyName == ' ' || keyName == 'o') {
    event.preventDefault();
    event.stopPropagation();
    const newValue = psy.pausePlay();
    demo.textContent = (newValue) ? "On" : "Off";
    return;
  }

  if (!arrowKeys[keyName]) {
    return
  }

  event.preventDefault();
  event.stopPropagation();
  keysPressed = keysPressed | arrowKeys[keyName];
  psy.addMovements(keysPressed);
});

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
  return psychedelia(NUM_COLS, NUM_ROWS, SCALE_FACTOR, c.updateCanvas, c.updateImage, c.clearCanvas, DEMO_MODE, ARRAY_SIZE, BUFFER_LENGTH);
}

