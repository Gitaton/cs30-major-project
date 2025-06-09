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


// https://www.reddit.com/r/askscience/comments/gfpow/how_accurately_can_we_model_fluid_mechanics/

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
let level = "mainMenu";

let cellDestructionRadius;
let frameCountOn = false;
let oldTime = 0;
let ballCounter = 0;

let crocodile;

class Swampy {
  constructor() {
    this.spawnLocate = {
      x: -500,
      y: -500,
    };
    this.radius = 100;
    this.swamper;
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
    this.spawnLocate.y = gridY * cellSize;
    Matter.Body.setPosition(this.swamper, { x: this.spawnLocate.x, y: this.spawnLocate.y});
  }

  display() { // Display swampy
    noFill();
    circle(this.swamper.position.x, this.swamper.position.y, this.radius * 2); 
  }

  winCondition(currentLevelWinAmount) { // WIP, it will work when level system is added
    if (ballCounter > 100) {
      console.log("YOU WIN!");
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

}

function setup() { // Setup function (Happens once before draw loop)
  createCanvas(windowWidth, windowHeight, P2D);
  
  // MatterJS
  engine = Engine.create();
  world = engine.world;

  //noStroke();

  rectMode(CENTER);

  cellSize = 50;
  cellDestructionRadius = cellSize/2;

  globalCols = ceil(width/cellSize) + 1;
  globalRows = ceil(height/cellSize) + 1;

  // Set Noise Seed
  noiseSeed(15);

  // Generates grid
  grid = generateGridNoise(globalCols, globalRows);
  generateGrid();

  // Creates swampy character
  crocodile = new Swampy();
  crocodile.createSwampy();
}

function draw() { // Draw loop (updates every frame)
  background(220);
  matterEngine();
  water();
  displayGrid();
  terrainDestruction();
  displayDEBUG();
  crocodile.display();
  crocodile.detectWater();
}

function generateGridNoise(cols, rows) { // Generates the noise pattern responsible for creating the grid, then creates the grid pattern
  // let newGrid = [];
  // for (let y = 0; y < rows; y++) {
  //   newGrid.push([]);
  //   for (let x = 0; x < cols; x++) {
  //     newGrid[y].push(round(noise(x * 0.2, y * 0.2)));
  //   }
  // }
  // return newGrid;

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

function generateGrid() { // Generates the grid collidors
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
      }
    }
  }
}

function displayGrid() { // Renders the grid visually
  // Draw Ground
  stroke("black");
  for (let cell of groundCells) {
    fill("white");
    let secondPosition = cell.body.position;
    rect(secondPosition.x, secondPosition.y, cellSize, cellSize);
  }
}

function matterEngine() { // Enables physics
  Engine.update(engine);
}

function water() { // Creates water
  // Water Styling
  fill("green");
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
      }
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
