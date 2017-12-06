class Attractor{
    constructor(posX, posY, mass){
        this.pos = createVector(posX, posY);
        this.mass = mass;
        this.color ={ 
            r: random(255), 
            g: random(255),
            b: random(255)
        };
    }

    attract(mover){
        let force = p5.Vector.sub(this.pos, mover.pos);
        let dist = force.mag();
        force.normalize();
        dist  = constrain(dist, 100.0, 500.0);
        
        let strength = (0.4 * this.mass * mover.mass) / (dist * dist);

        force.mult(strength);

        return force;
    }

    repel(mover){
        let diff = p5.Vector.sub(mover.pos, this.pos);
        let dist = diff.mag();
        let force  = 0;
        if( dist > 0 && dist < this.mass){
            diff.normalize();
            diff.mult(2);
            force = p5.Vector.sub(diff, mover.vel);
            force.limit(0.05);
        }

        return force;
    }

    draw(){
        fill(this.color.r, this.color.g, this.color.b);
        ellipse(this.pos.x, this.pos.y, this.mass, this.mass);
    }
}