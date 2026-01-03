// Tower Defense
// Sohaib Hassan
// Date
//
// Extra for Experts:
// - implemented matter.js collision detection
// - used vectors

// constants
const { Engine, Bodies, Composite, Body, Vector, Render, Constraint, Events } = Matter;
const PATHS = 9;
const PATH_SIZE = 50;

// classes
class Enemy {
  // creates an enemy that takes in a coordinate
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
  
  // controls how enemies move along the path
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
  // creates a tower that takes in a coordinate
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.lastShot = 0;
    this.range = 200;
    // tower intially faces the left direction
    this.direction = createVector(-1,0)
  }

  display() {
    noStroke();
    fill("blue");
    circle(this.x, this.y, this.radius * 2);
    
    // adjusts how the muzzle of the tower is drawn based on how the user decides to rotate the tower
    push();
    translate(this.x,this.y);
    rotate(this.direction.heading());
    fill("grey");
    rectMode(CENTER);
    rect(this.radius, 0, 15, 10);
    pop();
  }
}

class Bullet {
  // creates a bullet that takes in a coordinate a range and a direction
  constructor(x,y,range,dx,dy) {
    this.x = x;
    this.y = y;
    this.radius = 3;
    this.range = range;
    this.startX = x;
    this.startY = y;
    this.dx = dx;
    this.dy = dy;
  }

  display() {
    noStroke();
    fill("orange");
    circle(this.x, this.y, this.radius * 2);
  }

  // keeps the bullets within the tower's range
  update() {
    if (dist(this.x, this.y, this.startX, this.startY) < this.range){
      this.x += this.dx;
      this.y += this.dy;
    }
  }
}

class Stone {
  // places an image of a rock at a given coordinate
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.w = random(50,70);
    this.h = random(50,70);
  }
  display() {
    image(stoneImage, this.x, this.y, this.w, this.h);
  }
}

// global variables
let pathPoints;
let shotDuration = 2000;
let lastSpawned = 0;
let spawnDuration = 1000;
let mapImage;
let currentWave = 0;
let totalSpawned = 0;
let maxToSpawn = 0;
let selectedTower = null;

// arrays
let enemies = [];
let towers = [];
let bulletArray = [];
let stonesArray = [];

