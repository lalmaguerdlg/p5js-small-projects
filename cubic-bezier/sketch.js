let start = 0;

let currentShape = 0;
let shapes = new Array();

let isModifingShape = false;
let creatingShape = false;

let mouseRad = 5;
let editingPoint = 0;

const tool = {
	index: 0,
	name: "",
	ref: null,
}

let tools;

function setup() {
	createCanvas(windowWidth, windowHeight);
	tools = [
		{"Move tool": new MoveTool(mouseRad, shapes)},
		{"Shape tool": new ShapeTool(mouseRad, shapes)},
	];

	changeTool(0);
}

function draw() {
	clear();
	background(56, 64, 79);

	textSize(12);
	fill(255);
	strokeWeight(0);
	text(tool.name, 50, 50);
	tool.ref.update();
	tool.ref.draw();
	
	if(shapes.length > 0){
		
		for(s of shapes){
			s.draw();
		}
	}
}

function keyPressed() {
	switch(keyCode){
		case 49:
			changeTool(0);
		break;
		case 50:
			changeTool(1);
		break;
		default:
		break;
	}
		
}

function changeTool(index){
	tool.index = index;
	tool.name = Object.keys( tools[index] )[0];
	tool.ref = Object.values(tools[index])[0];
}

function mousePressed(){
	tool.ref.mousePressedCallback(mouseButton);
}

function mouseReleased(){
	tool.ref.mouseReleasedCallback(mouseButton);
}

function mouseMoved(){
	tool.ref.mouseMovedCallback();
}

function mouseDragged(){
	tool.ref.mouseDraggedCallback(mouseButton);
}


function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
}