class Mover {
    constructor(posX, posY, mass) {
        this.acel = createVector(0, 0);
        this.vel = createVector(0, 0);
        this.pos = createVector(posX, posY);
        this.mass = mass;
        this.color ={ 
            r: random(255), 
            g: random(255),
            b: random(255)
        };
        this.lastAcel = this.acel.copy();
    }

    addForce(force) {
        this.acel.add(force);   
        this.acel.limit(3.5);
    }

    impulse(force){
        this.vel.add(force);
    }

    update(){
        this.vel.add(this.acel);
        this.vel.limit(6);
        this.pos.add(this.vel);
        
        this.lastAcel = this.acel.copy();
        this.acel.mult(0);
        this.limitBorders();
    }

    draw(){
        fill(this.color.r, this.color.g, this.color.b);
        noStroke();
        ellipse(this.pos.x, this.pos.y, this.mass, this.mass);
        if(DEBUG_MODE == true){
            arrow(this.pos, p5.Vector.add(this.pos, p5.Vector.mult(this.vel,10)) );
            arrow(this.pos, p5.Vector.add(this.pos, p5.Vector.mult(this.lastAcel,10)) );
        }
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

    evade(movers){
        let maxspeed = 10;
        let sum = createVector(0, 0);
        let count = 0;
        for(let m of movers){
            let desireSeparation = m.mass + 5;
            let diff = p5.Vector.sub(this.pos, m.pos);
            let dist = diff.mag();
            if( dist > 0 && dist < desireSeparation){
                diff.normalize();
                diff.div(dist);
                sum.add(diff);
                count = count + 1;
            }
        }
        let force  = 0;
        if(count > 0){
            sum.div(count);
            sum.mult(maxspeed);
            this.steer(sum);
        }

        this.addForce(force);
    }

    seek(target, maxspeed, maxforce){
        if(!maxspeed)
            maxspeed = 5;
        let desired = p5.Vector.sub(target, this.pos);
        let dist = desired.mag();
        desired.normalize();
        if( dist < 100){
            let speed = (dist, 0, 100, 0, maxspeed);
            desired.mult(speed);
        }else{
            desired.mult(maxspeed);
        }
        this.steer(desired, maxforce);
    }

    follow(path){
        let direction = this.vel.copy();
        direction.normalize();
        direction.mult(25);
        let predictedPos = p5.Vector.add(this.pos, direction);

        let normalPoint = this.getNormalPoint(predictedPos, path.start, path.end);

        let normal = p5.Vector.sub(normalPoint, predictedPos);

        let normalLength = normal.mag();
        if(normalLength > path.rad){
            this.seek(normalPoint);
        }
    }

    getNormalPoint(p, start, end){
        let a = p5.Vector.sub(p, start);
        let b = p5.Vector.sub(end, start);
        b.normalize();
        b.mult(a.dot(b));
        let normalPoint = p5.Vector.add(start, b);
        return normalPoint;
    }

    steer(desired, maxforce){
        if(!maxforce)
            maxforce = 0.05;
        let steer = p5.Vector.sub(desired, this.vel);
        steer.limit(maxforce);
        this.addForce(steer);
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