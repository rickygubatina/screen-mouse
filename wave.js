// Move the mouse across the screen as a sine wave.
const robot = require("robotjs");

// Speed up the mouse.
robot.setMouseDelay(2);

const twoPI = Math.PI * 2.0;
const screenSize = robot.getScreenSize();
const mid_y = screenSize.height / 2;
const mid_x = screenSize.width / 2;
const radius = screenSize.height * .25;
const n = Math.round(5 * Math.random()) + 1;
const step = 0.005 / n;
const timeout = 5000 * 12 * 5;
let end = false;

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function monitor() {
  if (!end) {
    return true;
  }
  await delay(1000);
  let mousePrev = robot.getMousePos();
  if (mousePrev.x == 0 || mousePrev.y == 0) {
    return false;
  }
  while (true) {
    await delay(timeout);
    const mouseNext = robot.getMousePos();
    if (mousePrev.x == mouseNext.x && mousePrev.y == mouseNext.y) {
      break;
    }
    mousePrev = mouseNext;
  }
  return mousePrev.x != 0 && mousePrev.y != 0;
}

function angularMotion() {
  let expire = new Date().getTime() + timeout;
  while (!end) {
    for (let angle = 0; angle < twoPI && !end; angle += step) {
      const dr = radius * Math.sin(n * angle);
      const x = Math.round(dr * Math.cos(angle) + mid_x);
      const y = Math.round(dr * Math.sin(angle) + mid_y);
      robot.moveMouse(x, y);
      const mouse = robot.getMousePos();
      if (mouse.x != x && mouse.y != y) {
        end = true;
      }
      if (new Date().getTime() > expire) {
        break;
      }
    }
    if (new Date().getTime() > expire) {
      break;
    }
  }
}

function getDirection(curr_x, curr_y) {
  const d = Math.round(Math.random() * radius);
  const direction = Math.round(Math.random() * 3);
  let x = 0;
  let y = 0;
  switch (direction) {
    case 0:
      x = (curr_x > mid_x + radius) ? -1 : 1;
      break;
    case 1:
      y = (curr_y > mid_y + radius) ? -1 : 1
      break;
    case 2:
      x = (curr_x < mid_x - radius) ? 1 : -1;
      break;
    case 3:
      y = (curr_y < mid_y - radius) ? 1 : -1;
      break;
  }
  return { x, y, d };
}

async function gridMotion() {
  let expire = new Date().getTime() + timeout;
  let curr_x = robot.getMousePos().x;
  let curr_y = robot.getMousePos().y;
  while (!end) {
    const vector = getDirection(curr_x, curr_y);
    for (let i = 0; i < vector.d && !end; i++) {
      curr_x += vector.x;
      curr_y += vector.y;
      robot.moveMouse(curr_x, curr_y);
      const mouse = robot.getMousePos();
      if (mouse.x != curr_x && mouse.y != curr_y) {
        end = true;
      }
    }
    if (new Date().getTime() > expire) {
      break;
    }
  }
}

async function run() {
  do {
    end = false;
    gridMotion();
    angularMotion();
  }
  while (await monitor())
}

run();
