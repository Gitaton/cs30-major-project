// Where's my water
// Karthik Narayan
// 1 May 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//TODO
// - FOR TERRAIN DESTRUCTION:
// - - LOAD JSON LEVEL FILE 
// - - MAYBE ALSO ADD MARCHING SQUARES FOR SMOOTH TRANSITIONS
// BetaTesting.md file


let grid;
let cellSize;

let globalCols;
let globalRows;

// Module Aliases
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;

let engine;
let world;
let circles = [];
let ground;
let groundCells = [];
const BACKGROUND_TILE_SIZE = 128;

let cellDestructionRadius;
let frameCountOn = false;
let oldTime = 0;
let ballCounter = 0;

let crocodile;

let burgerButtonSize;
let burgerButtonState = "inactive";

let gameState = "mainMenu";
let level = 1;

class Swampy {
  constructor() {
    this.spawnLocate = {
      x: -500,
      y: -500,
    };
    this.radius = 100;
    this.swamper;
    this.winMet = false;
  }

  createSwampy() {
    this.swamper = Matter.Bodies.circle(this.spawnLocate.x, this.spawnLocate.y, this.radius, { isSensor: true, isStatic: true });
    Matter.World.add(engine.world, this.swamper);
  }

  spawnLocation(gridX, gridY) { // Make swampy have a spawn location
    // if (keyIsPressed && keyCode === 71) { // If G pressed
    //   this.spawnLocate.x = mouseX;
    //   this.spawnLocate.y = mouseY;
    //   Matter.Body.setPosition(this.swamper, { x: this.spawnLocate.x, y: this.spawnLocate.y});
    // }
    this.spawnLocate.x = gridX * cellSize;
    this.spawnLocate.y = (gridY + 0.5) * cellSize;
    Matter.Body.setPosition(this.swamper, { x: this.spawnLocate.x, y: this.spawnLocate.y});
  }

  display() { // Display swampy
    noFill();
    circle(this.swamper.position.x, this.swamper.position.y, this.radius * 2);
    image(crankyImage, this.swamper.position.x + width/38.4, this.swamper.position.y - width/32, width/6.2, width/6.2);
  }

  winCondition(currentLevelWinAmount) { // WIP, it will work when level system is added
    if (ballCounter > 220) {
      console.log("YOU WIN!");
      if (!victorySound.isPlaying() && this.winMet === false) {
        victorySound.play();
        this.winMet = true;
      }
    }
  }

  detectWater() { // Detects water particles and counts the amount of them within the sensor
    ballCounter = 0;
    for (let circle in circles) {
      if (Matter.Collision.collides(this.swamper, circles[circle].body)) {
        ballCounter++;
      }
    }
    // Display counter text
    text(ballCounter, this.swamper.position.x, this.swamper.position.y);
    this.winCondition();
  }
}

function preload() {
  // Load JSON levels
  grid = loadJSON("level-01.json");

  crankyImage = loadImage("assets/cranky.png");
  backgroundTileImage = loadImage("assets/cranky_bricks_green-HD.jpg");
  dirtImage = loadImage("assets/dirt-HD.jpg");
  hamburgerButtonImage = loadImage("assets/Hamburger-Button.png");
  menuBackgroundImage = loadImage("assets/intro_pack_01_d-HD.jpg");
  titleImage = loadImage("assets/wmw_logo-HD.png");
  crunchSound = loadSound("assets/dive-into-dirt-45578_Z1wMfjgV.mp3");
  menuMusic = loadSound("assets/02. Menu.mp3");
  gameplayMusic_01 = loadSound("assets/03. Level 1.mp3");
  gameplayMusic_02 = loadSound("assets/04. Level 2.mp3");
  gameplayMusic_03 = loadSound("assets/05. Level 3.mp3");
  clickSound = loadSound("assets/computer-mouse-click-351398.mp3");
  victorySound = loadSound("assets/yay-6326.mp3");
}

function setup() { // Setup function (Happens once before draw loop)
  createCanvas(windowWidth, windowHeight, P2D);

  // Sets output volume of music and sound effects
  outputVolume(0.3);
  
  // MatterJS
  engine = Engine.create();
  world = engine.world;

  //noStroke();

  rectMode(CENTER);
  imageMode(CENTER);

  cellSize = round(width/450) * 10;
  cellDestructionRadius = cellSize;

  globalCols = 49;
  globalRows = 44;

  // Set Noise Seed
  noiseSeed(15);

  // Generates grid
  // grid = generateFullGrid(globalCols, globalRows);

  // Creates swampy character
  crocodile = new Swampy();
  crocodile.createSwampy();

  generateGrid();

  // UI global variables
  burgerButtonSize = width/15;
}

