// Where's my water
// Karthik Narayan
// 1 May 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//TODO
// - FOR TERRAIN DESTRUCTION:
// - - Create a grid with a relatively large cell size | DONE
// - - When the destruction occurs, divide the cells into smaller cells (add resolution) to the now destroyed cells
// - - MAYBE ALSO ADD MARCHING SQUARES FOR SMOOTH TRANSITIONS
// - - https://github.com/n3r4zzurr0/canvas-liquid-effect
// - FOR FLUID DYNAMICS:
// - - 


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

let cellDestructionRadius;
let frameCountOn = false;
let oldTime = 0;

class Swampy {
  constructor() {

  }

  // Make swampy have a spawn location

  // Make him update percent of swamp slime/water

  // Win condition?
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

  globalCols = ceil(width/cellSize);
  globalRows = ceil(height/cellSize);

  // Set Noise Seed
  noiseSeed(10);

  grid = generateGridNoise(globalCols, globalRows);
  generateGrid();
}

function draw() { // Draw loop (updates every frame)
  background(220);
  matterEngine();
  water();
  displayGrid();
  terrainDestruction();
  displayDEBUG();
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
  fill("magenta");
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
        groundCells.splice(groundCells.indexOf(cell), 1);
        console.log(cell);
        World.remove(engine.world, cell.body);
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
