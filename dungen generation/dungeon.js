class DungeonTile{
	constructor(x, y, index, isRoom) {
		this.pos = createVector(x, y);
		this.index = index;
		this.isRoom = isRoom;
		this.hasLight = false;
	}
}

class DungeonHallway{
	constructor(id, start, end, startIndex, endIndex) {
		this.id = 0;
		this.start = start;
		this.end = end;
		this.rooms = {
			start: startIndex,
			end: endIndex,
			extra: []
		}
		this.color = {
			r: randomRange(127, 255),
			g: randomRange(127, 255),
			b: randomRange(127, 255),
		}

		if(end.y == start.y) {
			this.type = 0;
		}
		else {
			this.type = 1;
		}

		this.grid;
		this.gridRect;
	}

	
	forechTile(callback) {
		if(this.gridRect){
			let startPos = this.gridRect.top_left;
			let endPos = this.gridRect.bottom_right;
			for(let i = startPos.y; i < endPos.y; i++){
				for(let j = startPos.x; j < endPos.x; j++){
					callback(this.grid.getTile(j, i));
				}
			}
		}
	}
}

class DungeonRoom {
	constructor(x, y, w, h, tileSize) {
		this.id = 0;
		this.isMain = false;
		this.rect = new Rect(x, y, w, h);
		this.tileSize = tileSize;
		this.screenPos = createVector(x * this.tileSize, y * this.tileSize);
		this.screenSize = createVector(w * this.tileSize, h * this.tileSize);
		this.color = {
			r: randomRange(127, 255),
			g: randomRange(127, 255),
			b: randomRange(127, 255),
		}
		this.grid;
		this.gridRect;
	}

	forechTile(callback) {
		if(this.gridRect){
			let startPos = this.gridRect.top_left;
			let endPos = this.gridRect.bottom_right;
			for(let i = startPos.y; i < endPos.y; i++){
				for(let j = startPos.x; j < endPos.x; j++){
					callback(this.grid.getTile(j, i));
				}
			}
		}
	}

	draw(){
		fill(this.color.r, this.color.g, this.color.b);
        noStroke();
		rect(this.screenPos.x, this.screenPos.y, this.screenSize.x, this.screenSize.y);
	}

	get sizeRatio(){
		let ratio = 0;
		if(this.rect.height > this.rect.width)
			ratio = this.rect.height / this.rect.width; 
		else
			ratio = this.rect.width / this.rect.height; 
		return ratio;
	}

	get area(){
		return this.rect.width * this.rect.height;
	}
}

class Dungeon {
	constructor(width, height) {
		this.width = width;
		this.height = height;

		this.rooms = [];
		this.mainRooms = [];
		this.hallways = [];
		this.debug_info = {
			connections: [],
			triangles: [],
			enable: false,
		}

		this.bounds;
		this.grid; //= new Grid(this.width, this.height);

		this.properties = {
			circleLayout: {
				enable: true,
				radious: this.height * 0.5,
			},
			extraConnections: 3,
			maxRandomAttempts: 50
		}

		this._cached = {
			nextRoomId: 0,
			nextHallwayId: 0
		}
	}

	generate(minRoomSize, maxRoomSize, hallwaySize) {
		const roomCount = 100;
		let placedRooms = this._placeRooms(minRoomSize, maxRoomSize, roomCount);

		this.mainRooms = this._calculateMainRooms(placedRooms, 1.25);
		let connections = this._connectRooms(this.mainRooms, this.properties.extraConnections);
		this.debug_info.connections = connections;

		this.hallways = this._generateHallways(this.mainRooms, connections);
		this.rooms = this.mainRooms.concat( this._intersectRooms(placedRooms.rooms, this.hallways) );

		this.bounds = this._calculateDungeonBounds(this.rooms);

		this.grid = new Grid(this.bounds.width, this.bounds.height);

		this._carveGrid(this.grid, this.bounds, hallwaySize);
		this._placeLights(this.grid, this.bounds, hallwaySize);
	}

