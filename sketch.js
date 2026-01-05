// turret Defense
// Sohaib Hassan
// Date
//
// Extra for Experts:
// - implemented matter.js for collision detection
// - used vectors for turret direction

// constants
const { Engine, Bodies, Composite, Body, Vector, Render, Constraint, Events } = Matter;
const PATHS = 9;
const PATH_SIZE = 50;
const BASE_HP = 1000;

// classes
class Enemy {
  // creates an enemy that takes in a coordinate
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.radius = 10;
    this.nextPointIndex = 1;
    this.hp = currentWave + 5;
  }
  
  display() {
    noStroke();
    fill("red");
    circle(this.x, this.y, this.radius * 2);
    rectMode(CENTER);
    fill("green");
    rect(this.x, this.y - 15, this.hp * 4, 5);
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

  // removes enemy off the screen if all hp is lost
  isDead() {
    return this.hp <= 0;
  }
}

class Turret {
  // creates a turret that takes in a coordinate
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.lastShot = 0;
    this.range = 200;
    // turret intially faces the left direction
    this.direction = createVector(-1,0);
  }

  display() {
    noStroke();
    fill("blue");
    circle(this.x, this.y, this.radius * 2);
  
    // adjusts how the muzzle of the turret is drawn based on how the user decides to rotate the turret
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
    this.dmg = 5;
  }

  display() {
    noStroke();
    fill("orange");
    circle(this.x, this.y, this.radius * 2);
  }

  // keeps the bullets within the turret's range
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
let turrets = [];
let bulletArray = [];
let stonesArray = [];

// booleans
let gameStarted = false;

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
  // start screen
  if (!gameStarted) {
    background("black");
    stroke("white");
    textAlign(CENTER, CENTER);
    textSize(40);
    text("Sohaib's Tower Defense Game", width/2, height/3);
    noStroke();
    fill("green");
    rectMode(CENTER);
    rect(width/2,height/2, width/8, 50);
    fill("yellow");
    text("Start", width/2, height/2);
  }
}

