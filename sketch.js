// Where's my water
// Karthik Narayan
// 1 May 2025
//
// Extra for Experts:
// - MatterJS
// - Filters
// - Touch Screen / Mobile Phone Support

// Grid initalization variables
let grid;
let cellSize;
let globalCols;
let globalRows;

// Module Aliases
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;

// MatterJS initalization
let engine;
let world;
let circles = [];
let ground;
let groundCells = [];
const BACKGROUND_TILE_SIZE = 128;

// Miscellaneous Global Variables
let cellDestructionRadius;
let frameCountOn = false;
let oldTime = 0;
let ballCounter = 0;

// Swampy Object
let crocodile;

// UI Variables
let burgerButtonSize;
let retryBurgerButtonSize;
let homeButtonSize;
let retryButtonSize;
let burgerButtonState = "inactive";

// Game State Variables
let gameState = "mainMenu";
let winScreenState = false;
let tutorialState = true;
let plotPlayed = false;
let plotTime = 0;
let level = 1;

// Creates Swampy Character Class
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
    // - Debug Swampy Spawn - 
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
    // image(crankyImage, this.swamper.position.x + width/38.4, this.swamper.position.y - width/32, width/6.2, width/6.2);
    if (winScreenState) {
      image(happySwampyImage, this.swamper.position.x + width/38.4, this.swamper.position.y - width/32, width/6.2, width/6.2);
    }
    else {
      image(sadSwampyImage, this.swamper.position.x + width/38.4, this.swamper.position.y - width/32, width/6.2, width/6.2);
    }
    // Displays water percentage
    fill("white");
    textFont("comic sans ms");
    textSize(width/1920 * 40);
    textAlign(CENTER);
    textStyle(ITALIC);
    image(waterDropImage, width/40, width/40, width/1920 * 1669 * 0.02, width/1920 * 2400 * 0.02);
    text(round(ballCounter/220 * 100) + "%", width/18, width/30);
  }

  winScreen() { // Displays win screen
    if (winScreenState) {
      // Win Screen background image
      filter(BLUR, 6);
      fill(0, 0, 0, 150);
      rect(width/2, height/2, width, height);
      image(winBackgroundImage, width/2, height/2, 1686 * 0.5 * width/1920, 1230 * 0.5 * width/1920);

      // Win screen text
      fill("white");
      textFont("comic sans ms");
      textSize(width/1920 * 40);
      textAlign(CENTER);
      textStyle(ITALIC);
      text("Excellent!", width/2, height/2.7);

      // - Win Screen Buttons -
      // Hovering over home button
      if (dist(width/2.2, height/2, mouseX, mouseY) <= homeButtonSize/2) {
        homeButtonSize = (width/2.4 - homeButtonSize) / 4;
      } 
      else {
        homeButtonSize = (width/3.2 - homeButtonSize) / 4;
      }
      // Hovering over retry button
      if (dist(width/1.8, height/2, mouseX, mouseY) <= retryButtonSize/2) {
        retryButtonSize = (width/2.4 - retryButtonSize) / 4;
      } 
      else {
        retryButtonSize = (width/3.2 - retryButtonSize) / 4;
      }
      image(homeButtonImage, width/2.2, height/2, homeButtonSize, homeButtonSize);
      image(retryHamburgerImage, width/1.8, height/2, retryButtonSize, retryButtonSize);
    }
  }

  winCondition(currentLevelWinAmount) { // Checks if the Crocodile/Alligator has water
    if (ballCounter > currentLevelWinAmount) {
      winScreenState = true;
      console.log("YOU WIN!");
      if (!victorySound.isPlaying() && this.winMet === false) {
        victorySound.play();
        this.winMet = true;
      }
      this.winScreen();
    }
    else {
      winScreenState = false;
    }
  }

  detectWater() { // Detects water particles and counts the amount of them within the sensor
    ballCounter = 0;
    for (let circle in circles) {
      if (Matter.Collision.collides(this.swamper, circles[circle].body)) {
        ballCounter++;
      }
    }
    // Check if won
    this.winCondition(220);
  }
}

