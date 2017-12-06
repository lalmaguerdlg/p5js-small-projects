class Path{

    constructor(start, end, rad){
        this.start = start;
        this.end = end;
        this.rad = rad;
        this.pathColor = {
            r: 0,
            g: 0,
            b: 0
        }
        this.rangeColor = {
            r: 127,
            g: 127,
            b: 127
        }
    }

    draw(){
        strokeWeight(this.rad * 2);
        stroke(this.rangeColor.r, this.rangeColor.g, this.rangeColor.b);
        line(this.start.x, this.start.y, this.end.x, this.end.y);

        strokeWeight(1);
        stroke(this.pathColor.r, this.pathColor.g, this.pathColor.b);
        line(this.start.x, this.start.y, this.end.x, this.end.y);
    }

}