// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  
  display() {
    circle(this.x, this.y, 15);
  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  generatePath();
}

function generatePath() {
  for (let i = 20; i < 40; i++) {
    line(i, 0, i, height/2);
  }
  for (let i = 20; i < width/2; i++) {
    line(i, height/2, i, height/2 + 20);
  }
  for (let i = width/2; i < width/2 + 20; i++) {
    line(i, height/2 - 20 + 20, i, height);
  }
}
