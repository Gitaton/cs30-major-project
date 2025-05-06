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


// https://www.reddit.com/r/askscience/comments/gfpow/how_accurately_can_we_model_fluid_mechanics/

let grid;
let cellSize;

let globalCols;
let globalRows;

function setup() {
  createCanvas(windowWidth, windowHeight);

  //noStroke();

  cellSize = 100;

  globalCols = ceil(width/cellSize);
  globalRows = ceil(height/cellSize);

  grid = generateGrid(globalCols, globalRows);
}

function draw() {
  background(220);

  displayGrid();
  collision();

  fill("red");
  circle(mouseX, mouseY, 100);
}

function generateGrid(cols, rows) {
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(0);
    }
  }
  return newGrid;
}

function displayGrid() {
  for (let y = 0; y < globalRows; y++) {
    for (let x = 0; x < globalCols; x++) {
      if (grid[y][x] === 0) {
        fill("blue");
      }
      rect(x * cellSize, y * cellSize, cellSize, cellSize);
    }
  }
}

// Check if mouse touching
function collision() {
  for (let y = 0; y < globalRows; y++) {
    for (let x = 0; x < globalCols; x++) {
      if (dist(x * cellSize, y * cellSize, mouseX, mouseY) < 50) {
        console.log("COLLIDED!!");
        grid[y][x] = 1;
      }
    }
  }
}
