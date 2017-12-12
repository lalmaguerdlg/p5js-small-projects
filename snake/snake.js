class Snake {

    constructor(x, y) {
        this.pos = createVector(x, y);
        this.vel = createVector(0, 0);
        this.currentDir = "RIGHT";
        this.history = new Array();
        this.changeDirection(this.currentDir);
    }

    update() {
        for (let i = 0; i < this.history.length - 1; i++) {
            this.history[i] = this.history[i + 1];
        }
        this.history[this.history.length - 1] = this.pos.copy();
        this.pos.add(this.vel);
        if (this.history.length > 0) {
            if (this.checkCollition()) {
                this.history = new Array();
            }
        }
    }

    draw() {
        fill(255);
        for (let i = 0; i < this.history.length; i++) {
            rect(this.history[i].x, this.history[i].y, GRID_SIZE, GRID_SIZE);
        }
        rect(this.pos.x, this.pos.y, GRID_SIZE, GRID_SIZE);
    }

    eat(food) {
        let dis = dist(this.pos.x, this.pos.y, food.x, food.y);
        if (dis < 1) {
            for (let i = 0; i < this.history.length - 1; i++) {
                this.history[i] = this.history[i + 1];
            }
            this.history.push(this.pos.copy());
        }
        return dis < 1;
    }

    checkCollition() {
        for (let i = 0; i < this.history.length; i++) {
            let historyPos = this.history[i];
            let dis = dist(this.pos.x, this.pos.y, historyPos.x, historyPos.y);
            if(dis < 1)
                return true;
        }
        return false;
    }

    changeDirection(dir) {
        switch (dir) {
            case "UP":
                if (this.currentDir != "DOWN") {
                    this.vel.x = 0;
                    this.vel.y = -GRID_SIZE;
                    this.currentDir = dir;
                }
                break;
            case "RIGHT":
                if (this.currentDir != "LEFT") {
                    this.vel.x = GRID_SIZE;
                    this.vel.y = 0;
                    this.currentDir = dir;
                }
                break;
            case "DOWN":
                if (this.currentDir != "UP") {
                    this.vel.x = 0;
                    this.vel.y = GRID_SIZE;
                    this.currentDir = dir;
                }
                break;
            case "LEFT":
                if (this.currentDir != "RIGHT") {
                    this.vel.x = -GRID_SIZE;
                    this.vel.y = 0;
                    this.currentDir = dir;
                }
                break;
        }
    }
}