function preload() {
  // Load JSON levels
  grid = loadJSON("level-01.json");

  // Load Lebron Images
  lebronImage = loadImage("assets/Lebron.jpg");
  lebronMusic = loadSound("assets/you-are-my-sunshine-lebron-james.mp3");
  lebronSound = loadSound("assets/lebron.mp3");

  // Load All Other Images
  gloveCursorImage = loadImage("assets/GloveCursor.png");
  crankyImage = loadImage("assets/cranky.png");
  happySwampyImage = loadImage("assets/HappySwampy-ezgif.com-webp-to-png-converter.png");
  sadSwampyImage = loadImage("assets/SadSwampy-ezgif.com-webp-to-png-converter.png");
  plotImage = loadImage("assets/Plot.jpg");
  backgroundTileImage = loadImage("assets/cranky_bricks_green-HD.jpg");
  dirtImage = loadImage("assets/dirt-HD.jpg");
  hamburgerButtonImage = loadImage("assets/Hamburger-Button.png");
  retryHamburgerImage = loadImage("assets/Retry.png");
  playButtonImage = loadImage("assets/iap_play.png");
  playButtonDepressedImage = loadImage("assets/iap_play_depressed.png");
  menuBackgroundImage = loadImage("assets/intro_pack_01_d-HD.jpg");
  winBackgroundImage = loadImage("assets/winBackground.png");
  homeButtonImage = loadImage("assets/HomeButton.png");
  titleImage = loadImage("assets/wmw_logo-HD.png");
  waterDropImage = loadImage("assets/WaterDrop.png");

  // Load All Music and Sound
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

  // Sets the orgin to center for rectangles and images
  rectMode(CENTER);
  imageMode(CENTER);

  // Intializes Cell Size and Cell Destruction Radius
  cellSize = round(width/450) * 10;
  cellDestructionRadius = cellSize;

  // Sets the # of Columns and Rows for each loaded level
  globalCols = 49;
  globalRows = 44;

  // Set Noise Seed
  noiseSeed(15);

  // Creates swampy character
  crocodile = new Swampy();
  crocodile.createSwampy();

  // Loads all elements of the grid into fruition
  generateGrid();

  // UI global variables
  burgerButtonSize = width/15;
  retryBurgerButtonSize = width/15;
  homeButtonSize = width/15;
  retryButtonSize = width/15;
}

