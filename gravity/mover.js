class Mover {
    constructor(posX, posY, mass) {
        this.acel = createVector(0, 0);
        this.vel = createVector(0, 0);
        this.pos = createVector(posX, posY);
        this.mass = mass;
        this.future = [];
        
        this.color ={ 
            r: random(255), 
            g: random(255),
            b: random(255)
        };
        this.lastAcel = this.acel.copy();
    }

    addForce(force) {
        force.div(this.mass);
        this.acel.add(force);   
        this.acel.limit(3.5);
    }

    impulse(force){
        this.vel.add(force);
    }

    calculateFuture(world){
        
        let futureAcel = this.acel.copy();
        let futureVel = this.vel.copy();
        let futurePos = this.pos.copy();

        this.future = [];
        for(let i = 0; i < 200; i++){
            for(let other of world){
                if(other != this){
                    let f = other.attractPoint(futurePos, this.mass);
                    f.div(this.mass);
                    futureAcel.add(f);
                    futureAcel.limit(3.5);
                }
            }
            futureVel.add(futureAcel);
            futureVel.limit(5);
            futurePos.add(futureVel);
            if(futureVel.mag() > 1){       
                futurePos.add(futureVel);
            }
            futureAcel.mult(0);
            this.future.push(futurePos.copy());
        }
    }

    update(){
        this.vel.add(this.acel);
        this.vel.limit(5);
        this.pos.add(this.vel);
        
        this.lastAcel = this.acel.copy();
        this.acel.mult(0);
        this.limitBorders();
    }

    draw(){
        fill(this.color.r, this.color.g, this.color.b);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.mass * 0.1, this.mass * 0.1);
        

        if(DEBUG_MODE == true){
            this.drawFuture();
            //arrow(this.pos, p5.Vector.add(this.pos, p5.Vector.mult(this.vel,10)) );
            //arrow(this.pos, p5.Vector.add(this.pos, p5.Vector.mult(this.lastAcel,10)) );
        }
    }

    drawFuture(){
        stroke(0);
        for(let i = 0; i < this.future.length -1; i++) {
            line(this.future[i].x, this.future[i].y, this.future[i+1].x, this.future[i+1].y);
        }
    }

    attract(mover){
        return this.attractPoint(mover.pos, mover.mass);
    }

    attractPoint(point, mass){
        let force = p5.Vector.sub(this.pos, point);
        let dist = force.mag();
        force.normalize();
        dist  = constrain(dist, 100.0, 500.0);
        
        let strength = (0.4 * this.mass * mass) / (dist * dist);

        force.mult(strength);

        return force;
    }

    repel(movers){
        let sum = createVector(0, 0);;
        let count = 0;
        for(let m of movers){
            let diff = p5.Vector.sub(this.pos, m.pos);
            let dist = diff.mag();
            if( dist > 0 && dist < m.mass + 5){
                diff.normalize();
                sum.add(diff);
                count = count + 1;
            }
        }
        let force  = 0;
        if(count > 0){
            sum.div(count);
            sum.mult(5);
            force = p5.Vector.sub(sum, this.vel);
            force.limit(0.05);
        }

        return force;
    }

    limitBorders(){
        if(this.pos.x > windowWidth + LIMIT_BORDER_OFFSET){
            this.pos.x =  -LIMIT_BORDER_OFFSET;
        }
        if(this.pos.x < -LIMIT_BORDER_OFFSET){
            this.pos.x = windowWidth + LIMIT_BORDER_OFFSET;
        }
        if(this.pos.y > windowHeight + LIMIT_BORDER_OFFSET){
            this.pos.y = -LIMIT_BORDER_OFFSET;
        }
        if(this.pos.y < -LIMIT_BORDER_OFFSET){
            this.pos.y = windowHeight + LIMIT_BORDER_OFFSET;
        }

    }
}