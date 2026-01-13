// Tower Defense Game
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
const TURRET_COST = 50;
const MAX_TURRETS = 5;

// classes
class Enemy {
  // creates an enemy that takes in a coordinate
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = 1;
    this.radius = 10;
    this.nextPointIndex = 1;
    this.maxHp = currentWave + 5;
    this.hp = this.maxHp;
  }
  
  display() {
    noStroke();
    fill("red");
    circle(this.x, this.y, this.radius * 2);
    if (this.hp > 0) {
      // creates a grey bar with a fixed width
      rectMode(CENTER);
      fill("grey");
      rect(this.x, this.y - 15, 36, 5);
      // creates a green health bar that changes based on the ratio between current hp and max hp (starting hp)
      fill("green");
      rect(this.x - 36/2 + 36 * (this.hp/this.maxHp)/2, this.y - 15, 36 * (this.hp/this.maxHp), 5);
    }
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
      else if (this.y > nextPoint.y + PATH_SIZE/2) {
        this.y -= this.speed;
      }
      else if (this.y < nextPoint.y + PATH_SIZE/2) {
        this.y += this.speed;
      }
      else if (this.x === nextPoint.x + PATH_SIZE/2 && this.y === nextPoint.y + PATH_SIZE/2) {
        this.nextPointIndex += 1;
      }
    }
  }

  // checks if the enemy has lost all of its hp
  isDead() {
    return this.hp <= 0;
  }

  // checks if the enemy has reached the player's base
  isAtBase() {
    return this.nextPointIndex === pathPoints.length;
  }
}

class Turret {
  // creates a turret that takes in a coordinate
  constructor(x,y) {
    this.x = x;
    this.y = y;
    this.radius = 20;
    this.opacity = 255;
    this.lastShot = 0;
    this.range = 200;
    // turret intially faces the left direction
    this.direction = createVector(-1,0);
    this.upgradeDisplay = false;
    this.nextUpgrade = 1;
    this.upgadeCost = 150;
  }

