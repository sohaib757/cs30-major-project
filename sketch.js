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
    this.speed = 1;
    this.radius = 10;
  }
  
  display() {
    noStroke();
    fill("green");
    circle(this.x, this.y, this.radius * 2);
  }
  
  move() {
    for (let i = 0; i < pathPoints.length; i++) {
      let pathX = pathPoints[i].x;
      let pathY = pathPoints[i].y;
      if (this.x !== pathX || this.y !== pathY) {
        if (this.x < pathX) {
          this.x += this.speed;
        }
        else if (this.x > pathX) {
          this.x -= this.speed;
        }
        if (this.y > pathY) {
          this.y -= this.speed;
        }
        else if (this.y < pathY) {
          this.y += this.speed;
        }
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

