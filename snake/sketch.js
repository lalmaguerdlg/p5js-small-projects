let GRID_SIZE = 20;
let snake;
let food;
function setup() {
	createCanvas(windowWidth, windowHeight);
	let x = floor((windowWidth * 0.5) / GRID_SIZE);
	let y = floor((windowHeight * 0.5) / GRID_SIZE);
	snake = new Snake(x * GRID_SIZE, y * GRID_SIZE);
	frameRate(10);
	food = pickLocation();
	noStroke();
}

function draw() {
	background(56, 64, 79);
	let foodEaten = snake.eat(food);
	if(foodEaten)
		food = pickLocation();

	snake.update();
	snake.draw();

	fill(255, 0, 0);
	rect(food.x, food.y, GRID_SIZE, GRID_SIZE);
}

function pickLocation(){
	let randX = floor(floor(random(windowWidth)) / GRID_SIZE);
	let randY = floor(floor(random(windowHeight)) / GRID_SIZE);
	let x = randX * GRID_SIZE;
	let y = randY * GRID_SIZE;
	let location = createVector(x, y);
	return location;
}

function keyPressed(){
	switch(keyCode){
		case UP_ARROW:
			snake.changeDirection("UP");
		break;
		case RIGHT_ARROW:
			snake.changeDirection("RIGHT");
		break;
		case DOWN_ARROW:
			snake.changeDirection("DOWN");
		break;
		case LEFT_ARROW:
			snake.changeDirection("LEFT");
		break;
		case 32:
			snake.eat(snake.pos);
		break;
	}
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
}