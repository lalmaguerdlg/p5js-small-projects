class Rect {
	constructor(x, y, w, h){
		this.pos = createVector(x, y);
		this.width = w;
		this.height = h;
		this.top_left = createVector(x, y);
		this.top_right = createVector(x + w, y);
		this.bottom_left = createVector(x, y + h);
		this.bottom_right = createVector(x + w, y + h);
		this.center = createVector( (this.top_left.x + this.top_right.x) * 0.5, (this.top_left.y + this.bottom_right.y) * 0.5);
	}

	intersects(other){
		return !(other.top_left.x >= this.top_right.x
			|| other.top_right.x <= this.top_left.x
			|| other.top_left.y >= this.bottom_left.y
			|| other.bottom_left.y <= this.top_left.y);
	}

	intersectsOrTouches(other){
		return !(other.top_left.x > this.top_right.x
			|| other.top_right.x < this.top_left.x
			|| other.top_left.y > this.bottom_left.y
			|| other.bottom_left.y < this.top_left.y);
	}

	intersectsLine(lineStart, lineEnd){
		if(lineStart.x > this.bottom_right.x && lineEnd.x > this.bottom_right.x) return false;
		if(lineStart.x < this.top_left.x && lineEnd.x < this.top_left.x) return false;
		if(lineStart.y > this.bottom_right.y && lineEnd.y > this.bottom_right.y) return false;
		if(lineStart.y < this.top_left.y && lineEnd.y < this.top_left.y) return false;
		return true;
	}
}




class Room {
	constructor(x, y, w, h, tileSize) {
		this.rect = new Rect(x, y, w, h);
		this.tileSize = tileSize;
		this.screenPos = createVector(x * this.tileSize, y * this.tileSize);
		this.screenSize = createVector(w * this.tileSize, h * this.tileSize);
		this.color = {
			r: randomRange(127, 255),
			g: randomRange(127, 255),
			b: randomRange(127, 255),
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