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

function setup() {
  createCanvas(windowWidth, windowHeight);
}

function draw() {
  background(220);
  circle(mouseX, mouseY, 50);
}

function generateGrid() {

}
