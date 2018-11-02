
class Dungeon {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.rooms = [];
		this.mainRooms = [];
		this.hallways = [];
		this.connections = [];
		this.grid = new Grid(width, height);
		this.useCircleLayout = true;
		this.extraConnections = 3;
	}

	generate(minRoomSize, maxRoomSize, hallwayStroke) {
		let randomRooms = this._placeRooms(minRoomSize, maxRoomSize);
		this.connections = this._connectRooms(this.extraConnections);

		this.hallways = this._generateHallways(this.connections);
		this.rooms = this._intersectRooms(randomRooms);

		this._carveGrid(hallwayStroke);
	}

	draw(tileSize){
		// debug rendering
		/*for(let room of this.rooms){
			room.draw();
		}

		fill(255, 0, 0);
		for(let room of this.mainRooms){
			room.draw();
		}

		stroke(0,  255, 255);
		strokeWeight(2);
		
		for(let hallway of this.hallways){
			stroke(0,  255, 255);
			strokeWeight(2);
			line(hallway[0].x * TILE_SIZE, hallway[0].y * TILE_SIZE, hallway[1].x * TILE_SIZE, hallway[1].y * TILE_SIZE);
		}

		for(let connection of this.connections){
			let v1 = this.mainRooms[connection[0]].rect.center;
			let v2 = this.mainRooms[connection[1]].rect.center;
			line(v1.x * TILE_SIZE, v1.y * TILE_SIZE, v2.x * TILE_SIZE, v2.y * TILE_SIZE);
		}
		for(let reachedRoom of this.mainRooms){
			ellipse(reachedRoom.rect.center.x * TILE_SIZE, reachedRoom.rect.center.y * TILE_SIZE, 10, 10);
		}*/

		this.grid.draw(tileSize);
	}

	_placeRooms(minRoomSize, maxRoomSize){
		const roomCount = 100;
		let placedRooms = 0;
		let attempts = 0;
		const maxAttempts = 50;
		let centerScreen = createVector(windowWidth * 0.5, windowHeight * 0.5);
		let sizeSum = 0;

		let rooms = [];

		while(placedRooms < roomCount) { 
			let room;
			let w = Math.floor( randomRange(minRoomSize, maxRoomSize) );
			let h = Math.floor( randomRange(minRoomSize, maxRoomSize) );
			if(this.useCircleLayout) {
				let point = randomPointAtCircle(centerScreen.x, centerScreen.y, windowHeight * 0.5);
				point.x = snapGridIndex(point.x, TILE_SIZE);
				point.y = snapGridIndex(point.y, TILE_SIZE);
				room = new Room(point.x, point.y, w, h, TILE_SIZE);
			}
			else{	
				let x = Math.floor( randomRange(1, this.width - w - 1) + 1 );
				let y = Math.floor( randomRange(1, this.height - h - 1) + 1 );
				room = new Room(x, y, w, h, TILE_SIZE);		
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
		// get main rooms and mark them as unreached
		for(let room of rooms){
			if(room.area > (sizeMean * 1.25)){
				this.mainRooms.push(room);
			}
		}
		return rooms;
	}

	_connectRooms(extraConnections) {
		let unreached = this.mainRooms.slice();
		let reached = [];
		reached.push(unreached[0]);
		unreached.splice(0, 1);

		let connections = [];
		let vertices = [];
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

		// TODO: Esto se hace asi debido a que unreached y reached manejan las habitaciones, esto hace que los indices de las conexiones se desordenen.
		// implementar que en lugar de copiar el arreglo de habitaciones, usar un arreglo de indices, para mejor uso.
		this.mainRooms = reached.slice();

		triangles = Delaunay.triangulate(vertices);

		// generate extra connections using Delaunay Triangulation
		let newConnections = 0;
		let attempts = 0;
		let maxAttempts = 50;
		while(newConnections < extraConnections) {
			let randomEdgeIndex = Math.floor(randomRange(0, triangles.length - 1));
			let roomIndex = triangles[randomEdgeIndex];
			let connectedRoomIndex = triangles[randomEdgeIndex + 1];
	
			let valid = true;
			/*for(let connection of connections){
				if(connection[0] == roomIndex && connection[1] == connectedRoomIndex)
					valid = false;
			}*/
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

		return connections;
	}

	_generateHallways(connections){
		
		// Generate hallways with random L shapes, using midpoints between room centers.
		let hallways = [];

		for(let i = 0; i < this.mainRooms.length; i++) {
			for(let connection of connections){
				if(connection[0] == i || connection[1] == i){
					let A = this.mainRooms[connection[0]];
					let B = this.mainRooms[connection[1]];

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
		return hallways;
	}

	_intersectRooms(rooms){
		let dungeonRooms = [];
		for(let room of rooms){
			for(let hallway of this.hallways){
				if(room.rect.intersectsLine(hallway[0], hallway[1])) {
					room.color = {
						r: 0,
						g: 255,
						b: 255,
					}
					dungeonRooms.push(room);
				}
			}
		}
		return dungeonRooms;
	}

	_carveGrid(hallwayStroke){
		for(let room of this.rooms) {
			this.grid.carveRect(room.rect);
		}
		for(let hallway of this.hallways) {
			this.grid.carveLine(hallway[0], hallway[1], hallwayStroke);
		}
	}

}