	draw(tileSize){
		if(this.debug_info.enable){
			fill(255, 0, 0);
			for(let room of this.rooms){
				room.draw();
			}

			stroke(0,  255, 255);
			strokeWeight(2);
			
			for(let hallway of this.hallways){
				stroke(0,  255, 255);
				strokeWeight(2);
				line(hallway.start.x * TILE_SIZE, hallway.start.y * TILE_SIZE, hallway.end.x * TILE_SIZE, hallway.end.y * TILE_SIZE);
			}
			
			for(let connection of this.debug_info.connections){
				stroke(0,  255, 0);
				let v1 = this.mainRooms[connection[0]].rect.center;
				let v2 = this.mainRooms[connection[1]].rect.center;
				line(v1.x * TILE_SIZE, v1.y * TILE_SIZE, v2.x * TILE_SIZE, v2.y * TILE_SIZE);
			}
			for(let reachedRoom of this.mainRooms){
				ellipse(reachedRoom.rect.center.x * TILE_SIZE, reachedRoom.rect.center.y * TILE_SIZE, 10, 10);
			}

			noFill();
			stroke(255);
			strokeWeight(5);
			rect(this.bounds.pos.x * TILE_SIZE, this.bounds.pos.y * TILE_SIZE, this.bounds.width * TILE_SIZE, this.bounds.height * TILE_SIZE);
		}

		
		for(let tile of this.grid.tiles) {
			stroke(255, 255, 255);
			strokeWeight(1);
			if(tile != 0) {
				if(tile.isRoom){
					let room = this.rooms[tile.index];
					fill(room.color.r, room.color.g, room.color.b);
				}
				else{
					let hallway = this.hallways[tile.index];
					fill(hallway.color.r, hallway.color.g, hallway.color.b);
				}
				if(tile.hasLight){
					fill(0, 255, 0);
				}

				rect(tile.pos.x * TILE_SIZE, tile.pos.y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
			}
		}

		//this.grid.draw(tileSize);
	}

	get _nextRoomId() {
		let result = this._cached.nextRoomId++;
		return result;
	}

	get _nextHallwayId() {
		let result = this._cached.nextHallwayId++;
		return result;
	}

	_placeRooms(minRoomSize, maxRoomSize, maxRoomCount){
		let placedRooms = 0;
		let attempts = 0;
		let center = createVector(this.width * 0.5, this.height * 0.5);
		let sizeSum = 0;

		let rooms = [];

		while(placedRooms < maxRoomCount) { 
			let room;
			let w = Math.floor( randomRange(minRoomSize, maxRoomSize) );
			let h = Math.floor( randomRange(minRoomSize, maxRoomSize) );
			if(this.properties.circleLayout.enable) {
				let point = randomPointAtCircle(center.x, center.y, this.properties.circleLayout.radious );
				point.x = Math.floor(point.x);
				point.y = Math.floor(point.y);
				room = new DungeonRoom(point.x, point.y, w, h, TILE_SIZE);
			}
			else{	
				let x = Math.floor( randomRange(1, this.width - w - 1) + 1 );
				let y = Math.floor( randomRange(1, this.height - h - 1) + 1 );
				room = new DungeonRoom(x, y, w, h, TILE_SIZE);		
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
			} else {
				attempts++;
			}

			if(attempts > this.properties.maxRandomAttempts){
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

		return {rooms, sizeMean};
	}

	_calculateMainRooms(placedRooms, meanWeight){
		let mainRooms = [];

		let index = 0;
		for(let room of placedRooms.rooms) {
			if(room.area >= (placedRooms.sizeMean * meanWeight)){
				room.id = this._nextRoomId;
				room.isMain = true;
				mainRooms.push(room);
			}
		}

		return mainRooms;
	}

	_connectRooms(rooms, extraConnections) {
		let unreached = [];
		for(let i = 0; i < rooms.length; i++){
			unreached.push(i);
		}
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
					let v1 = rooms[reached[i]].rect.center;
					let v2 = rooms[unreached[j]].rect.center;
					let d = dist(v1.x, v1.y, 0, v2.x, v2.y, 0);
					if( d < record) {
						record = d;
						rIndex = i;
						uIndex = j;
					}
				}
			}
	
			let reachedRoom = rooms[unreached[uIndex]];
			reached.push(unreached[uIndex]);
			vertices.push([reachedRoom.rect.center.x, reachedRoom.rect.center.y]);
			unreached.splice(uIndex, 1);

			connections.push([reached[rIndex], reached[reached.length-1]]);
		}

		let triangles = Delaunay.triangulate(vertices);
		this.debug_info.triangles = triangles;

		// generate extra connections using Delaunay Triangulation
		let newConnections = 0;
		let attempts = 0;
		while(newConnections < extraConnections) {
			let randomEdgeIndex = Math.floor(randomRange(0, triangles.length - 1));
			let roomIndex = triangles[randomEdgeIndex];
			let connectedRoomIndex = triangles[randomEdgeIndex + 1];
	
			connections.push([roomIndex, connectedRoomIndex]);
			newConnections++;	
		}

		return connections;
	}

