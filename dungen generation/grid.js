

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

