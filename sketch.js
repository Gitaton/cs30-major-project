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
// ADD MATTER.JS FOR COLLISION PHYSICS


// https://www.reddit.com/r/askscience/comments/gfpow/how_accurately_can_we_model_fluid_mechanics/

let grid;
let cellSize;

let globalCols;
let globalRows;

// module aliases
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;

let engine;
let world;
let circles = [];
let ground;
let groundCells = [];

class groundPhysics {
  constructor(cellSize) {
    this.cellSize = cellSize;

  }
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // MatterJS
  engine = Engine.create();
  world = engine.world;

  //noStroke();

  rectMode(CENTER);

  cellSize = 50;

  globalCols = ceil(width/cellSize);
  globalRows = ceil(height/cellSize);

  // Set Noise Seed
  noiseSeed(15);

  grid = generateGridNoise(globalCols, globalRows);
  generateGrid();
}

function draw() {
  background(220);
  matterEngine();
  water();
  displayGrid();
  
  //filter(POSTERIZE, 4);
}

function generateGridNoise(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(round(noise(x * 0.2, y * 0.2)));
    }
  }
  return newGrid;
}

function generateGrid() {
  filter(GRAY);
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

// Check if mouse touching
function matterEngine() {
  Engine.update(engine);
}

function water() {
  // Water Styling
  fill("blue");
  noStroke();

  if (mouseIsPressed) {
    // Create circle object
    let newCircle = {
      radius: 5,
      body: Bodies.circle(mouseX, mouseY, 5)
    };

    // Add circle to circle array & and to MatterJS world
    circles.push(newCircle);
    World.add(engine.world, newCircle.body);
  }

  // Draw circles
  for (let circle of circles) {
    // Establishes the friction of each ball
    circle.body.friction = 0;

    // Draws a circle at the position of the circle collider
    let position = circle.body.position;
    ellipse(position.x, position.y, circle.radius * 4);
  }

  // Water blur filter
  //filter(BLUR, 5); 
  //filter(THRESHOLD);
}

function displayGrid() {
  // Draw Ground
  stroke("black");
  for (let cell of groundCells) {
    fill("white");
    let secondPosition = cell.body.position;
    rect(secondPosition.x, secondPosition.y, cellSize, cellSize);
  }
}
