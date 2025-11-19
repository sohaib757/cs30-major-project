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

let pathPoints = [
  {x: 40, y: 0},
  {x: 40, y: 400},
];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  generatePath();
}

function generatePath() {
  strokeWeight(50);
  line(pathPoints[0].x, pathPoints[0].y, pathPoints[1].x, pathPoints[1].y);
}

