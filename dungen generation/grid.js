
class Dungeon {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.rooms = [];
		this.mainRooms = [];
	}

	generate(minRoomSize, maxRoomSize, hallwayStroke) {
		this._placeRooms(minRoomSize, maxRoomSize);
	}

	_placeRooms(minRoomSize, maxRoomSize){
		const roomCount = 100;
		const minRoomSize = 5;
		const maxRoomSize = 20;
		const cellCountH = Math.floor(windowWidth / TILE_SIZE);
		const cellCountV = Math.floor(windowHeight / TILE_SIZE);
		let placedRooms = 0;
		let attempts = 0;
		const maxAttempts = 50;
		let centerScreen = createVector(windowWidth * 0.5, windowHeight * 0.5);
		let sizeSum = 0;
		let circleLayout = 0;
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
	}
}


class Grid {
	constructor(width, height) {
		this.width = width;
		this.height = height;
		this.tiles = new Array(width * height);
		for(let i = 0; i < height; i++){
			for(let j = 0; j < width; j++){
				this.tiles[(i * width) + j] = 0;
			}	
		}
	}

	carveRect(rect){
		let limitW = Math.min(this.width, rect.pos.x + rect.width);
		let limitH = Math.min(this.height, rect.pos.y + rect.height);
		for(let i = rect.pos.y; i < limitH; i++){
			for(let j = rect.pos.x; j < limitW; j++){
				this.tiles[ (i * this.width ) + j] = 1; 
			}
		}
	}

	carveLine(start, end, width) {

		let even = (width % 2) == 0;
		let stroke = width * 0.5;
		stroke = Math.floor(stroke);
		let minX = Math.min(start.x, end.x);
		let maxX = Math.max(start.x, end.x);
		let minY = Math.min(start.y, end.y);
		let maxY = Math.max(start.y, end.y);

		let startX;
		let startY;
		let endX;
		let endY;

		if(minX != maxX) {
			startX = minX;
			endX = Math.min(this.width, maxX);
			startY = start.y - stroke;
			endY = Math.min(this.height, start.y + stroke + (even ? 0 : 1));			
		}else{
			startX = start.x - stroke;
			endX =  Math.min(this.width, start.x + stroke + (even ? 0 : 1));
			startY = minY;
			endY = Math.min(this.height, maxY);	
		}

		startX = Math.floor(startX);
		startY = Math.floor(startY);
		endX = Math.floor(endX);
		endY = Math.floor(endY);

		for(let i = startY; i < endY; i++) {
			for(let j = startX; j < endX; j++)
				this.tiles[(i * this.width) + j] = 1; 
		}
		
	}

	draw(tileSize){
		stroke(255, 255, 255);
		strokeWeight(1);
		noFill();
		for(let i = 0; i < this.height; i++){
			for(let j = 0; j < this.width; j++){
				let tile = this.tiles[ (i * this.width ) + j]; 
				if(tile == 1){
					rect(j * tileSize, i * tileSize, tileSize, tileSize);
				}
			}
		}		
	}
}