function draw() {
  if (gameStarted) {
    background("green");
    generatePath();

    // displays all stones within the array
    for (let stone of stonesArray) {
      stone.display();
    }
    
    // displays all turrets within the array
    for (let turret of turrets) {
      turret.display();
      // controls how often bullets are released
      if (millis() > turret.lastShot + shotDuration) {
        let bullet = new Bullet(turret.x, turret.y, turret.range, turret.direction.x, turret.direction.y);
        bullet.x += turret.direction.x * 10;
        bullet.y += turret.direction.y * 10;
        bulletArray.push(bullet);
        turret.lastShot = millis();
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
      if (enemy.isDead()) {
        let index = enemies.indexOf(enemy);
        enemies.splice(index, 1);
      }
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
      // removes a bullet after it exceeds the turret's range
      else if (dist(bullet.x, bullet.y, bullet.startX, bullet.startY) >= bullet.range){
        let index = bulletArray.indexOf(bullet);
        bulletArray.splice(index, 1);
      }
    }

    // controls the turret and bullet collisions
    for (let bullet of bulletArray) {
      for (let enemy of enemies) {
        let theBullet = Bodies.circle(bullet.x, bullet.y, bullet.radius);
        let theEnemy = Bodies.circle(enemy.x, enemy.y, enemy.radius);
        if (Matter.Collision.collides(theBullet, theEnemy) !== null){
          let indexB = bulletArray.indexOf(bullet);
          bulletArray.splice(indexB, 1);
          enemy.hp -= bullet.dmg;
        }
      }
    }
  
    // begins a new wave after the previous one has been cleared
    if (enemies.length === 0 && totalSpawned >= maxToSpawn) {
      currentWave ++;
      startWave();
    }

    // prevents turrets from being placed on top of eachother
    for (let i = 0; i < turrets.length - 1; i++) {
      let theTurret = Bodies.circle(turrets[i].x, turrets[i].y, turrets[i].radius);
      for (let j = i; j < turrets.length - 1; j++) {
        let otherTurret = Bodies.circle(turrets[j].x, turrets[j].y, turrets[j].radius);
        if (Matter.Collision.collides(otherTurret, theTurret) !== null){
          turrets.splice(turrets[j], 1);
        }
      }
    }
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
      // prevents the player from placing a turret on the path
      let thePath = Bodies.rectangle(pathPoints[i].x + (pathPoints[i+1].x - pathPoints[i].x)/2, pathPoints[i].y + PATH_SIZE/2, Math.abs(pathPoints[i+1].x - pathPoints[i].x), PATH_SIZE);
      for (let turret of turrets) {
        let theTurret = Bodies.circle(turret.x, turret.y, turret.radius);
        if (Matter.Collision.collides(thePath, theTurret) !== null){
          let index = turrets.indexOf(turret);
          turrets.splice(index,1);
        }
      }
    }
    // creates the lines that go up
    else if (pathPoints[i].y < pathPoints[i+1].y) {
      rect(pathPoints[i].x, pathPoints[i].y, PATH_SIZE, pathPoints[i+1].y - pathPoints[i].y);
      // prevents the player from placing a turret on the path
      let thePath = Bodies.rectangle(pathPoints[i].x + PATH_SIZE/2, pathPoints[i].y + (pathPoints[i+1].y - pathPoints[i].y)/2, PATH_SIZE, Math.abs(pathPoints[i+1].y - pathPoints[i].y));
      for (let turret of turrets) {
        let theTurret = Bodies.circle(turret.x, turret.y, turret.radius);
        if (Matter.Collision.collides(thePath, theTurret) !== null){
          let index = turrets.indexOf(turret);
          turrets.splice(index,1);
        }
      }
    }
    // creates the lines that go down
    else if (pathPoints[i].y > pathPoints[i+1].y) {
      rect(pathPoints[i].x, pathPoints[i+1].y, PATH_SIZE, pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE);
      // prevents the player from placing a turret on the path
      let thePath = Bodies.rectangle(pathPoints[i].x + PATH_SIZE/2, pathPoints[i+1].y + (pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE)/2, PATH_SIZE, Math.abs(pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE));
      for (let turret of turrets) {
        let theTurret = Bodies.circle(turret.x, turret.y, turret.radius);
        if (Matter.Collision.collides(thePath, theTurret) !== null){
          let index = turrets.indexOf(turret);
          turrets.splice(index,1);
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

function mouseClicked() {
  // initiates the game after the user clicks "start"
  if (!gameStarted && mouseX < width/2 + width/8 && mouseX > width/2 - width/8 && mouseY < height/2 + 50 && mouseY > height/2 - 50) {
    gameStarted = true;
    generateStones();
    startWave();
    background("green");
  }

  // spawns a turret at the user's mouse position after they click
  if (turrets.length < 5 && gameStarted) {
    let aTurret = new Turret(mouseX, mouseY);
    turrets.push(aTurret);
    selectedTower = aTurret;
  }
}

function generateStones() {
  stonesArray = [];
  let totalWanted = 10;
  while (stonesArray.length < totalWanted) {
    // places stone images on the map with random sizes
    let theStone = new Stone(0, 0);
    theStone.x = random(0, width - theStone.w);
    theStone.y = random(0, height - theStone.h);
    stonesArray.push(theStone);
    // prevents stones from spawning on eachother
    let theStoneBody = Bodies.rectangle(theStone.x + theStone.w/2, theStone.y + theStone.h/2, theStone.w, theStone.h);
    for (let otherStone of stonesArray) {
      let theOtherStone = Bodies.rectangle(otherStone.x + otherStone.w/2, otherStone.y + otherStone.h/2, otherStone.w, otherStone.h);
      if (otherStone!== theStone) {
        if (Matter.Collision.collides(theOtherStone, theStoneBody) !== null) {
          stonesArray.pop();
        }
      }
    }
    // prevents stones from spawning on the pathway
    for (let i = 0; i < PATHS; i++) {
      for (let stone of stonesArray) {
        // checks the lines that go from right to left or left to right
        if (pathPoints[i].x !== pathPoints[i+1].x) {
          let thePath = Bodies.rectangle(pathPoints[i].x + (pathPoints[i+1].x - pathPoints[i].x)/2, pathPoints[i].y + PATH_SIZE/2, Math.abs(pathPoints[i+1].x - pathPoints[i].x), PATH_SIZE);
          let theStone = Bodies.rectangle(stone.x + stone.w/2, stone.y + stone.h/2, stone.w, stone.h);
          if (Matter.Collision.collides(thePath, theStone) !== null) {
            let index = stonesArray.indexOf(stone);
            stonesArray.splice(index,1);
          }
        }
        // checks the lines that go up
        else if (pathPoints[i].y < pathPoints[i+1].y) {
          let thePath = Bodies.rectangle(pathPoints[i].x + PATH_SIZE/2, pathPoints[i].y + (pathPoints[i+1].y - pathPoints[i].y)/2, PATH_SIZE, Math.abs(pathPoints[i+1].y - pathPoints[i].y));
          let theStone = Bodies.rectangle(stone.x + stone.w/2, stone.y + stone.h/2, stone.w, stone.h);
          if (Matter.Collision.collides(thePath, theStone) !== null) {
            let index = stonesArray.indexOf(stone);
            stonesArray.splice(index,1);
          }
        }
        // checks the lines that go down
        else if (pathPoints[i].y > pathPoints[i+1].y) {
          let thePath = Bodies.rectangle(pathPoints[i].x + PATH_SIZE/2, pathPoints[i+1].y + (pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE)/2, PATH_SIZE, Math.abs(pathPoints[i].y - pathPoints[i+1].y + PATH_SIZE));
          let theStone = Bodies.rectangle(stone.x + stone.w/2, stone.y + stone.h/2, stone.w, stone.h);
          if (Matter.Collision.collides(thePath, theStone) !== null) {
            let index = stonesArray.indexOf(stone);
            stonesArray.splice(index,1);
          }
        }
      }
    }
  }
}

// rotates the turret left or right depending on what button is clicked
function keyPressed() {
  if (selectedTower && (key === 'r' || key === 'R')) {
    selectedTower.direction.rotate(0.05);
  }
  else if (selectedTower && (key === 'l' || key === 'L')) {
    selectedTower.direction.rotate(-0.05);
  }
}