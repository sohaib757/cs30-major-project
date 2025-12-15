// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const { Engine, Bodies, Composite, Body, Vector, Render, Constraint, Events } = Matter;
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
      if (this.x < nextPoint.x + PATH_SIZE/2) {
        this.x += this.speed;
      }
      else if (this.x > nextPoint.x + PATH_SIZE/2) {
        this.x -= this.speed;
      }
      if (this.y > nextPoint.y + PATH_SIZE/2) {
        this.y -= this.speed;
      }
      else if (this.y < nextPoint.y + PATH_SIZE/2) {
        this.y += this.speed;
      }
      if (this.x === nextPoint.x + PATH_SIZE/2 && this.y === nextPoint.y + PATH_SIZE/2) {
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
    circle(this.x, this.y, this.radius * 2);
    fill("grey");
    rectMode(CENTER);
    rect(this.x - this.radius, this.y , 15, 10);
  }
}

class Bullet {
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.radius = 3;
  }

  display() {
    noStroke();
    fill("orange");
    circle(this.x, this.y, this.radius * 2);
  }

  update() {
    this.x --;
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

let lastShot = 0;
let shotDuration = 2000;
let lastSpawned = 0;
let spawnDuration = 1000;
let enemies = [];
let towers = [];
let bulletArray = [];
let mapImage;

function preload() {
  mapImage = loadImage("tdmap.jpg");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(mapImage);
  generatePath();
  for (let tower of towers) {
    tower.display();
    if (millis() > lastShot + shotDuration) {
      let bullet = new Bullet(tower.x - tower.radius, tower.y);
      bulletArray.push(bullet);
      lastShot = millis();
    }
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
  for (let bullet of bulletArray) {
    bullet.update();
    bullet.display();
  }
  for (let bullet of bulletArray) {
    for (let enemy of enemies) {
      let theBullet = Bodies.circle(bullet.x, bullet.y, bullet.radius);
      let theEnemy = Bodies.circle(enemy.x, enemy.y, enemy.radius);
      if (Matter.Collision.collides(theBullet, theEnemy) !== null){
        let index = enemies.indexOf(enemy);
        enemies.splice(index,1);
      }
    }
  }
}

function generatePath() {
  rectMode(CORNER);
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


