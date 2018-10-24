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

        this.acel.mult(0);

        // Colisionar con el piso
        if(this.pos.y > windowHeight - this.rad){
            this.pos.y = windowHeight - this.rad;
            this.vel = createVector(this.vel.x * 0.8, -this.vel.y * 0.8);
        }

        // Codigo para mantener las pelotas dentro de los limites
        if(this.pos.x > windowWidth + LIMIT_BORDER_OFFSET - this.rad){
            this.pos.x = windowWidth + LIMIT_BORDER_OFFSET - this.rad;
            this.vel = createVector(-this.vel.x * 0.8, this.vel.y);
        }

        if(this.pos.x < -LIMIT_BORDER_OFFSET + this.rad){
            this.pos.x = -LIMIT_BORDER_OFFSET + this.rad;
            this.vel = createVector(-this.vel.x * 0.8, this.vel.y);
        }
    }

    draw(){
        fill(this.colorR, this.colorG, this.colorB);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.rad, this.rad);
        if(DEBUG_MODE == true){
            arrow(this.pos, p5.Vector.add(this.pos, p5.Vector.mult(this.vel,10)) );
            arrow(this.pos, p5.Vector.add(this.pos, p5.Vector.mult(this.acel,20)) );
        }
    }
}