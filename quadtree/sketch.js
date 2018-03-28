let qtree;
let last_mouse;
let mouse;
function setup() {
	createCanvas(windowWidth, windowHeight);
	let boundary = new Rectangle(windowWidth * .5, windowHeight * .5, windowWidth * .5, windowHeight * .5)
	qtree = new QuadTree(boundary, 1, 9);
	last_mouse = new Point(0, 0);
	mouse = new Point(0, 0);
	console.log(qtree);
}



function draw() {
	background(56, 64, 79);
	if(mouseIsPressed){
		mouse.x = mouseX;
		mouse.y = mouseY;
		if(mouse.x != last_mouse.x && mouse.y != last_mouse.y){
			let result = false;
			for(let i = 0; i < 5; i++){
				let p = new Point(mouseX + (random() * 10), mouseY + (random() * 10));
				result = qtree.insert(p);
				if(!result){
					console.log("Not enough space for more points or point out of bounce");
				}
			}
			if(result){
				console.log(qtree.count());
			}
		}
		last_mouse.x = mouse.x;
		last_mouse.y = mouse.y;
		//mouseIsPressed = false;
	}
	drawQuadTree(qtree);
	
}

function drawQuadTree(quadtree){
	noFill();
	strokeWeight(0.5);
	stroke(255);
	rectMode(CENTER);
	
	rect(quadtree.boundary.x, quadtree.boundary.y, quadtree.boundary.width * 2 - 1, quadtree.boundary.height * 2 - 1);
	if(quadtree.subdivided){
		drawQuadTree(quadtree.sections.northwest);
		drawQuadTree(quadtree.sections.northeast);
		drawQuadTree(quadtree.sections.southeast);
		drawQuadTree(quadtree.sections.southwest);
	}
	
	for(let p of quadtree.points){
		strokeWeight(1);
		point(p.x, p.y);
	}
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}