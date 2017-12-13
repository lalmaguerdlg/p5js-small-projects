let grid;

let GRID_SIZE = 5;


function setup() {
	createCanvas(windowWidth, windowHeight);
	let sizeX = floor(windowWidth / GRID_SIZE);
	let sizeY = floor(windowHeight / GRID_SIZE);
	grid = new Grid(sizeY, sizeX, GRID_SIZE);
	//frameRate(15);
	stroke(255);
	strokeWeight(0.5);
	noStroke();
}

function draw() {
	background(56, 64, 79);
	grid.draw();
	grid.update();
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}