	_generateHallways(rooms, connections){

		// Generate hallways with random L shapes, using midpoints between room centers.
		let hallways = [];
		const boundsDeadZone = 2;
		for(let i = 0; i < rooms.length; i++) {
			for(let connection of connections){
				if(connection[0] == i || connection[1] == i){
					let A = rooms[connection[0]];
					let B = rooms[connection[1]];

					let dir = p5.Vector.sub(B.rect.center, A.rect.center);
					let midpoint = createVector((B.rect.center.x + A.rect.center.x) / 2, (B.rect.center.y + A.rect.center.y) / 2);
					midpoint.x = Math.floor(midpoint.x);
					midpoint.y = Math.floor(midpoint.y);

					if( A.rect.isWithinXBounds(midpoint, boundsDeadZone) && B.rect.isWithinXBounds(midpoint, boundsDeadZone) ) {
						let start = createVector(midpoint.x, midpoint.y > A.rect.center.y ? Math.floor(A.rect.bottom_left.y) : Math.floor(A.rect.top_left.y));
						let end = createVector(midpoint.x, midpoint.y > B.rect.center.y ? Math.floor(B.rect.bottom_left.y) : Math.floor(B.rect.top_left.y));

						hallways.push(new DungeonHallway(this._nextHallwayId, start, end, connection[0], connection[1]));
					}
					else if (A.rect.isWithinYBounds(midpoint, boundsDeadZone) && B.rect.isWithinYBounds(midpoint, boundsDeadZone)) {
						let start = createVector(midpoint.x > A.rect.center.x ? Math.floor(A.rect.top_right.x) : Math.floor(A.rect.top_left.x), midpoint.y);
						let end = createVector(midpoint.x > B.rect.center.x ? Math.floor(B.rect.top_right.x) : Math.floor(B.rect.top_left.x), midpoint.y);
							
						hallways.push(new DungeonHallway(this._nextHallwayId, start, end, connection[0], connection[1]));
					}else{
						let randLshape = Math.round(Math.random());
						let start = A.rect.center.copy();
						let end = B.rect.center.copy();
						let joint = randLshape == 0 ? createVector(A.rect.center.x, B.rect.center.y) : createVector(B.rect.center.x, A.rect.center.y);
						hallways.push(new DungeonHallway(this._nextHallwayId, start, joint, connection[0], connection[1]));
						hallways.push(new DungeonHallway(this._nextHallwayId, joint, end, connection[0], connection[1]));
					}
				}
			}
		}
		return hallways;
	}

	_intersectRooms(rooms, hallways){
		let dungeonRooms = [];
		for(let room of rooms) {
			if(!room.isMain) {
				for(let hallway of hallways) {
					if(room.rect.intersectsLine(hallway.start, hallway.end)) {
						room.color = {
							r: randomRange(100, 125),
							g: randomRange(100, 125),
							b: randomRange(100, 125),
						}
						room.id = this._nextRoomId;
						hallway.rooms.extra.push(room.id);
						dungeonRooms.push(room);
					}
				}
			}
		}
		return dungeonRooms;
	}

	_calculateDungeonBounds(rooms) {
		let min = createVector(100000, 100000);
		let max = createVector(-100000, -100000);
		for(let room of rooms) {
			min.x = Math.min(room.rect.top_left.x, min.x);
			max.x = Math.max(room.rect.top_right.x, max.x);
			
			min.y = Math.min(room.rect.top_left.y, min.y);
			max.y = Math.max(room.rect.bottom_left.y, max.y);
		}
		return new Rect(min.x - 2, min.y - 2, max.x - min.x + 4, max.y - min.y + 4);
	}