function draw() { // Draw loop (updates every frame)
  background(220);
  music();
  mainMenu();
  if (gameState === "gameplay") {
    renderBackgroundImages();
    matterEngine();
    water();
    displayGrid();
    terrainDestruction();
    displayDEBUG();
    gameplayUI();
    crocodile.display();
    crocodile.detectWater();
  }
}

function generateGridNoise(cols, rows) { // Generates the noise pattern responsible for creating the grid, then creates the grid pattern
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(round(noise(x * 0.2, y * 0.2)));
    }
  }
  return newGrid;
}

function generateFullGrid(cols, rows) { // Creates blank grid
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      // newGrid[y].push(round(noise(x * 0.2, y * 0.2)));
      newGrid[y].push(1);
    }
  }
  return newGrid;
}

function generateGrid(level) { // Generates the grid collidors
  for (let y = 0; y < globalRows; y++) {
    for (let x = 0; x < globalCols; x++) {
      if (grid[y][x] === 0) {
        // DO NOTHING
      }
      if (grid[y][x] === 1) {
        let newGround = {
          body: Bodies.rectangle(x * cellSize, y * cellSize, cellSize, cellSize, { isStatic: true })
        };
        groundCells.push(newGround);
        World.add(engine.world, newGround.body);
      }
      if (grid[y][x] === "S") {
        // SET SWAMPY SPAWN LOCATION
        crocodile.spawnLocation(x, y);
        // console.log("AHH");
      }
      if (grid[y][x] === "W") {
        for (let i = 0; i < 20; i++) { // Amount of circles added per cell
          let newCircle = {
            radius: 5,
            body: Bodies.circle(x * cellSize, y * cellSize, 5)
          };
  
          // Add circle to circle array & and to MatterJS world
          circles.push(newCircle);
          World.add(engine.world, newCircle.body);
        }
      }
    }
  }
}

function displayGrid() { // Renders the grid visually
  // Draw Ground
  //stroke("black");
  for (let cell of groundCells) {
    fill("white");
    let secondPosition = cell.body.position;
    rect(secondPosition.x, secondPosition.y, cellSize, cellSize);

    // Creates a selection box
    if (cell.body.position.x + cellDestructionRadius > mouseX && mouseX > cell.body.position.x - cellDestructionRadius && cell.body.position.y + cellDestructionRadius > mouseY && mouseY > cell.body.position.y - cellDestructionRadius && mouseIsPressed === false) {
      push();
      tint(200);
      image(dirtImage, secondPosition.x, secondPosition.y, cellSize, cellSize); // If hovered over
      pop();
    }
    else {
      image(dirtImage, secondPosition.x, secondPosition.y, cellSize, cellSize); // Normal cell
    }
  }
}

function matterEngine() { // Enables physics
  Engine.update(engine);
}

function water() { // Creates water
  // Water Styling
  fill(52,251,255, 50);
  //stroke("dark")
  noStroke();

  if (keyIsPressed && keyCode === 32) { // If spacebar pressed
    // Create circle object
    for (let i = 0; i < 2; i++) { // Amount of circles added per key press
      let newCircle = {
        radius: 5,
        body: Bodies.circle(mouseX, mouseY, 5)
      };
  
      // Add circle to circle array & and to MatterJS world
      circles.push(newCircle);
      World.add(engine.world, newCircle.body);
    }
  }

  // Draw circles
  for (let circle of circles) {
    // Establishes the friction of each ball
    circle.body.friction = 0;

    // Draws a circle at the position of the circle collider
    let position = circle.body.position;
    ellipse(position.x, position.y, circle.radius * 4);

    // Delete if offscreen
    if (position.x < 0 || position.x > windowWidth || position.y < 0 || position.y > windowHeight) {
      circles.splice(circles.indexOf(circle), 1);
      World.remove(engine.world, circle.body);
    }
  }

  // Water blur filter
  filter(BLUR, 3); 
}

