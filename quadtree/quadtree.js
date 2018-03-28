class Point{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    inside(collider){
        if (collider instanceof Circle) return this._insideCircle(collider);
        if (collider instanceof Rectangle) return this._insideRectangle(collider);
    }

    _insideCircle(other){
        let direction = {
            x: this.x - other.x,
            y: this.y - other.y
        }
        let distance_sqr = Math.pow(direction.x, 2) + Math.pow(direction.y, 2);
        return (distance_sqr <= (other.rad))
    }

    _insideRectangle(other){
        return (this.x >= other.x - other.width &&
            this.x <= other.x + other.width &&
            this.y >= other.y - other.height &&
            this.y <= other.y + other.height)
    }
}

class Rectangle{
    constructor(x, y, width, height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }
    contains(point){
        return (point.x >= this.x - this.width &&
                point.x <= this.x + this.width &&
                point.y >= this.y - this.height &&
                point.y <= this.y + this.height)
    }

    intersects(collider) {
        if (collider instanceof Circle) return this._intersectsCircle(collider);
        if (collider instanceof Rectangle) return this._intersectsRectangle(collider);
    }

    _intersectsCircle(other) {
        let circle_distance = {
            x: Math.abs(other.x - this.x),
            y: Math.abs(other.y - this.y)
        }

        if (circle_distance.x > (this.width + other.rad)) { return false; }
        if (circle_distance.y > (this.height + other.rad)) { return false; }

        if (circle_distance.x <= (this.width)) { return true; }
        if (circle_distance.y <= (this.height)) { return true; }

        let corner_dist_sqr = Math.pow(circle_distance.x - this.width, 2) +
            Math.pow(circle_distance.y - this.height, 2);

        return (corner_dist_sqr <= (other.rad * other.rad));
    }

    _intersectsRectangle(other) {
        return ((this.x - this.width) < (other.x + other.width) &&
            (this.x + this.width) > (other.x - other.width) && 
            (this.y - this.height) < (other.y + other.width) &&
            (this.y + this.height) > (other.y - other.width));
    }
}

class Circle{
    constructor(x, y, rad){
        this.x = x;
        this.y = y;
        this.rad = rad;
    }

    contains(point){
        let direction = {
            x: point.x - this.x,
            y: point.y - this.y
        }
        let distance_sqr = Math.pow(direction.x, 2) + Math.pow(direction.y, 2);
        return (distance_sqr <= (this.rad))
    }

    intersects(collider){
        if (collider instanceof Circle) return this._intersectsCircle(collider);
        if (collider instanceof Rectangle) return this._intersectsRectangle(collider);
    }

    _intersectsCircle(other){
        let direction = {
            x: other.x - this.x,
            y: other.y - this.y
        }
        let distance_sqr = Math.pow(direction.x, 2) + Math.pow(direction.y, 2);
        return (distance_sqr <= (this.rad + other.rad))
    }

    _intersectsRectangle(other){
        let circle_distance = {
            x: Math.abs(this.x - other.x),
            y: Math.abs(this.y - other.y)
        }

        if (circle_distance.x > (other.width + this.rad)) { return false; }
        if (circle_distance.y > (other.height + this.rad)) { return false; }

        if (circle_distance.x <= (other.width)) { return true; }
        if (circle_distance.y <= (other.height)) { return true; }

        let corner_dist_sqr = Math.pow(circle_distance.x - other.width, 2) +
            Math.pow(circle_distance.y - other.height, 2);

        return (corner_dist_sqr <= (this.rad * this.rad));
    }
}

class QuadTree{
    constructor(boundary, capacity, levels, level){
        this.boundary = boundary;
        this.capacity = capacity;
        this.sections = {};
        this.subdivided = false;
        this.points = [];
        this.level = level || 0;
        this.levels = levels || 7;
        this.allow_overflow = true;
        
        this.max_count = capacity * Math.pow(4, this.levels - this.level - 1);
    }
    
    query(area){
        let result = new QuadTreeCollection();
        if(this.subdivided){
            for(let section in this.sections){
                let region = this.sections[section];
                if (area.intersects(region.boundary)){
                    let section_result = region.query(area);
                    result.concat(section_result);
                }
            }
        } else {
            if(area.intersects(this.boundary))
                result.push(this);
        }
        return result;
    }

    count(){
        let total = this.points.length;
        for(let section in this.sections) {
            total += this.sections[section].count();
        }
        return total;
    }

    subdivide(point){
        if(this.level < this.levels - 1){
            let x = this.boundary.x;
            let y = this.boundary.y;
            let half_w = this.boundary.width * .5;
            let half_h = this.boundary.height * .5;
            let next_level = this.level + 1;
            
            //let 
            let nw = new Rectangle(x - half_w, y - half_h, half_w, half_h);
            let ne = new Rectangle(x + half_w, y - half_h, half_w, half_h);
            let se = new Rectangle(x + half_w, y + half_h, half_w, half_h);
            let sw = new Rectangle(x - half_w, y + half_h, half_w, half_h);
            
            this.sections.northwest = new QuadTree(nw, this.capacity, this.levels, next_level, this.allow_overflow);
            this.sections.northeast = new QuadTree(ne, this.capacity, this.levels, next_level, this.allow_overflow);
            this.sections.southeast = new QuadTree(se, this.capacity, this.levels, next_level, this.allow_overflow);
            this.sections.southwest = new QuadTree(sw, this.capacity, this.levels, next_level, this.allow_overflow);

            for(let section in this.sections) {
                for(let p of this.points) {
                    this.sections[section].insert(p);
                }
            }

            this.points = [];
            this.subdivided = true;
            return true;
        }
        return false;
    }

    insert(point){

        if(!this.boundary.contains(point))
            return false;

        if(this.points.length < this.capacity && !this.subdivided){
            this.points.push(point);
            return true;
        }
        else{
            if(!this.subdivided){
                if(!this.subdivide(point)){ 
                    if(this.allow_overflow)
                        this.points.push(point);
                    return this.allow_overflow;
                }
            }
            
            if(this.sections.northwest.insert(point) || 
                this.sections.northeast.insert(point) ||
                this.sections.southeast.insert(point) || 
                this.sections.southwest.insert(point)) {
                return true;
            }
        }
        return false;
    }
}

class QuadTreeCollection{
    constructor(array){
        this.collection = [];
        this.concat(array);
    }

    concat(other){
        if(other instanceof Array) { this.collection = this.collection.concat(other); }
        else if(other instanceof QuadTreeCollection) { this.collection = this.collection.concat(other.collection); }
        else if(other instanceof QuadTree) { this.push(other); }
    }

    push(quadTree){
        if (!quadTree instanceof QuadTree) { console.error("Must push only QuadTree instances."); return }
        this.collection.push(quadTree);
    }

    get_points(){
        let result = [];
        for(let qt of this.collection){
            result = result.concat(this._get_points_recursive(qt));
        }
        return result;
    }

    _get_points_recursive(quadTree){
        let result = [];
        if(quadTree.subdivided){
            for(let section of quadTree.sections)
                result = result.concat(this._get_points_recursive(quadTree.sections[section]));
        }else{
            result = result.concat(quadTree.points);
        }
        return result;
    }
}