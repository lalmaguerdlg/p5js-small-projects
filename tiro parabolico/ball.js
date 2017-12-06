class Ball {
    constructor(posX, posY, rad) {
        this.acel = createVector(0, 0);
        this.vel = createVector(0, 0);
        this.pos = createVector(posX, posY);
        this.rad = rad;
        this.colorR = random(255);
        this.colorG = random(255);
        this.colorB = random(255);
    }

    addForce(force) {
        this.acel.add(force);   
    }

    impulse(force){
        this.vel.add(force);
    }

    update(){
        this.vel.add(this.acel);
        this.pos.add(this.vel);
        
        if(this.vel.mag() > 1){       
            this.pos.add(this.vel);
        }
        
        // Colisión con el piso
        if(this.pos.y > CANVAS_HEIGHT - this.rad){
            this.pos.y = CANVAS_HEIGHT - this.rad;
            this.vel = createVector(this.vel.x * 0.8, -this.vel.y * 0.8);
        }

        // Codigo para mantener las pelotas dentro de los limites
        if(this.pos.x > CANVAS_WIDTH - this.rad){
            this.pos.x = CANVAS_WIDTH - this.rad;
            this.vel = createVector(-this.vel.x * 0.8, this.vel.y);
        }

        if(this.pos.x < this.rad){
            this.pos.x = this.rad;
            this.vel = createVector(-this.vel.x * 0.8, this.vel.y);
        }
    }

    draw(){
        fill(this.colorR, this.colorG, this.colorB);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.rad, this.rad);
        arrow(this.pos, p5.Vector.add(this.pos, p5.Vector.mult(this.vel,10)) );
        arrow(this.pos, p5.Vector.add(this.pos, p5.Vector.mult(this.acel,20)) );
    }
}