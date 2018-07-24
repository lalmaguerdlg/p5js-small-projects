const DEBUG = {
	enabled: true,
	show_quadtree: true,
	show_quadrants: true,
	show_mouse_region: true,
	show_point_count: true
}
var QUERY_METHOD = 2;
let qtree;
let last_mouse;
let mouse;
let mouse_circle;
let frameCounter = 0;
let frame_sum = 0;

function setup() {
	createCanvas(windowWidth, windowHeight);
	let boundary = new Rectangle(windowWidth * .5, windowHeight * .5, windowWidth * .5, windowHeight * .5)
	qtree = new QuadTree(boundary, 10, 8);
	last_mouse = new Point(0, 0);
	mouse = new Point(0, 0);
	mouse_circle = new Circle(0, 0, 70);
	//mouse_circle = new Rectangle(0, 0, 70, 70);
	for(let i = 0; i < 1000; i++){
		let p = new Point((random() * windowWidth), (random() * windowHeight));
		qtree.insert(p);
	}
	console.log(qtree);
	rectMode(CENTER);
}

let fps = 0;
function draw() {
	background(56, 64, 79);
	frame_sum += frameRate();
	frameCounter++;
	if(frameCounter == 30){
		fps = frame_sum / frameCounter;
		frame_sum = 0;
		frameCounter = 0;
	}
	textSize(32);
	noStroke();
	fill(255, 255, 255);
	text('FPS: ' + fps.toFixed(2), 10, 30);

	if(mouseIsPressed){
		mouse.x = mouseX;
		mouse.y = mouseY;
		if(mouse.x != last_mouse.x && mouse.y != last_mouse.y){
			let result = false;
			for(let i = 0; i < 5; i++){
				let p = new Point(mouseX + (random() * 20), mouseY + (random() * 20));
				result = qtree.insert(p);
				if(!result){
					console.log("Not enough space for more points or point out of bounce");
				}
			}
		}
		last_mouse.x = mouse.x;
		last_mouse.y = mouse.y;
		//mouseIsPressed = false;
	}

	mouse_circle.x = mouseX;
	mouse_circle.y = mouseY;
	
	let search;
	let queried_points;

	if(QUERY_METHOD == 1){
		DEBUG.show_mouse_region = true;
		DEBUG.show_quadrants = true;
		search = qtree.querySections(mouse_circle);
		queried_points = search.get_points();
	}else if(QUERY_METHOD == 2){
		DEBUG.show_mouse_region = true;
		DEBUG.show_quadrants = false;
		queried_points = qtree.query(mouse_circle);
	}
	//let queried_points = qtree.queryPoints(mouse_circle);
	if(DEBUG.enabled && DEBUG.show_quadtree){
		drawQuadTree(qtree);
	}

	if(DEBUG.enabled && DEBUG.show_quadrants){
		for(let qt of search.collection){
			fill(50, 150, 50, 100);
			noStroke();
			drawRect(qt.boundary);
		}
		
	}

	if(DEBUG.enabled && DEBUG.show_mouse_region){
		fill(150, 50, 50, 100);
		noStroke();
		drawCircle(mouse_circle);
		
	}

	if(DEBUG.enabled && DEBUG.show_point_count){
		console.log(queried_points.length + ' of ' + qtree.count());
	}

	for (let p of queried_points) {
		strokeWeight(3);
		stroke(255, 0, 0);
		point(p.x, p.y);
	}
	//drawRect(mouse_circle);
	

}

function drawQuadTree(quadtree){
	noFill();
	strokeWeight(0.5);
	stroke(255);
	
	if(quadtree.subdivided){
		drawQuadTree(quadtree.sections.northwest);
		drawQuadTree(quadtree.sections.northeast);
		drawQuadTree(quadtree.sections.southeast);
		drawQuadTree(quadtree.sections.southwest);
	}else{
		drawRect(quadtree.boundary);
	}
	
	for(let p of quadtree.points){
		strokeWeight(1);
		point(p.x, p.y);
	}
}

function drawCircle(circle){
	ellipse(circle.x, circle.y, circle.rad * 2, circle.rad * 2);
}

function drawRect(rectangle){
	rect(rectangle.x, rectangle.y, rectangle.width * 2, rectangle.height * 2);
}

function windowResized() {
	resizeCanvas(windowWidth, windowHeight);
}