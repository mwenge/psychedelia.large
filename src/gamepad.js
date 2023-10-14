const haveEvents = "ongamepadconnected" in window;
const controllers = {};

function connecthandler(e) {
  addgamepad(e.gamepad);
}

function addgamepad(gamepad) {
  controllers[gamepad.index] = gamepad;
}

function disconnecthandler(e) {
  removegamepad(e.gamepad);
}

function removegamepad(gamepad) {
  delete controllers[gamepad.index];
}

let prev_buttons = [];
export function getButtons(buttonActions) {
  if (!haveEvents) {
    scangamepads();
  }
  let control = controllers[0];
  if (!control) return;
  for (var i = 0; i < 5; i++) {
    if (control.buttons[i].touched && (!prev_buttons.length || !prev_buttons[i].touched)) {
      buttonActions[i]();
    }
  }
  prev_buttons = control.buttons;
}

export function getMovement() {
  if (!haveEvents) {
    scangamepads();
  }

  let keys_array = [];
  Object.entries(controllers).forEach(([i, controller]) => {
    let keys = 0x00;
    let x = controller.axes[2];
    if (x < -0.5) keys |= 0x04;
    else if (x > 0.5) keys |= 0x08;

    let y = controller.axes[3];
    if (y < -0.5) keys |= 0x01;
    else if (y > 0.5) keys |= 0x02;

    keys_array.push(keys);

  });
  return keys_array;
}

function scangamepads() {
  const gamepads = navigator.getGamepads();
  for (const gamepad of gamepads) {
    if (!gamepad) {
      continue;
    }
    // Can be null if disconnected during the session
    if (gamepad.index in controllers) {
      controllers[gamepad.index] = gamepad;
    } else {
      addgamepad(gamepad);
    }
  }
}

window.addEventListener("gamepadconnected", connecthandler);
window.addEventListener("gamepaddisconnected", disconnecthandler);

if (!haveEvents) {
  setInterval(scangamepads, 500);
}