  // draws the turret
  display() {
    noStroke();
    fill(0, 0, 255, this.opacity);
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
  // places an image of a rock at a random coordinate
  constructor() {
    this.w = random(50,70);
    this.h = random(50,70);
    this.x = random(0, width - width/10 - this.w);
    this.y = random(0, height - this.h);
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
let purchasedTower = null;
let baseHp = 100;
let money = 125;
let upgradeBarW = 125;
let upgradeBarH = 20;

// arrays
let enemies = [];
let turrets = [];
let bulletArray = [];
let stonesArray = [];

// booleans
let gameStarted = false;
let isPurchased = false;

// preloads the images needed for the game
function preload() {
  mapImage = loadImage("tdmap.webp");
  stoneImage = loadImage("rock.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  // coordinates for the path
  pathPoints = [
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
    turretShop();
    
    // displays the base hp
    fill("white");
    textSize(width/50);
    text("Health: " + baseHp, width - width/12, height/11);

    // displays the wave count
    fill("white");
    text("Wave: " + currentWave, width - width/12, height/30);

    // displays money
    fill("white");
    text("Money: " + money, width - width/5, height/30);

    // displays all stones within the array
    for (let stone of stonesArray) {
      stone.display();
    }

    // creates a temporary turret that the user can rotate and decide where to place
    if (isPurchased && turrets.length < MAX_TURRETS) {
      if (purchasedTower === null) {
        purchasedTower = new Turret(mouseX, mouseY);
        purchasedTower.opacity = 70;
      }
      purchasedTower.x = mouseX;
      purchasedTower.y = mouseY;
      purchasedTower.display();
    }
    
    // displays all turrets within the array
    for (let turret of turrets) {
      turret.opacity = 255;
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
      // removes enemy from the array if it is eliminated
      if (enemy.isDead()) {
        let index = enemies.indexOf(enemy);
        enemies.splice(index, 1);
        money += floor(random (15,30));
      }
      else if (enemy.isAtBase()) {
        baseHp -= enemy.hp;
        let index = enemies.indexOf(enemy);
        enemies.splice(index, 1);
        money += floor(random(15,30));
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
      startWave();
    }
  }

  // displays upgrade bar above the turret that the user selects
  for (let turret of turrets) {
    if (turret.upgradeDisplay && turret.nextUpgrade < 7) {
      fill("yellow");
      rectMode(CENTER);
      rect(turret.x, turret.y - upgradeBarW/4, upgradeBarW, upgradeBarH);
      textSize(10);
      fill("black");
      text("Upgrade " + turret.nextUpgrade + "   Cost : " + turret.upgadeCost, turret.x, turret.y - upgradeBarW/4);
    }
    else {
      fill("grey");
      rect(turret.x, turret.y - upgradeBarW/4, upgradeBarW/2, upgradeBarH);
      fill("red");
      textSize(10);
      text("Max Upgrade" , turret.x, turret.y - upgradeBarW/4);
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
  maxToSpawn = floor(random(5, currentWave + 4));
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

  // detects if the user clicks on the turret in the shop and purchases it
  if (purchasedTower === null && gameStarted && mouseX > width - width/11 && mouseX < width - width/11 + width/12 && mouseY < height/4 - height/25 + height/6 && mouseY > height/4 - height/25 && money >= TURRET_COST && turrets.length < MAX_TURRETS) {
    isPurchased = true;
    money -= TURRET_COST;
  }

  // spawns a turret at the user's mouse position after they click
  if (turrets.length < MAX_TURRETS && isPurchased && mouseX < width - width/10) {
    let aTurret = new Turret(purchasedTower.x, purchasedTower.y);
    turrets.push(aTurret);
    aTurret.direction = purchasedTower.direction;
    isPurchased = false;
    purchasedTower = null;
  }
  // prevents turrets from being placed on top of eachother
  for (let turret of turrets){
    let theTurret = Bodies.circle(turret.x, turret.y, turret.radius);
    for (let otherTurret of turrets) {
      let theOtherTurret = Bodies.circle(otherTurret.x, otherTurret.y, otherTurret.radius);
      if (otherTurret !== turret) {
        if (Matter.Collision.collides(theOtherTurret, theTurret) !== null) {
          turrets.pop();
        }
      }
    }
  }

  // calls for upgrade bar to be shown if user selects a tower
  for (let turret of turrets) {
    if (mouseX < turret.x + turret.radius && mouseX > turret.x - turret.radius && mouseY > turret.y - turret.radius && mouseY < turret.y + turret.radius) {
      turret.upgradeDisplay = true;
    }
    // else {
    //   turret.upgradeDisplay = false;
    // }
  }

  // upgrades the turret if the user clicks the ugrade bar
  for (let turret of turrets) {
    if (money >= turret.upgadeCost && turret.upgradeDisplay && mouseX > turret.x - upgradeBarW/2 && mouseX < turret.x + upgradeBarW/2 && mouseY < turret.y - upgradeBarW/4 + upgradeBarH/2 && mouseY > turret.y - upgradeBarW/4 - upgradeBarH/2 && turret.nextUpgrade < 7) {
      money -= turret.upgadeCost;
      turret.upgadeCost = turret.upgadeCost + turret.nextUpgrade * 150;
      turret.nextUpgrade += 1;
    }
  }
}

function generateStones() {
  stonesArray = [];
  let totalWanted = 10;
  while (stonesArray.length < totalWanted) {
    // places stone images on the map with random sizes
    let theStone = new Stone();
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
  if (isPurchased && purchasedTower && (key === 'r' || key === 'R')) {
    purchasedTower.direction.rotate(0.05);
  }
  else if (isPurchased && purchasedTower && (key === 'l' || key === 'L')) {
    purchasedTower.direction.rotate(-0.05);
  }
}

// creates and displays the turret shop (currently only one turret available for purchase)
function turretShop() {
  fill("grey");
  rect(width - width/10, height/5, width/10, height/2 - height/15);
  fill("white");
  textSize(width/50);
  text("Shop", width - width/20, height/5 - height/30);
  rect(width - width/11, height/4 - height/25, width/12, height/6);
  fill("black");
  textSize(width/60);
  text("Turret 1", width - width/21, height/3 + height/40);
  fill("blue");
  circle(width - width/21, height/4 + height/30, width/20);
  fill("grey");
  rect(width - width/12, height/3 - height/17, width/35, height/45);
}