let DEBUG_MODE = false;
let LIMIT_BORDER_OFFSET = 20;

let movers = new Array();
//let attackers = new Array();

let creatingObject = false;
let startPos = 0;

function setup() {
	createCanvas(windowWidth, windowHeight);
}


function draw() {
	clear();
	background(56, 64, 79);

	for(let m of movers){

		if(m.attacker){
			let closest = { dist: 10000000, ref: null };
			for(let m2 of movers){
				if(!m2.attacker){
					let dir = p5.Vector.sub(m2.pos, m.pos);
					let dist = dir.mag();
					angleMode(RADIANS);
					let angle = degrees(p5.Vector.angleBetween(m.vel, dir));
					if(angle >= 0 && angle <= 45 && dist < 300 && m != m2){
						if(dist < closest.dist){
							closest.dist = dist;
							closest.ref = m2;
						}
					}
					
				}
			}
			if(closest.ref){
				if(closest.dist > 100)
					m.seek(closest.ref.pos, 6, 0.2);
				else{
					//m.seek(closest.ref.pos, 5, 0.05);
				let desiredV = closest.ref.vel.copy();
				//desiredV.mult(0.5);
				m.steer(desiredV, 0.1);
				}
			}
			noStroke();
			fill(255, 0, 0, 50);

			let angle = degrees(p5.Vector.angleBetween(m.vel, createVector(1, 0)));
			//console.log(angle);

			if(DEBUG_MODE){
				angleMode(DEGREES);
				let totalrotation = 45;
				let step = 90 / 10;
				beginShape();
				vertex(m.pos.x, m.pos.y);
				for(let i = 0; i < 10; i++){
					let vert = m.vel.copy();
					vert.rotate(totalrotation).normalize().mult(300).add(m.pos);
					totalrotation -= step;
					vertex(vert.x, vert.y);
				}
				endShape(CLOSE);
				angleMode(RADIANS);
			
				//ellipse(m.pos.x, m.pos.y, 600, 600);
				if(closest.ref){
					stroke(255, 50);
					strokeWeight(2);
					noFill();
					line(m.pos.x, m.pos.y, closest.ref.pos.x, closest.ref.pos.y);
				}
			}
		}
		else{
			let closest = { dist: 10000000, ref: null,  };
			for(let m2 of movers){
				if(m2.attacker){
					let dir = p5.Vector.sub(m.pos, m2.pos);
					let dist = dir.mag();
					angleMode(RADIANS);
					let angle = degrees(p5.Vector.angleBetween(m.vel, dir));
					if(dist < 200 && m != m2){
						//if(dist < closest.dist){
							//closest.dist = dist;
							//closest.ref = m2;
						//}
						if(dist > 20){
							m.steer(dir, 0.09);
						}
					}
					
				}
			}

		}

		m.evade(movers);
		

		m.update();
		m.draw();
	}
}

function mousePressed(){
	startPos = createVector(mouseX, mouseY);
}

function mouseReleased(){
	let endPos = createVector(mouseX, mouseY);
	let impulse = p5.Vector.sub(endPos, startPos);
	impulse.mult(0.01);

	let entity = new Mover(startPos.x, startPos.y, 10);
	entity.impulse(impulse);
	if(mouseButton === 'right'){
		entity.attacker = true;
		entity.color.r = 100 + random(155);
		entity.color.g = 0;
		entity.color.b = 0;
	}else{
		entity.attacker = false;
		entity.color.r = 0;
		entity.color.g = 100 + random(155);;
		entity.color.b = 0;
	}
	movers.push(entity);
}

function windowResized(){
	resizeCanvas(windowWidth, windowHeight);
}

function arrow(start, finish){
    stroke(0);
    var offset = 6;

    line(start.x, start.y, finish.x, finish.y);

    push() //start new drawing state
    var angle = atan2(start.y - finish.y, start.x - finish.x); //gets the angle of the line
    translate(finish.x, finish.y); //translates to the destination vertex
    rotate(angle-HALF_PI); //rotates the arrow point
    triangle(-offset*0.5, offset, offset*0.5, offset, 0, -offset/2); //draws the arrow point as a triangle
    pop();
}