// preloads the images needed for the game
function preload() {
  mapImage = loadImage("tdmap.webp");
  stoneImage = loadImage("rock.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // coordinates for the path
  pathPoints =[
    {x: 40, y: 0},
    {x: 40, y: 400},
    {x: 500, y: 400},
    {x: 500, y: 600},
    {x: 800, y: 600},
    {x: 800, y: 200},
    {x: 1000, y: 200},
    {x: 1000, y: 500},
    {x: 1500, y: 500},
    {x: 1500, y: height}
  ];

  generateStones();
  startWave();
}

function draw() {
  background("green");
  generatePath();

  // displays all stones within the array
  for (let stone of stonesArray) {
    stone.display();
  }
  
  // displays all towers within the array
  for (let tower of towers) {
    tower.display();
    // controls how often bullets are released
    if (millis() > tower.lastShot + shotDuration) {
      let bullet = new Bullet(tower.x, tower.y, tower.range, tower.direction.x, tower.direction.y);
      bullet.x += tower.direction.x * 10;
      bullet.y += tower.direction.y * 10;
      bulletArray.push(bullet);
      tower.lastShot = millis();
    }
  }

  // controls how often and how many enemies are spawned
  if (millis() > lastSpawned + spawnDuration && totalSpawned < maxToSpawn) {
    let aEnemy = new Enemy(pathPoints[0].x + PATH_SIZE/2, pathPoints[0].y);
    enemies.push(aEnemy);
    lastSpawned = millis();
    totalSpawned ++;
  }

  // displays and moves enemies
  for (let enemy of enemies) {  
    enemy.move();  
    enemy.display();
  }

  // displays and moves bullets
  for (let bullet of bulletArray) {
    bullet.update();
    bullet.display();
    // removes a bullet if it is off the screen
    if (bullet.x > width || bullet.x < 0 || bullet.y > height || bullet.y < 0) {
      let index = bulletArray.indexOf(bullet);
      bulletArray.splice(index, 1);
    }
    // removes a bullet after it exceeds the tower's range
    else if (dist(bullet.x, bullet.y, bullet.startX, bullet.startY) >= bullet.range){
      let index = bulletArray.indexOf(bullet);
      bulletArray.splice(index, 1);
    }
  }
  // controls the tower and bullet collisions
  for (let bullet of bulletArray) {
    for (let enemy of enemies) {
      let theBullet = Bodies.circle(bullet.x, bullet.y, bullet.radius);
      let theEnemy = Bodies.circle(enemy.x, enemy.y, enemy.radius);
      if (Matter.Collision.collides(theBullet, theEnemy) !== null){
        let indexB = bulletArray.indexOf(bullet);
        bulletArray.splice(indexB, 1);
        let indexE = enemies.indexOf(enemy);
        enemies.splice(indexE, 1);
      }
    }
  }

  // begins a new wave after the previous one has been cleared
  if (enemies.length === 0 && totalSpawned >= maxToSpawn) {
    currentWave ++;
    startWave();
  }
}

// creates the pathway
function generatePath() {
  rectMode(CORNER);
  fill("black");
  for (let i = 0; i < PATHS; i++) {
    // creates the lines that go from right to left or left to right
    if (pathPoints[i].x !== pathPoints[i+1].x) {
      rect(pathPoints[i].x, pathPoints[i].y, pathPoints[i+1].x - pathPoints[i].x, PATH_SIZE);
      // prevents the player from placing a tower on the path
      let thePath = Bodies.rectangle(pathPoints[i].x + (pathPoints[i+1].x - pathPoints[i].x)/2, pathPoints[i].y + PATH_SIZE/2, Math.abs(pathPoints[i+1].x - pathPoints[i].x), PATH_SIZE);
      for (let tower of towers) {
        let theTower = Bodies.circle(tower.x, tower.y, tower.radius);
        if (Matter.Collision.collides(thePath, theTower) !== null){
          let index = towers.indexOf(tower);
          towers.splice(index,1);
        }
      }
    }
    // creates the lines that go up
    else if (pathPoints[i].y < pathPoints[i+1].y) {
      rect(pathPoints[i].x, pathPoints[i].y, PATH_SIZE, pathPoints[i+1].y - pathPoints[i].y);
      // prevents the player from placing a tower on the path
      let thePath = Bodies.rectangle(pathPoints[i].x + PATH_SIZE/2, pathPoints[i].y + (pathPoints[i+1].y - pathPoints[i].y)/2, PATH_SIZE, Math.abs(pathPoints[i+1].y - pathPoints[i].y));
      for (let tower of towers) {
        let theTower = Bodies.circle(tower.x, tower.y, tower.radius);
        if (Matter.Collision.collides(thePath, theTower) !== null){
          let index = towers.indexOf(tower);
          towers.splice(index,1);
        }
      }
    }
    // creates the lines that go down
    else if (pathPoints[i].y > pathPoints[i+1].y) {
      rect(pathPoints[i].x, pathPoints[i+1].y, PATH_SIZE, pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE);
      // prevents the player from placing a tower on the path
      let thePath = Bodies.rectangle(pathPoints[i].x + PATH_SIZE/2, pathPoints[i+1].y + (pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE)/2, PATH_SIZE, Math.abs(pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE));
      for (let tower of towers) {
        let theTower = Bodies.circle(tower.x, tower.y, tower.radius);
        if (Matter.Collision.collides(thePath, theTower) !== null){
          let index = towers.indexOf(tower);
          towers.splice(index,1);
        }
      }
    }
  }
}

// begins the wave
function startWave() {
  currentWave ++;
  totalSpawned = 0;
  // randomly selects an amount of enemies to spawn based on wave number
  maxToSpawn = random(5, currentWave + 4);
  lastSpawned = millis();
}

// spawns a tower at the user's mouse position after they click
function mouseClicked() {
  if (towers.length < 5) {
    let aTower = new Tower(mouseX, mouseY);
    towers.push(aTower);
    selectedTower = aTower;
  }
}

// places stone images on the map with random sizes
function generateStones() {
  for (let i = 0; i < 8; i ++) {
    theStone = new Stone(random(width), random(height));
    stonesArray.push(theStone);
  }
}

// dictates how the tower will be rotated based on what key is pressed
function keyPressed() {
  if (selectedTower && (key === 'r' || key === 'R')) {
      selectedTower.direction.rotate(0.05);
  }
  else if (selectedTower && (key === 'l' || key === 'L')) {
      selectedTower.direction.rotate(-0.05);
  }
}