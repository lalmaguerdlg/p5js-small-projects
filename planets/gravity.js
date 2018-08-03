const CANVAS_WIDTH = 980;
const CANVAS_HEIGHT = 500;

var acel = 0;
var vel = 0;
var pos = 0;

var isSettingNewCircle = false;
var velStart = 0;
var velEnd = 0;

var balls = new Array();

function setup() {
    createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
    
    acel = createVector(0, 1);
    vel = createVector(5, 0);

}

function update(){
    for(let b of balls){
        b.update();
    }
}

function draw() {
    clear();
    update();

    for(let b of balls){
        b.draw();
    }

    if(isSettingNewCircle){
        arrow(velStart, createVector(mouseX, mouseY));
    }
}

function mousePressed(){
    isSettingNewCircle = true;
    velStart = createVector(mouseX, mouseY);
}

function mouseReleased(){
    console.log(mouseButton);
    isSettingNewCircle = false;
    velEnd = createVector(mouseX, mouseY);

    var initialVel = p5.Vector.sub(velEnd, velStart);
    initialVel.mult(0.1);
    var b = new Ball(velStart.x, velStart.y, 20);
    b.addForce(acel);
    b.impulse(initialVel);
    balls.push(b);
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