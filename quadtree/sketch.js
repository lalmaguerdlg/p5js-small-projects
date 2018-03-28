let qtree;
let last_mouse;
let mouse;
let mouse_circle;
function setup() {
	createCanvas(windowWidth, windowHeight);
	let boundary = new Rectangle(windowWidth * .5, windowHeight * .5, windowWidth * .5, windowHeight * .5)
	qtree = new QuadTree(boundary, 10, 8);
	last_mouse = new Point(0, 0);
	mouse = new Point(0, 0);
	mouse_circle = new Circle(0, 0, 70);
	//mouse_circle = new Rectangle(0, 0, 70, 70);
	console.log(qtree);
}



function draw() {
	background(56, 64, 79);
	if(mouseIsPressed){
		mouse.x = mouseX;
		mouse.y = mouseY;
		if(mouse.x != last_mouse.x && mouse.y != last_mouse.y){
			let result = false;
			for(let i = 0; i < 1; i++){
				let p = new Point(mouseX + (random() * 10), mouseY + (random() * 10));
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

	

	drawQuadTree(qtree);
	
	mouse_circle.x = mouseX;
	mouse_circle.y = mouseY;
	let search = qtree.query(mouse_circle);
	for(let qt of search.collection){
		fill(50, 150, 50, 100);
		noStroke();
		drawRect(qt.boundary);
	}

	let queried_points = search.get_points();
	console.log(queried_points.length + ' of ' + qtree.count());
	for (let p of queried_points) {
		strokeWeight(3);
		stroke(255, 0, 0);
		point(p.x, p.y);
	}
	//drawRect(mouse_circle);
	fill(150, 50, 50, 100);
	noStroke();
	drawCircle(mouse_circle);

}

function drawQuadTree(quadtree){
	noFill();
	strokeWeight(0.5);
	stroke(255);
	rectMode(CENTER);
	
	
	if(quadtree.subdivided){
		drawQuadTree(quadtree.sections.northwest);
		drawQuadTree(quadtree.sections.northeast);
		drawQuadTree(quadtree.sections.southeast);
		drawQuadTree(quadtree.sections.southwest);
	}else{
		//rect(quadtree.boundary.x, quadtree.boundary.y, quadtree.boundary.width * 2 - 1, quadtree.boundary.height * 2 - 1);\
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