function draw() { // Draw loop (updates every frame)
  background(41, 100, 103);
  lebronMode();
  music();
  mainMenu();
  plot();
  if (gameState === "gameplay") {
    renderBackgroundImages();
    matterEngine();
    water();
    displayGrid();
    terrainDestruction();
    displayDEBUG();
    gameplayUI();
    tutorial();
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

function generateFullGrid(cols, rows) { // Creates blank grid for creating levels
  let newGrid = [];
  for (let y = 0; y < rows; y++) {
    newGrid.push([]);
    for (let x = 0; x < cols; x++) {
      newGrid[y].push(1);
    }
  }
  return newGrid;
}

function generateGrid() { // Generates the grid collidors, water, and spawns swampy based on grid grid array values
  for (let y = 0; y < globalRows; y++) {
    for (let x = 0; x < globalCols; x++) {
      try {
        if (grid[y][x] === 0) {
        // DO NOTHING
        }
        if (grid[y][x] === 1) {
          // Create ground cell
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
        if (grid[y][x] === "W") {
          // Create water
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
      catch {
        continue;
      }
      
    }
  }
}

function displayGrid() { // Renders the grid visually
  // Draw Ground
  for (let cell of groundCells) {
    // Draws each cell incase textures don't render
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
  noStroke();
  
  // Debug / Sandbox Mode Functionality
  // if (keyIsPressed && keyCode === 32) { // If spacebar pressed
  //   // Create circle object
  //   for (let i = 0; i < 2; i++) { // Amount of circles added per key press
  //     let newCircle = {
  //       radius: 5,
  //       body: Bodies.circle(mouseX, mouseY, 5)
  //     };
  
  //     // Add circle to circle array & and to MatterJS world
  //     circles.push(newCircle);
  //     World.add(engine.world, newCircle.body);
  //   }
  // }

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

function terrainDestruction() { // Removes ground cells when mouse clicks on them
  if (mouseIsPressed && mouseButton === LEFT) { // Deletes cells when mouse pressed
    for (let cell of groundCells) {
      if (cell.body.position.x + cellDestructionRadius > mouseX && mouseX > cell.body.position.x - cellDestructionRadius && cell.body.position.y + cellDestructionRadius > mouseY && mouseY > cell.body.position.y - cellDestructionRadius) {
        groundCells.splice(groundCells.indexOf(cell), 1); // Deletes collider from collider grid array
        World.remove(engine.world, cell.body); // Removes cell from world
        if (!crunchSound.isPlaying()) {
          crunchSound.play();
        }
      }
    }
  }
}

function renderBackgroundImages() { // Renders the background during gameplay
  for (let i = 0; i < ceil(height/BACKGROUND_TILE_SIZE) + 1; i++) {
    for (let j = 0; j < ceil(width/BACKGROUND_TILE_SIZE) + 1; j++) {
      image(backgroundTileImage, j * BACKGROUND_TILE_SIZE, i * BACKGROUND_TILE_SIZE, BACKGROUND_TILE_SIZE, BACKGROUND_TILE_SIZE);
    }
  }
}

function displayDEBUG() { // Toggles debug screen with ';'
  // Text styling
  fill("magenta");
  textSize(30);
  textFont("sans-serif");

  // Adds a delay it does not flicker
  if (millis() - oldTime > 100) { // Add a 0.1s delay
    oldTime = millis();
    if (key === ";" && keyIsPressed) { // If key pressed turn on frameCount
      frameCountOn = !frameCountOn;
    }
  }
  if (frameCountOn) {
    // Display FPS
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
    // If mouse hovering over retry burger button
    if (mouseX > width - width/20 - retryBurgerButtonSize/2 && mouseX < width - width/20 + retryBurgerButtonSize/2 && mouseY > width/8 - retryBurgerButtonSize/2 && mouseY < width/8 + retryBurgerButtonSize/2) {
      retryBurgerButtonSize = (width/2.4 - retryBurgerButtonSize) / 4;
    } 
    else {
      retryBurgerButtonSize = (width/3.2 - retryBurgerButtonSize) / 4;
    }
    image(retryHamburgerImage, width - width/20, width/8, retryBurgerButtonSize, retryBurgerButtonSize);
  }
}

function mouseClicked() { // Mouse pressed and released | A single click
  // Remove the tutorial hand when player begins playing
  if (gameState === "gameplay") { 
    tutorialState = false;
  }

  // If plot is read and clicked on, switch to gameplay
  if (gameState === "plot") {
    plotPlayed = true;
    gameState = "gameplay";
  }

  // If button is clicked toggle dropdown menu with a button for reloading the game
  if (burgerButtonState === "inactive" && mouseX > width - width/20 - burgerButtonSize/2 && mouseX < width - width/20 + burgerButtonSize/2 && mouseY > width/20 - burgerButtonSize/2 && mouseY < width/20 + burgerButtonSize/2) {
    burgerButtonState = "active";
    clickSound.play();
  }
  else if (burgerButtonState === "active" && mouseX > width - width/20 - burgerButtonSize/2 && mouseX < width - width/20 + burgerButtonSize/2 && mouseY > width/20 - burgerButtonSize/2 && mouseY < width/20 + burgerButtonSize/2) {
    burgerButtonState = "inactive";
    clickSound.play();
  }
  else if (burgerButtonState === "active" && mouseX > width - width/20 - retryBurgerButtonSize/2 && mouseX < width - width/20 + retryBurgerButtonSize/2 && mouseY > width/8 - retryBurgerButtonSize/2 && mouseY < width/8 + retryBurgerButtonSize/2) {
    reload();
    clickSound.play();
  }

  // If mouse clicks on play button
  if (gameState === "mainMenu" && mouseX > width/4.8 && mouseX < width/3.5 && mouseY > height/1.7 && mouseY < height/1.3) {
    clickSound.play();
    if (plotPlayed === false) {
      gameState = "plot";
    }
    else {
      gameState = "gameplay";
    }
  }

  // If win screen home button is pressed
  if (winScreenState === true && dist(width/2.2, height/2, mouseX, mouseY) <= homeButtonSize/2) {
    reload();
    gameState = "mainMenu";
    clickSound.play();
  }
  else if (winScreenState === true && dist(width/1.8, height/2, mouseX, mouseY) <= retryButtonSize/2) {
    clickSound.play();
    reload();
  }
}

function music() { // Plays all the music in the game
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
    // Background Image and Logo Image with Scaling
    imageMode(CORNER);
    image(menuBackgroundImage, 0, 0, 1534 * width/1534, 1018 * width/1534);
    image(titleImage, width/8, height/8, 672 * width/1920, 290 * width/1920);

    // Buttons that check if the mouse is within a certain area
    push();
    if (mouseX > width/4.8 && mouseX < width/3.5 && mouseY > height/1.7 && mouseY < height/1.3) {
      image(playButtonDepressedImage, width/4.8, height/1.7, 300 * 0.5 * width/1920, 312 * 0.5 * width/1920);
    }
    else {
      image(playButtonImage, width/4.8, height/1.7, 300 * 0.5 * width/1920, 312 * 0.5 * width/1920);
    }
    pop();
  }
  imageMode(CENTER);
}

function reload() { // Reloads the level
  crocodile.winMet = false; // Resets the crocodile
  for (let cell of groundCells) { // Deletes all ground colliders
    World.remove(engine.world, cell.body);
  }
  for (let circle of circles) { // Deletes all circle colliders
    World.remove(engine.world, circle.body);
  }
  
  // Resets both water and ground arrays
  circles = [];
  groundCells = [];

  // Generates the world/level
  generateGrid();
}

function tutorial() { // Renders the little hand moving up and down as a quick tutorial
  if (tutorialState) {
    fill("white");
    image(gloveCursorImage, width/2, height/3 + sin(frameCount * 0.05) * height/8, 50, 50);
  }
}

function plot() { // Establishes the premise of the game by rendering an image and text
  if (gameState === "plot") {
    if (plotPlayed === false) {
      // Image of plot
      image(plotImage, width/2, height/2, width/1920 * 892 * 1.5, width/1920 * 500 * 1.5);

      // Text
      fill("white");
      textFont("comic sans ms");
      textSize(width/1920 * 40);
      textAlign(CENTER);
      textStyle(ITALIC);
      text("• click to continue •", width - width/8, height - height/30 + sin(frameCount * 0.05) * 5); // Text moves up and down
    }
  }
}

function lebronMode() { // Press 'L' for Lebron James Mode
  // Changes most images and sound to Lebron
  if (key === "l" && keyIsPressed) { 
    gloveCursorImage = lebronImage;
    crankyImage = lebronImage;
    backgroundTileImage = lebronImage;
    dirtImage = lebronImage;
    hamburgerButtonImage = lebronImage;
    retryHamburgerImage = lebronImage;
    playButtonImage = lebronImage;
    playButtonDepressedImage = lebronImage;
    menuBackgroundImage = lebronImage;
    winBackgroundImage = lebronImage;
    homeButtonImage = lebronImage;
    titleImage = lebronImage;
    victorySound = lebronSound;
    clickSound = lebronSound;

    menuMusic.stop();
    if (!lebronMusic.isPlaying()) {
      lebronMusic.loop();
    }
  }
}

function touchStarted() { // Mobile Phone Functionality
  // For every touch
  for (let touch of touches) {
    // Set mouse position to touch position to simulate a touch as a mouse button press
    mouseX = touch.x;
    mouseY = touch.y;
    
    if (gameState === "gameplay") { // Remove the tutorial hand when player begins playing
      tutorialState = false;
    }

    if (gameState === "plot") {
      plotPlayed = true;
      gameState = "gameplay";
    }

    // If button is clicked toggle dropdown menu with a button for reloading the game
    if (burgerButtonState === "inactive" && mouseX > width - width/20 - burgerButtonSize/2 && mouseX < width - width/20 + burgerButtonSize/2 && mouseY > width/20 - burgerButtonSize/2 && mouseY < width/20 + burgerButtonSize/2) {
      burgerButtonState = "active";
      clickSound.play();
    }
    else if (burgerButtonState === "active" && mouseX > width - width/20 - burgerButtonSize/2 && mouseX < width - width/20 + burgerButtonSize/2 && mouseY > width/20 - burgerButtonSize/2 && mouseY < width/20 + burgerButtonSize/2) {
      burgerButtonState = "inactive";
      clickSound.play();
    }
    else if (burgerButtonState === "active" && mouseX > width - width/20 - retryBurgerButtonSize/2 && mouseX < width - width/20 + retryBurgerButtonSize/2 && mouseY > width/8 - retryBurgerButtonSize/2 && mouseY < width/8 + retryBurgerButtonSize/2) {
      reload();
      clickSound.play();
    }

    // If mouse clicks on play button
    if (gameState === "mainMenu" && mouseX > width/4.8 && mouseX < width/3.5 && mouseY > height/1.7 && mouseY < height/1.3) {
      clickSound.play();
      if (plotPlayed === false) {
        gameState = "plot";
      }
      else {
        gameState = "gameplay";
      }
    }

    // If win screen home button is pressed
    if (winScreenState === true && dist(width/2.2, height/2, mouseX, mouseY) <= homeButtonSize/2) {
      reload();
      gameState = "mainMenu";
      clickSound.play();
    }
    else if (winScreenState === true && dist(width/1.8, height/2, mouseX, mouseY) <= retryButtonSize/2) {
      clickSound.play();
      reload();
    }

    // Terrain Destruction Functionalility
    for (let cell of groundCells) {
      if (cell.body.position.x + cellDestructionRadius > mouseX && mouseX > cell.body.position.x - cellDestructionRadius && cell.body.position.y + cellDestructionRadius > mouseY && mouseY > cell.body.position.y - cellDestructionRadius) {
        groundCells.splice(groundCells.indexOf(cell), 1); // Deletes collider from collider grid array
        World.remove(engine.world, cell.body); // Removes cell from world
        if (!crunchSound.isPlaying()) {
          crunchSound.play();
        }
      }
    }
  }
}