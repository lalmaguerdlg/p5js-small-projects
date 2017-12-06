class Shape{
	constructor(){
		this.points = new Array();
		this.editPointRad = 5;
		this.finished = false;
	}

	draw(){
		fill(255);
        stroke(255);
        strokeWeight(3);

		let lastIndex = this.points.length - 2;
		for(let i = 0; i < this.points.length - 1; i++){
			line(this.points[i].x, this.points[i].y, this.points[i + 1].x, this.points[i + 1].y);

			if(this.finished == true){
				if( i == lastIndex ){
					if(this.points.length > 2)
						line(this.points[i + 1].x, this.points[i + 1].y, this.points[0].x, this.points[0].y);

					ellipse(this.points[i + 1].x, this.points[i + 1].y, this.editPointRad, this.editPointRad);
				}
				ellipse(this.points[i].x, this.points[i].y, this.editPointRad, this.editPointRad);
			}
		}
	}

	addPoint(point){
		this.points.push(point);
	}

	GetPointNear(posX, posY, rad){
		let pos = createVector(posX, posY);
		for(let i = 0; i < this.points.length; i++){
			let dist = p5.Vector.sub(this.points[i], pos).mag();
			let sumOfRads = this.editPointRad + rad;
			if(dist < sumOfRads){
				return this.points[i];
			}
		}
		return null;
    }
    

}