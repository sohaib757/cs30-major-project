// Tower Defense Game
// Sohaib Hassan
// January 19, 2026
//
// Extra for Experts:
// - implemented matter.js for collision detection
// - used vectors for turret direction

// constants
const { Engine, Bodies, Composite, Body, Vector, Render, Constraint, Events } = Matter;
const PATHS = 9;
const PATH_SIZE = 50;
const TURRET_COST = 50;
const MAX_TURRETS = 15;
const ENEMY_SPEED = 1;
const ENEMY_RADIUS = 10;
const ENEMY_HP = 15;
const ENEMY_HP_SCALE = 10;
const TURRET_RADIUS = 20;
const TURRET_RANGE = 200;
const TURRET_COOLDOWN = 2000;
const TURRET_DAMAGE = 15;
const BULLET_SPEED = 1;
const STARTING_UPGRADE_COST = 150;
const BULLET_RADIUS = 3;

// classes
class Enemy {
  // creates an enemy that takes in a coordinate
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.speed = ENEMY_SPEED;
    this.radius = ENEMY_RADIUS;
    this.nextPointIndex = 1;
    this.maxHp = ENEMY_HP + currentWave * ENEMY_HP_SCALE;
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
    this.radius = TURRET_RADIUS;
    this.opacity = 255;
    this.lastShot = 0;
    this.range = TURRET_RANGE;
    this.shotDuration = TURRET_COOLDOWN;
    // turret intially faces the left direction
    this.direction = createVector(-1,0);
    this.upgradeDisplay = false;
    this.nextUpgrade = 1;
    this.upgradeCost = STARTING_UPGRADE_COST;
    this.damage = TURRET_DAMAGE;
    this.bulletSpeed = BULLET_SPEED;
    this.sellDisplay = false;
    this.totalSpentOnUpgrades = 0;
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
  constructor(x,y,range,dx,dy,dmg) {
    this.x = x;
    this.y = y;
    this.radius = BULLET_RADIUS;
    this.range = range;
    this.startX = x;
    this.startY = y;
    this.dx = dx;
    this.dy = dy;
    this.dmg = dmg;
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
let musicIsOn = true;

// preloads the images and audios needed for the game
function preload() {
  musicImage = loadImage("download.png");
  noMusicImage = loadImage("download (1).png");
  stoneImage = loadImage("rock.png");
  startScreenImage = loadImage("startscreen.jpg");
  coin = createAudio("coin.mp3");
  wow = createAudio("wow.mp3");
  gameMusic = createAudio("backgroundmusic.mp3");
  damage = createAudio("damage.mp3");
  gameOver = createAudio("wompwomp.mp3");
}

function setup() {
  createCanvas(1912, 954);
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

  // adjusts volume for background music
  gameMusic.volume(0.2);

  // start screen
  if (!gameStarted) {
    // displays start screen image
    background(startScreenImage);

    // displays title and start button
    stroke("white");
    textAlign(CENTER, CENTER);
    textSize(60);
    text("Sohaib's Tower Defense Game", width/2, height/2 - 75);
    noStroke();
    fill("green");
    textSize(40);
    text("START", width/2, height/2 + height/500);

    // displays instructions
    rectMode(CENTER);
    fill(0, 180);
    rect(width/2, height/2 + 135, width/5, height/5, 20);
    fill("white");
    textSize(22);
    text("HOW TO PLAY", width/2, height/2 + 70);
    textSize(16);
    text("Purchase a turret in the shop and place it on the map", width/2, height/2 + 100);
    text("Use R / L  to rotate the turret's direction", width/2, height/2 + 125);
    text("Defend your base from incoming enemies", width/2, height/2 + 150);
    text("Earn more money by defeating enemies", width/2, height/2 + 175);
    text("Click speaker icon to toggle music", width/2, height/2 + 200);
  }
}

function draw() {
  if (gameStarted) {
    // controls when the background music loops
    if (musicIsOn) {
      gameMusic.play();
    }
    else {
      gameMusic.stop();
    }
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

    classes();
    endGame();

    // displays image that indicates whether music is on or off at the bottom left of the screen
    if (musicIsOn) {
      image(musicImage, 0, height - height/12, height/11, height/11);
    }
    else {
      image(noMusicImage, 0, height - height/12, height/11, height/11);
    }

    // rotates the turret left or right depending on what button is clicked
    if (isPurchased && purchasedTower && keyIsDown(82)) {
      purchasedTower.direction.rotate(0.03);
    }
    else if (isPurchased && purchasedTower && keyIsDown(76)) {
      purchasedTower.direction.rotate(-0.03);
    }
  }
}

// controls everything that involves the classes and the main functions of the game
function classes() {
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
    if (millis() > turret.lastShot + turret.shotDuration) {
      let bullet = new Bullet(turret.x, turret.y, turret.range, turret.direction.x * turret.bulletSpeed, turret.direction.y * turret.bulletSpeed, turret.damage);
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
      money += floor(random (5 + currentWave * 2, 10 + currentWave * 2));
      coin.play();
    }
    else if (enemy.isAtBase()) {
      baseHp -= enemy.hp;
      damage.play();
      let index = enemies.indexOf(enemy);
      enemies.splice(index, 1);
      money += floor(random (5 + currentWave * 2, 10 + currentWave * 2));
      coin.play();
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
  
  // displays upgrade bar above the turret that the user selects
  for (let turret of turrets) {
    if (turret.upgradeDisplay && turret.nextUpgrade < 7) {
      fill("yellow");
      rectMode(CENTER);
      rect(turret.x, turret.y - upgradeBarW/4, upgradeBarW, upgradeBarH);
      textSize(10);
      fill("black");
      text("Upgrade " + turret.nextUpgrade + "   Cost : " + turret.upgradeCost, turret.x, turret.y - upgradeBarW/4);
    }
    // displays a bar indicating that the user can no longer upgrade the turret once 7 upgrades has been reached
    else if (turret.nextUpgrade === 7) {
      fill("grey");
      rectMode(CENTER);
      rect(turret.x, turret.y - upgradeBarW/4, upgradeBarW/2, upgradeBarH);
      fill("red");
      textSize(10);
      text("Max Upgrade" , turret.x, turret.y - upgradeBarW/4);
    }
    // displays a sell bar below the turret that the user selects
    if (turret.sellDisplay) {
      fill("red");
      rectMode(CENTER);
      rect(turret.x, turret.y + upgradeBarW/4, upgradeBarW/3, upgradeBarH);
      textSize(10);
      fill("black");
      text("Sell ", turret.x, turret.y + upgradeBarW/4);
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
          money += TURRET_COST;
          coin.play();
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
          money += TURRET_COST;
          coin.play();
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
          money += TURRET_COST;
          coin.play();
        }
      }
    }
  }
}

// begins the wave
function startWave() {
  currentWave ++; 
  if (currentWave > 1) {
    wow.play();
  }
  totalSpawned = 0;
  // randomly selects an amount of enemies to spawn based on wave number
  maxToSpawn = floor(random(currentWave + 5, 10 + currentWave * 2));
  lastSpawned = millis();
  // rewards the player with a random amount of money for surviving an entire wave
  if (currentWave>1) {
    money += floor(random (5 + currentWave * 2, 10 + currentWave * 2));
    coin.play();
  }
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

  // prevents turrets from being placed on the stones
  for (let turret of turrets) {
    for (let stone of stonesArray) {
      let theTurret = Bodies.circle(turret.x, turret.y, turret.radius);
      let theStone = Bodies.rectangle(stone.x + stone.w/2, stone.y + stone.h/2, stone.w, stone.h);
      if (Matter.Collision.collides(theTurret, theStone) !== null) {
        let index = turrets.indexOf(turret);
        turrets.splice(index,1);
        money += TURRET_COST;
        coin.play();
      }
    }
  }
  
  // prevents turrets from being placed on top of eachother
  for (let turret of turrets) {
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

  for (let turret of turrets) {
    // upgrades the turret if the user clicks the ugrade bar
    if (money >= turret.upgradeCost && turret.upgradeDisplay && mouseX > turret.x - upgradeBarW/2 && mouseX < turret.x + upgradeBarW/2 && mouseY < turret.y - upgradeBarW/4 + upgradeBarH/2 && mouseY > turret.y - upgradeBarW/4 - upgradeBarH/2 && turret.nextUpgrade < 7) {
      money -= turret.upgradeCost;
      turret.totalSpentOnUpgrades += turret.upgradeCost;
      turret.upgradeCost = turret.upgradeCost + turret.nextUpgrade * 150;
      turret.nextUpgrade += 1;
      turret.shotDuration *= 0.93;
      turret.bulletSpeed += 0.2;
      turret.damage += 4;
      turret.range += 7;
    }
    
    // sells the turret if the user clicks the sell bar
    else if (turret.sellDisplay && mouseX > turret.x - upgradeBarW/6 && mouseX < turret.x + upgradeBarW/6 && mouseY < turret.y + upgradeBarW/4 + upgradeBarH/2 && mouseY > turret.y + upgradeBarW/4 - upgradeBarH/2) {
      money += TURRET_COST/2 + turret.totalSpentOnUpgrades/2;
      coin.play();
      let index = turrets.indexOf(turret);
      turrets.splice(index,1);
    }
  }

  // calls for upgrade bar to be shown if user selects a tower
  for (let turret of turrets) {
    turret.upgradeDisplay = false;
    if (mouseX < turret.x + turret.radius && mouseX > turret.x - turret.radius && mouseY > turret.y - turret.radius && mouseY < turret.y + turret.radius) {
      turret.upgradeDisplay = true;
    }
  }

  // calls for sell bar to be shown if user selects a tower
  for (let turret of turrets) {
    turret.sellDisplay = false;
    if (mouseX < turret.x + turret.radius && mouseX > turret.x - turret.radius && mouseY > turret.y - turret.radius && mouseY < turret.y + turret.radius) {
      turret.sellDisplay = true;
    }
  }

  // flips from music on to music off if user clicks on it
  if (mouseX >= 0 && mouseX <= height/11 && mouseY >= height - height/12 && mouseY <= height) {    
    musicIsOn = !musicIsOn;
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
      
    // prevents stones from spawning on the ui (top right)
    for (let stone of stonesArray) {
      let uiBody = Bodies.rectangle(width/2, height/14, width, height/5);
      let theStone = Bodies.rectangle(stone.x + stone.w/2, stone.y + stone.h/2, stone.w, stone.h);
      if (Matter.Collision.collides(uiBody, theStone) !== null) {
        let index = stonesArray.indexOf(stone);
        stonesArray.splice(index,1);
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

function keyPressed() {
  // rotates the turret left or right depending on what button is clicked
  // if (isPurchased && purchasedTower && (key === 'r' || key === 'R')) {
  //   purchasedTower.direction.rotate(0.05);
  // }
  // else if (isPurchased && purchasedTower && (key === 'l' || key === 'L')) {
  //   purchasedTower.direction.rotate(-0.05);
  // }

  // restarts the game if the user presses r after they lose
  if (baseHp <= 0 && (key === "r" || key === "R")) {
    gameStarted = true;
    baseHp = 100;
    money = 125;
    currentWave = 0;
    for (let i = turrets.length - 1; i >= 0; i--) {
      turrets.splice(i,1);
    }
    for (let i = enemies.length - 1; i >= 0; i--) {
      enemies.splice(i,1);
    }   
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
  fill("green");
  textSize(width/90);
  text("Cost: " + TURRET_COST, width - width/15, height/4 - height/40);
  fill("blue");
  circle(width - width/21, height/4 + height/30, width/20);
  fill("grey");
  rect(width - width/12, height/3 - height/17, width/35, height/45);
}

// ends the game once the user loses (hp < 0)
function endGame() {
  if (baseHp <= 0) {
    gameMusic.stop();
    gameOver.play();
    gameStarted = false;
    background("black");
    fill("red");
    textSize(width/6);
    text("You Lost.", width/2, height/2);
    textSize(width/18);
    text("Press R to restart.", width/2, height/2 + height/6);
  }
}