import * as gamepad from "./gamepad.js";

const arrowKeys = {
  'ArrowUp':    0x01,
  'ArrowDown':  0x02, 
  'ArrowLeft':  0x04, 
  'ArrowRight': 0x08,
};

let buttonActions = null;
let keysPressed = 0x00;
export function initializeControls(psy) {
  buttonActions = [
    () => {
      const newValue = psy.updateBaseLevel();
      base.textContent = newValue;
    },
    () => {
      const newValue = psy.updateBufferLength();
      buffer.textContent = newValue;
    },
    () => {
      const newValue = psy.updateSymmetry();
      symmetry.textContent = newValue;
    },
    () => {
      const newValue = psy.updateSmoothingDelay();
      delay.textContent = newValue;
    },
    () => {
      const newValue = psy.updatePattern();
      pattern.textContent = newValue;
    },
    () => {
      const newValue = psy.pausePlay();
      demo.textContent = (newValue) ? "On" : "Off";
    },
  ];

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
      buttonActions[0]();
      return;
    }
    if (keyName == 'b') {
      event.preventDefault();
      event.stopPropagation();
      buttonActions[1]();
      return;
    }
    if (keyName == 'x') {
      event.preventDefault();
      event.stopPropagation();
      buttonActions[2]();
      return;
    }
    if (keyName == 'y') {
      event.preventDefault();
      event.stopPropagation();
      buttonActions[3]();
      return;
    }
    if (keyName == 'p') {
      event.preventDefault();
      event.stopPropagation();
      buttonActions[4]();
      return;
    }
    if (keyName == ' ' || keyName == 'o') {
      event.preventDefault();
      event.stopPropagation();
      buttonActions[5]();
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
}

export function getGamepadButtons() {
  gamepad.getButtons(buttonActions);
}

export function getGamepadMovements(addMovements) {
  let keys_array = gamepad.getMovement();
  keys_array.forEach(k => {
    addMovements(k);
  });
}