function terrainDestruction() {
  if (mouseIsPressed && mouseButton === LEFT) { // Deletes cells when mouse pressed
    for (let cell of groundCells) {
      if (cell.body.position.x + cellDestructionRadius > mouseX && mouseX > cell.body.position.x - cellDestructionRadius && cell.body.position.y + cellDestructionRadius > mouseY && mouseY > cell.body.position.y - cellDestructionRadius) {
        grid[round(mouseY/cellSize)][round(mouseX/cellSize)] = 0; // Deletes from grid
        groundCells.splice(groundCells.indexOf(cell), 1); // Deletes collider from collider grid array
        World.remove(engine.world, cell.body); // Removes cell from world
        if (!crunchSound.isPlaying()) {
          crunchSound.play();
        }
      }
    }
  }
}

function renderBackgroundImages() {
  for (let i = 0; i < ceil(height/BACKGROUND_TILE_SIZE) + 1; i++) {
    for (let j = 0; j < ceil(width/BACKGROUND_TILE_SIZE) + 1; j++) {
      image(backgroundTileImage, j * BACKGROUND_TILE_SIZE, i * BACKGROUND_TILE_SIZE, BACKGROUND_TILE_SIZE, BACKGROUND_TILE_SIZE);
    }
  }
}

function displayDEBUG() { // Toggles debug screen with f12
  // Text styling
  fill("magenta");
  textSize(30);
  textFont("sans-serif");

  if (millis() - oldTime > 100) { // Add a 0.1s delay
    oldTime = millis();
    if (key === ";" && keyIsPressed) { // If key pressed turn on frameCount
      frameCountOn = !frameCountOn;
    }
  }
  if (frameCountOn) {
    text("fps: " + Math.round(frameRate()), width - width/10, height/10);
  }
}

function gameplayUI() { // Handles UI for gameplay
  // If mouse hovering over burger button
  if (mouseX > width - width/20 - burgerButtonSize/2 && mouseX < width - width/20 + burgerButtonSize/2 && mouseY > width/20 - burgerButtonSize/2 && mouseY < width/20 + burgerButtonSize/2) {
    burgerButtonSize = (width/2.4 - burgerButtonSize) / 4;
  } 
  else {
    burgerButtonSize = (width/3.2 - burgerButtonSize) / 4;
  }
  image(hamburgerButtonImage, width - width/20, width/20, burgerButtonSize, burgerButtonSize);

  // Dropdown buttons
  if (burgerButtonState === "active") {

  }
}

function mouseClicked() { // Mouse pressed and released | A single click
  // If button is clicked toggle dropdown menu
  if (burgerButtonState === "inactive" && mouseX > width - width/20 - burgerButtonSize/2 && mouseX < width - width/20 + burgerButtonSize/2 && mouseY > width/20 - burgerButtonSize/2 && mouseY < width/20 + burgerButtonSize/2) {
    burgerButtonState = "active";
    clickSound.play();
  }
  else if (burgerButtonState === "active" && mouseX > width - width/20 - burgerButtonSize/2 && mouseX < width - width/20 + burgerButtonSize/2 && mouseY > width/20 - burgerButtonSize/2 && mouseY < width/20 + burgerButtonSize/2) {
    burgerButtonState = "inactive";
    clickSound.play();
  }

  if (gameState === "mainMenu" && mouseX > width/4.8 && mouseX < width/3 && mouseY > height/2.3 && mouseY < height/1.7) {
    clickSound.play();
    gameState = "gameplay";
  }
}

function music() {
  if (gameState === "gameplay" && menuMusic.isPlaying()) {
    menuMusic.pause();
  }
  if (gameState === "gameplay" && level === 1) {
    if (!gameplayMusic_01.isPlaying()) {
      gameplayMusic_01.loop();
    }
  }
  if (gameState === "mainMenu") {
    if (!menuMusic.isPlaying()) {
      menuMusic.loop();
    }
    if (gameplayMusic_01.isPlaying) {
      gameplayMusic_01.pause();
    }
  }
}

function mainMenu() { // Creates and displays the main menu gameState
  if (gameState === "mainMenu") {
    // Background Image and Logo Image
    imageMode(CORNER);
    image(menuBackgroundImage, 0, 0, width, height);
    image(titleImage, width/8, height/8, 672, 290);
    // Buttons
    if (mouseX > width/4.8 && mouseX < width/3 && mouseY > height/2.3 && mouseY < height/1.7) {
      fill("orange");
    }
    else {
      fill("white");
    }
    textSize(60);
    textStyle(ITALIC);
    text("PLAY", width/4.8, height/1.7);
  }
  imageMode(CENTER);
}