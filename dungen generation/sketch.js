const DEBUG_MODE = false;
const TILE_WIDTH = 20;
const TILE_HEIGHT = 20;


let rooms = [];

function randomRange(min, max){
	return (Math.random() * (max - min)) + min;
}

function randomPointAtCircle(cx, cy, rad){
	let randomRad = randomRange(0, rad);
	let t = 2 * Math.PI * Math.random(); 
	let rx = cx + Math.cos(t) * randomRad;
	let ry = cy + Math.sin(t) * randomRad;
	return createVector(rx, ry);
}

function snapGridIndex(value, tileSize){
	return Math.floor( ((value + tileSize - 1) / tileSize) );
}


function snapGridScreen(value, tileSize){
	return Math.floor( ((value + tileSize - 1) / tileSize) ) * tileSize;
}

let vertices = [];
let triangles = [];

let reached = [];

function setup() {
	createCanvas(windowWidth, windowHeight);
	
	// place rooms arround a circle or rectangle;

	const roomCount = 100;
	const minRoomSize = 3;
	const maxRoomSize = 10;
	const cellCountH = Math.floor(windowWidth / TILE_WIDTH);
	const cellCountV = Math.floor(windowHeight / TILE_HEIGHT);
	let placedRooms = 0;
	let attempts = 0;
	const maxAttempts = 50;
	let centerScreen = createVector(windowWidth * 0.5, windowHeight * 0.5);
	let sizeSum = 0;
	let circleLayout = 1;
	while(placedRooms < roomCount) { 
		let room;
		let w = Math.floor( randomRange(minRoomSize, maxRoomSize) );
		let h = Math.floor( randomRange(minRoomSize, maxRoomSize) );
		if(!circleLayout){
			let x = Math.floor( randomRange(1, cellCountH - w - 1) + 1 );
			let y = Math.floor( randomRange(1, cellCountV - h - 1) + 1 );
			room = new Room(x, y, w, h);		
		}
		else{
			let point = randomPointAtCircle(centerScreen.x, centerScreen.y, windowHeight * 0.5);
			point.x = snapGridIndex(point.x, TILE_WIDTH);
			point.y = snapGridIndex(point.y, TILE_HEIGHT);
			room = new Room(point.x, point.y, w, h);	
		}
		let valid = true;
		for(let placedRoom of rooms){
			if(placedRoom.intersectsOrTouches(room)){
				valid = false;
				break;
			}
		}
		if(valid){
			rooms.push(room);
			sizeSum += room.area;
			placedRooms++;
			attempts = 0;
		}else{
			attempts++;
		}
		if(attempts > maxAttempts){
			attempts = 0;
			placedRooms++;
		}
	}
	let sizeMean = sizeSum / rooms.length;
	console.log(sizeMean);
	
	let unreached = [];
	
	// get main rooms and mark them as unreached

	for(let room of rooms){
		if(room.area > (sizeMean * 1.25)){
			unreached.push(room);
		}
	}

	reached.push(unreached[0]);
	unreached.splice(0, 1);

	// generate Minimum Spanning Tree and connection indicies
	
	while(unreached.length > 0) {
		let record = 100000;
		let rIndex = 0;
		let uIndex = 0;
		for(let i = 0; i < reached.length; i++) {
			for(let j = 0; j < unreached.length; j++) {
				let v1 = reached[i].rect.center;
				let v2 = unreached[j].rect.center;
				let d = dist(v1.x, v1.y, 0, v2.x, v2.y, 0);
				if( d < record) {
					record = d;
					rIndex = i;
					uIndex = j;
				}
			}
		}

		let reachedRoom = unreached[uIndex];
		reached.push(unreached[uIndex]);
		vertices.push([reachedRoom.rect.center.x, reachedRoom.rect.center.y]);
		unreached.splice(uIndex, 1);

		connections.push([rIndex, reached.length-1]);
	}


	console.log(rooms.length);
	
	// generate Delaunay Triangulation for more organic connections
	triangles = Delaunay.triangulate(vertices);

	// generate extra connections using Delaunay Triangulation
	const extraConnections = 3;
	let newConnections = 0;
	attempts = 0;
	while(newConnections < extraConnections) {
		let randomEdgeIndex = Math.floor(randomRange(0, triangles.length - 1));
		let roomIndex = triangles[randomEdgeIndex];
		let connectedRoomIndex = triangles[randomEdgeIndex + 1];

		let valid = true;
		for(let connection of connections){
			if(connection[0] == roomIndex && connection[1] == connectedRoomIndex)
				valid = false;
		}
		if(valid){
			connections.push([roomIndex, connectedRoomIndex]);
			newConnections++;
			attempts = 0;	
		}

		if(attempts > maxAttempts){
			attempts = 0;
			newConnections++;
		}else{
			attempts++;
		}
	}


	// Generate hallways with random L shapes, using midpoints between room centers.
	let hallways = [];

	for(let i = 0; i < reached.length; i++) {
		for(let connection of connections){
			if(connection[0] == i || connection[1] == i){
				let A = reached[connection[0]];
				let B = reached[connection[1]];

				let dir = p5.Vector.sub(B.rect.center, A.rect.center);
				let cuadrant = calculateCuadrant(dir);
				let midpoint = createVector((B.rect.center.x + A.rect.center.x) / 2, (B.rect.center.y + A.rect.center.y) / 2);

				if((midpoint.x >= A.rect.top_left.x && midpoint.x <= A.rect.top_right.x) &&
					(midpoint.x >= B.rect.top_left.x && midpoint.x <= B.rect.top_right.x)) {
					let start = createVector(midpoint.x, A.rect.center.y);
					let end = createVector(midpoint.x, B.rect.center.y);
					hallways.push([start, end]);
				}
				else if ((midpoint.y >= A.rect.top_left.y && midpoint.y <= A.rect.bottom_left.y) &&
					(midpoint.y >= B.rect.top_left.y && midpoint.y <= B.rect.bottom_left.y)) {
					let start = createVector(A.rect.center.x, midpoint.y);
					let end = createVector(B.rect.center.x, midpoint.y);
					hallways.push([start, end]);
				}else{
					let randLshape = Math.round(Math.random());
					let start = A.rect.center.copy();
					let end = B.rect.center.copy();
					let joint = randLshape == 0 ? createVector(A.rect.center.x, B.rect.center.y) : createVector(B.rect.center.x, A.rect.center.y);
					hallways.push([start, joint]);
					hallways.push([joint, end]);

				}
			}
		}
	}

	// Add rooms that touch the hallways to final room selection;
	let dungeonRooms = [];
	for(let room of rooms){
		for(let hallway of hallways){
			if(room.intersectsLine(hallway[0], hallway[1])) {
				room.color = {
					r: 0,
					g: 255,
					b: 255,
				}
				dungeonRooms.push(room);
			}
		}
	}

	// draw
	clear();
	background(28,31,35);
	for(let room of dungeonRooms){
		room.draw();
	}
/*
	for(let room of rooms){
		room.draw();
	}
*/
	/*
	stroke(255, 255, 0);
	strokeWeight(3);
	fill(0, 255, 0);

	
	// draw connections an centers
	for(let connection of connections){
		let v1 = reached[connection[0]].rect.center;
		let v2 = reached[connection[1]].rect.center;
		line(v1.x * TILE_WIDTH, v1.y * TILE_HEIGHT, v2.x * TILE_WIDTH, v2.y * TILE_HEIGHT);
	}
	for(let reachedRoom of reached){
		ellipse(reachedRoom.rect.center.x * TILE_WIDTH, reachedRoom.rect.center.y * TILE_HEIGHT, 10, 10);
	}
	*/

	/*
	// draw triangles
	stroke(255);
	strokeWeight(0.2);
	for(let i = triangles.length; i > 1; ) {
		--i;
		let v1 = vertices[triangles[i]];
		let v2 = vertices[triangles[i-1]];
		line(v1[0] * TILE_WIDTH, v1[1] * TILE_HEIGHT, v2[0] * TILE_WIDTH, v2[1] * TILE_HEIGHT);
	}
	*/

	// draw midpoints
	/*
	fill(255);
	let midpointRad = 5;
	for(let i = 0; i < reached.length; i++) {
		stroke(255, 0, 0);
		strokeWeight(0.3);
		for(let connection of connections){
			if(connection[0] == i || connection[1] == i){
				let A = reached[connection[0]];
				let B = reached[connection[1]];

				let dir = p5.Vector.sub(B.rect.center, A.rect.center);
				let cuadrant = calculateCuadrant(dir);

				let midpoint = createVector((B.rect.center.x + A.rect.center.x) / 2, (B.rect.center.y + A.rect.center.y) / 2);

				noStroke();
				

				if((midpoint.x >= A.rect.top_left.x && midpoint.x <= A.rect.top_right.x) &&
					(midpoint.x >= B.rect.top_left.x && midpoint.x <= B.rect.top_right.x)){
						// horizontal midpoint
					fill(0, 0, 255);
				}
				else if ((midpoint.y >= A.rect.top_left.y && midpoint.y <= A.rect.bottom_left.y) &&
					(midpoint.y >= B.rect.top_left.y && midpoint.y <= B.rect.bottom_left.y)) {
						//vertical midpoint
					fill(255, 0, 0);
				}else{
					// L shape midpoint
					fill(255, 255, 255);
					if(cuadrant == 1) { 
						stroke(0, 0, 0);
						strokeWeight(5);
					}
				}
				// midpoint
				ellipse(midpoint.x * TILE_WIDTH, midpoint.y* TILE_HEIGHT, midpointRad, midpointRad);
			}
		}
	}
		*/

	// draw hallways
	for(let hallway of hallways){
		stroke(0,  255, 255);
		strokeWeight(5);
		line(hallway[0].x * TILE_WIDTH, hallway[0].y * TILE_HEIGHT, hallway[1].x * TILE_WIDTH, hallway[1].y * TILE_HEIGHT);
	}
}

function calculateCuadrant(vec){
	let result;
	if(vec.x >= 0 && vec.y >= 0) result = 4;
	else if(vec.x < 0 && vec.y >= 0) result = 3;
	else if(vec.x < 0 && vec.y < 0) result = 2;
	else if(vec.x >= 0 && vec.y < 0) result = 1;
	return result;
}

let connections = [];

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function update(){

}

function draw() {

}

function mousePressed(){
    
}

function mouseReleased(){
    
}
