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
    noStroke();
    fill("green");
    circle(this.x, this.y, 15);
  }
  
  move() {
    for (let i = 0; i < pathPoints.length; i++) {
      if (this.x < pathPoints[i].x) {
        this.x += 1;
      }
      else if (this.y < pathPoints[i].y) {
        this.y += 1;
      }
      else if (this.x > pathPoints[i].x) {
        this.x -= 1;
      }
      else if (this.y > pathPoints[i].y) {
        this.y -= 1;
      }
    }
  }
}

let pathPoints = [
  {x: 40, y: 0},
  {x: 40, y: 400},
  {x: 500, y: 400},
  {x: 500, y: 600},
  {x: 800, y: 600},
  {x: 800, y: 200},
  {x: 1000, y: 200}
];

let enemies = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let n = 0; n < 10; n ++) {
    let aEnemy = new Enemy(pathPoints[0].x, pathPoints[0].y);
    enemies.push(aEnemy);
  }
}

function draw() {
  background(220);
  generatePath();
  for (let enemy of enemies) {  
    enemy.move();  
    enemy.display();
  }
}

function generatePath() {
  stroke("black");
  strokeWeight(50);
  for (let i = 0; i < 6; i++) {
    line(pathPoints[i].x, pathPoints[i].y, pathPoints[i+1].x, pathPoints[i+1].y);
  }
}

