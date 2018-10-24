let DEBUG_MODE = false;
const LIMIT_BORDER_OFFSET = 50;

var gravity = 0;

var isSettingNewCircle = false;
var velStart = 0;
var velEnd = 0;

var balls = new Array();

function setup() {
    createCanvas(windowWidth, windowHeight);
    gravity = createVector(0, 1);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function update(){
    for(let b of balls){
        b.addForce(gravity);
        b.update();
    }
}

function draw() {
    clear();
    background(36, 45, 61);
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
    b.addForce(gravity);
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