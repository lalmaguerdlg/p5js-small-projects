const DEBUG_MODE = true;
const CLEAR_SCREEN = true;
const LIMIT_BORDER_OFFSET = 50;

var acel = 0;
var vel = 0;
var pos = 0;

var isSettingNewCircle = false;
var velStart = 0;
var velEnd = 0;

var movers = new Array();
var attractors = new Array();

var path = 0;

function setup() {
    createCanvas(windowWidth, windowHeight);
    path = new Path(createVector(0, windowHeight * 0.5), createVector(windowWidth, windowHeight * 0.5), 30);
    /*for(let i = 0; i < 200; i++){
        movers.push(new Mover(random(windowWidth), random(windowHeight), 5 + random(10)));
    }*/
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function update(){
    for(let m of movers){

        m.evade(movers);
        m.follow(path);

        m.update();
    }
}

function draw() {
    update();

    if(CLEAR_SCREEN){
        clear();
        background(28,31,35);
    }

    path.draw();

    for(let a of attractors){
        a.draw();
    }

    for(let m of movers){
        m.draw();
    }


    if(isSettingNewCircle && CLEAR_SCREEN){
        arrow(velStart, createVector(mouseX, mouseY));
    }
}

function mousePressed(){
    if(mouseButton === 'left'){
        isSettingNewCircle = true;
        velStart = createVector(mouseX, mouseY);
    }
}

function mouseReleased(){
    if(mouseButton === 'left'){
        isSettingNewCircle = false;
        velEnd = createVector(mouseX, mouseY);

        var initialVel = p5.Vector.sub(velEnd, velStart);
        initialVel.mult(0.01);
        var b = new Mover(velStart.x, velStart.y, 10);
        b.impulse(initialVel);
        movers.push(b);
    }else{
        //var b = new Mover(mouseX, mouseY, 20 +  random(60));
        //movers.push(b);
        attractors.push(new Attractor(mouseX, mouseY, 20 +  random(60)));
    }
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