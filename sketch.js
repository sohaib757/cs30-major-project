// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const PATHS = 8;
const PATH_SIZE = 50;

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
    fill("red");
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
      if (this.y > nextPoint.y + PATH_SIZE/2) {
        this.y -= this.speed;
      }
      else if (this.y < nextPoint.y + PATH_SIZE/2) {
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
    this.x = x;
    this.y = y;
    this.radius = 20;
  }

  display() {
    noStroke();
    fill("blue");
    for (let i = 0; i < PATHS; i++) {
      if (pathPoints[i].x) {
        circle(this.x, this.y, this.radius * 2);
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
  {x: 1000, y: 200},
  {x: 1000, y: 500},
  {x: 1500, y: 500}
];

let canPlace;
let lastSpawned = 0;
let spawnDuration = 1000;
let enemies = [];
let towers = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  generatePath();
  for (let tower of towers) {
    tower.display();
  }
  if (millis() > lastSpawned + spawnDuration && enemies.length < 5) {
    let aEnemy = new Enemy(pathPoints[0].x + PATH_SIZE/2, pathPoints[0].y);
    enemies.push(aEnemy);
    lastSpawned = millis();
  }
  for (let enemy of enemies) {  
    enemy.move();  
    enemy.display();
  }
}

function generatePath() {
  fill("black");
  for (let i = 0; i < PATHS; i++) {
    if (pathPoints[i].x !== pathPoints[i+1].x) {
      rect(pathPoints[i].x, pathPoints[i].y, pathPoints[i+1].x - pathPoints[i].x, PATH_SIZE);
    }
    else if (pathPoints[i].y < pathPoints[i+1].y) {
      rect(pathPoints[i].x, pathPoints[i].y, PATH_SIZE, pathPoints[i+1].y - pathPoints[i].y);
    }
    else if (pathPoints[i].y > pathPoints[i+1].y) {
      rect(pathPoints[i].x, pathPoints[i+1].y, PATH_SIZE, pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE);
    }
  }
}

function mouseClicked() {
  if (towers.length < 5) {
    let aTower = new Tower(mouseX, mouseY);
    towers.push(aTower);
  }
}

