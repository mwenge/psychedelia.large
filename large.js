import {psychedelia} from "./src/psychedelia.js";

const NUM_COLS = 0x3FF;
const NUM_ROWS = 0x2FF;
const SCALE_FACTOR = 1;
const DEMO_MODE = false;
const ARRAY_SIZE = 0xFFF;
const MAX_INDEX_VALUE = 0x7FF;

let psy = largePsychedelia();
symmetry.textContent = psy.updateSymmetry();
pattern.textContent = psy.updatePattern();
delay.textContent = psy.updateSmoothingDelay();
demo.textContent = (psy.pausePlay()) ? "On" : "Off";

document.body.addEventListener('keydown', (event) => {
  const keyName = event.key;
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

  if (keyName == 'ArrowUp') {
    event.preventDefault();
    event.stopPropagation();
    psy.moveUp();
    return;
  }

  if (keyName == 'ArrowDown') {
    event.preventDefault();
    event.stopPropagation();
    psy.moveDown();
    return;
  }

  if (keyName == 'ArrowLeft') {
    event.preventDefault();
    event.stopPropagation();
    psy.moveLeft();
    return;
  }

  if (keyName == 'ArrowRight') {
    event.preventDefault();
    event.stopPropagation();
    psy.moveRight();
    return;
  }

});

container.addEventListener('click', pressPausePlay);
function pressPausePlay() {
  let playing = psy.pausePlay();
  pausePlay.innerHTML = (playing) ? "⏸":"▶" 
}

function createCanvas() {
  function updateImage(o, rgba, pixelXPos, pixelYPos) {
    for (var i=0; i<4; i++) {
      imageData.data[(o*4)+i] = rgba[i];
    }
  }
  function updateCanvas(fx,fy,tx,ty) {
    bufferCtx.putImageData(imageData,0,0);
    ctx.drawImage(bufferCanvas,0,0);
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


  return {canvas: canvas, updateImage: updateImage, updateCanvas: updateCanvas};
}

function largePsychedelia() {
  let c = createCanvas();
  container.appendChild(c.canvas);
  return psychedelia(NUM_COLS, NUM_ROWS, SCALE_FACTOR, c.updateCanvas, c.updateImage, DEMO_MODE, ARRAY_SIZE, MAX_INDEX_VALUE);
}