	_placeLight(grid, tile) {
		let neighbors = {
			up: 	grid.getTile(tile.pos.x, 	tile.pos.y - 1),
			right: 	grid.getTile(tile.pos.x + 1, tile.pos.y),
			down: 	grid.getTile(tile.pos.x, tile.pos.y + 1),
			left: 	grid.getTile(tile.pos.x - 1, tile.pos.y),
		}

		let neighborHasLight = false;
		let wallCount = 0;
		for(let direction in neighbors) {
			let neighborTile = neighbors[direction];
			if( neighborTile == 0) {
				wallCount++;
			}
			else{
				if(neighborTile.hasLight){
					neighborHasLight = true;
				}
			}
		}

		fill(0, 255, 0);
		if(!neighborHasLight && wallCount > 0) {
			tile.hasLight = true;
		}
	}

	_carveGrid(grid, dungeonBounds, hallwayStroke) {
		const offset = dungeonBounds.pos;

		for(let roomIndex = 0; roomIndex < this.rooms.length; roomIndex++) {
			let room = this.rooms[roomIndex];
			let realPos = p5.Vector.sub(room.rect.pos, offset);
			let limitW = Math.min(grid.width, realPos.x + room.rect.width);
			let limitH = Math.min(grid.height, realPos.y + room.rect.height);
			room.grid = grid;
			room.gridRect = new Rect(realPos.x, realPos.y, room.rect.width, room.rect.height);
			for(let i = realPos.y; i < limitH; i++){
				for(let j = realPos.x; j < limitW; j++){
					let newTile = new DungeonTile(j, i, roomIndex, true);
					grid.tiles[ (i * grid.width ) + j] = newTile;
				}
			}
		}

		for(let hallwayIndex = 0; hallwayIndex < this.hallways.length; hallwayIndex++) {
			let hallway = this.hallways[hallwayIndex];

			let even = (hallwayStroke % 2) == 0;
			let stroke = Math.floor(hallwayStroke * 0.5);
			let minX = Math.floor(Math.min(hallway.start.x - offset.x, hallway.end.x - offset.x));
			let maxX = Math.floor(Math.max(hallway.start.x - offset.x, hallway.end.x - offset.x));
			let minY = Math.floor(Math.min(hallway.start.y - offset.y, hallway.end.y - offset.y));
			let maxY = Math.floor(Math.max(hallway.start.y- offset.y, hallway.end.y - offset.y));
	
			let startX;
			let startY;
			let endX;
			let endY;
	
			if(minX != maxX) {
				startX = minX;
				endX = Math.min(grid.width, maxX);
				startY = minY - stroke;
				endY = Math.min(grid.height, maxY + stroke + (even ? 0 : 1));
			} else {
				startX = minX - stroke;
				endX =  Math.min(grid.width, maxX + stroke + (even ? 0 : 1));
				startY = minY;
				endY = Math.min(grid.height, maxY);	
			}
		
			hallway.grid = grid;
			hallway.gridRect = new Rect(startX, startY, endX - startX, endY - startY);

			for(let i = startY; i < endY; i++) {
				for(let j = startX; j < endX; j++) {
					let tile = grid.getTile(j, i);
					if(tile == 0){
						grid.tiles[ (i * grid.width ) + j ] = new DungeonTile(j, i, hallwayIndex, false); 
					}
					
				}
			}
		}

	}

	_placeLights(grid, spacing) {
		for(let room of this.rooms){
			room.forechTile(tile => {
				if(tile.pos.x == room.gridRect.top_left.x || tile.pos.x == room.gridRect.bottom_right.x - 1) {
					if(((tile.pos.y - room.gridRect.top_left.y) % 4) == 0) {
						this._placeLight(grid, tile);
					}
				}
				if(tile.pos.y == room.gridRect.top_left.y || tile.pos.y == room.gridRect.bottom_right.y - 1) {
					if( ((tile.pos.x - room.gridRect.top_left.x) % 4) == 0){
						this._placeLight(grid, tile);
					}
				}
			})
		}

		for(let hallway of this.hallways) {
			hallway.forechTile(tile => {
				if(hallway.type == 0){
					if(tile.pos.y == hallway.gridRect.top_left.y || tile.pos.y == hallway.gridRect.bottom_right.y - 1) {
						if( ((tile.pos.x - hallway.gridRect.top_left.x) % 4) == 0){
							this._placeLight(grid, tile);
						}
					}
				} else if( hallway.type == 1 ){
					if(tile.pos.x == hallway.gridRect.top_left.x || tile.pos.x == hallway.gridRect.bottom_right.x - 1) {
						if(((tile.pos.y - hallway.gridRect.top_left.y) % 4) == 0) {
							this._placeLight(grid, tile);
						}
					}
				}
			});
		}
	}

}
