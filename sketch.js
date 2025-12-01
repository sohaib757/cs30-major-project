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
    this.nextPointIndex = 1;
  }
  
  display() {
    noStroke();
    fill("green");
    circle(this.x, this.y, this.radius * 2);
  }
  
  move() {
    if (this.nextPointIndex < pathPoints.length) {
      let nextPoint = pathPoints[this.nextPointIndex];
      if (this.x < nextPoint.x) {
        this.x += this.speed;
      }
      else if (this.x > nextPoint.x) {
        this.x -= this.speed;
      }
      if (this.y > nextPoint.y) {
        this.y -= this.speed;
      }
      else if (this.y < nextPoint.y) {
        this.y += this.speed;
      }
      if (this.x === nextPoint.x && this.y === nextPoint.y) {
        this.nextPointIndex += 1;
      }
    }
  }
}

class Tower {
  constructor(x,y) {
    
  }
}

let pathPoints = [
  {x: 40, y: 0},
  {x: 40, y: 400},
  {x: 500, y: 400},
  {x: 500, y: 600},
  {x: 800, y: 600},
  {x: 800, y: 200},
  {x: 1000, y: 200},
  {x: 1000, y: 500},
  {x: 1500, y: 500}
];

let lastSpawned = 0;
let spawnDuration = 1000;
let enemies = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  generatePath();
  if (millis() > lastSpawned + spawnDuration && enemies.length < 5) {
    let aEnemy = new Enemy(pathPoints[0].x, pathPoints[0].y);
    enemies.push(aEnemy);
    lastSpawned = millis();
  }
  for (let enemy of enemies) {  
    enemy.move();  
    enemy.display();
  }
}

function generatePath() {
  stroke("black");
  strokeWeight(60);
  for (let i = 0; i < 8; i++) {
    line(pathPoints[i].x, pathPoints[i].y, pathPoints[i+1].x, pathPoints[i+1].y);
  }
}

