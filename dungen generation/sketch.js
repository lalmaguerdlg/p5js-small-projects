const DEBUG_MODE = false;
const TILE_SIZE = 10;


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

let grid;

let dungeon;

function setup() {
	createCanvas(windowWidth, windowHeight);
	
	// place rooms arround a circle or rectangle;
	

	const roomCount = 100;
	const minRoomSize = 5;
	const maxRoomSize = 20;
	const hallwayStroke = 3;
	const cellCountH = Math.floor(windowWidth / TILE_SIZE);
	const cellCountV = Math.floor(windowHeight / TILE_SIZE);
	let placedRooms = 0;
	let attempts = 0;
	const maxAttempts = 50;
	let centerScreen = createVector(windowWidth * 0.5, windowHeight * 0.5);
	let sizeSum = 0;
	let circleLayout = 1;

	//dungeon = new Dungeon(cellCountH, cellCountV);
	//dungeon.generate(minRoomSize, maxRoomSize, hallwayStroke);

	while(placedRooms < roomCount) { 
		let room;
		let w = Math.floor( randomRange(minRoomSize, maxRoomSize) );
		let h = Math.floor( randomRange(minRoomSize, maxRoomSize) );
		if(!circleLayout){
			let x = Math.floor( randomRange(1, cellCountH - w - 1) + 1 );
			let y = Math.floor( randomRange(1, cellCountV - h - 1) + 1 );
			room = new Room(x, y, w, h, TILE_SIZE);		
		}
		else{
			let point = randomPointAtCircle(centerScreen.x, centerScreen.y, windowHeight * 0.5);
			point.x = snapGridIndex(point.x, TILE_SIZE);
			point.y = snapGridIndex(point.y, TILE_SIZE);
			room = new Room(point.x, point.y, w, h, TILE_SIZE);	
		}
		let valid = true;
		for(let placedRoom of rooms){
			if(placedRoom.rect.intersectsOrTouches(room.rect)){
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

	let grid = new Grid(cellCountH, cellCountV);

	for(let i = 0; i < reached.length; i++) {
		for(let connection of connections){
			if(connection[0] == i || connection[1] == i){
				let A = reached[connection[0]];
				let B = reached[connection[1]];

				let dir = p5.Vector.sub(B.rect.center, A.rect.center);
				let cuadrant = calculateCuadrant(dir);
				let midpoint = createVector((B.rect.center.x + A.rect.center.x) / 2, (B.rect.center.y + A.rect.center.y) / 2);
				midpoint.x = Math.floor(midpoint.x);
				midpoint.y = Math.floor(midpoint.y);

				if((midpoint.x >= A.rect.top_left.x && midpoint.x <= A.rect.top_right.x) &&
					(midpoint.x >= B.rect.top_left.x && midpoint.x <= B.rect.top_right.x)) {
					let start = createVector(midpoint.x, Math.floor(A.rect.center.y));
					let end = createVector(midpoint.x, Math.floor(B.rect.center.y));
					hallways.push([start, end]);
				}
				else if ((midpoint.y >= A.rect.top_left.y && midpoint.y <= A.rect.bottom_left.y) &&
					(midpoint.y >= B.rect.top_left.y && midpoint.y <= B.rect.bottom_left.y)) {
					let start = createVector(Math.floor(A.rect.center.x), midpoint.y);
					let end = createVector(Math.floor(B.rect.center.x), midpoint.y);
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
	//console.log(cellCountH);
	//console.log(cellCountV);
	let dungeonRooms = [];
	for(let room of rooms){
		for(let hallway of hallways){
			if(room.rect.intersectsLine(hallway[0], hallway[1])) {
				room.color = {
					r: 0,
					g: 255,
					b: 255,
				}
				grid.carveRect(room.rect);
				dungeonRooms.push(room);
			}
		}
	}
	clear();
	background(28,31,35);

	for(let hallway of hallways) {
		grid.carveLine(hallway[0], hallway[1], hallwayStroke);
	}
	// draw
/*
	for(let room of dungeonRooms){
		room.draw();
	}
*/
	grid.draw(TILE_SIZE);
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
		line(v1.x * TILE_SIZE, v1.y * TILE_SIZE, v2.x * TILE_SIZE, v2.y * TILE_SIZE);
	}
	for(let reachedRoom of reached){
		ellipse(reachedRoom.rect.center.x * TILE_SIZE, reachedRoom.rect.center.y * TILE_SIZE, 10, 10);
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
		line(v1[0] * TILE_SIZE, v1[1] * TILE_SIZE, v2[0] * TILE_SIZE, v2[1] * TILE_SIZE);
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
				ellipse(midpoint.x * TILE_SIZE, midpoint.y* TILE_SIZE, midpointRad, midpointRad);
			}
		}
	}
		*/

	// draw hallways
	/*
	for(let hallway of hallways){
		stroke(0,  255, 255);
		strokeWeight(2);
		line(hallway[0].x * TILE_SIZE, hallway[0].y * TILE_SIZE, hallway[1].x * TILE_SIZE, hallway[1].y * TILE_SIZE);
	}
	*/
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
