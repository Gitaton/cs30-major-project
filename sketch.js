// Where's my water
// Karthik Narayan
// 1 May 2025
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

//TODO
// - FOR TERRAIN DESTRUCTION:
// - - Create a grid with a relatively large cell size
// - - When the destruction occurs, divide the cells into smaller cells (add resolution) to the now destroyed cells
// - - MAYBE ALSO ADD MARCHING SQUARES FOR SMOOTH TRANSITIONS
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

function setup() {
  createCanvas(windowWidth, windowHeight);
  
  // MatterJS
  engine = Engine.create();
  world = engine.world;

  //noStroke();

  cellSize = 50;

  globalCols = ceil(width/cellSize);
  globalRows = ceil(height/cellSize);

  // Set Noise Seed
  noiseSeed(8);

  grid = generateGrid(globalCols, globalRows);
}

function draw() {
  background(220);
  displayGrid();
  collision();
  
  Engine.update(engine);
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
    let position = circle.body.position;
    
    ellipse(position.x, position.y, circle.radius);
  }

  // Draw Ground
  for (let cell of groundCells) {
    let secondPosition = cell.body.position;
    rect(secondPosition.x, secondPosition.y, cellSize, cellSize);
  }
}

function generateGrid(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(round(noise(x * 0.2, y * 0.2)));
    }
  }
  return newGrid;
}

function displayGrid() {
  for (let y = 0; y < globalRows; y++) {
    for (let x = 0; x < globalCols; x++) {
      if (grid[y][x] === 0) {
        fill("white");
      }
      if (grid[y][x] === 1) {
        fill("black");
        let newGround = {
          body: Bodies.rectangle(x * cellSize, y * cellSize, cellSize, cellSize, { isStatic: true })
        };
        groundCells.push(newGround);
        World.add(engine.world, newGround.body);
      }
      //fill(grid[y][x]);
      //rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

// Check if mouse touching
function collision() {

}
