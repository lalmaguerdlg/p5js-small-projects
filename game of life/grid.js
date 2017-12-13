class Grid {
    constructor(rows, cols, pixelsPerCell) {
        this.size = createVector(cols, rows);
        this.states = new Array(2);
        this.states[0] = this.createArray2D(rows, cols);
        this.states[1] = this.states[0].map((col) => col.slice());
        this.currentIndex = 0;
        this.pixelsPerCell = pixelsPerCell;
    }

    update() {
        let current = this.getCurrentState();
        let next = this.getNextState();
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                let curState = current[y][x];
                let neighbors = this.countNeighbors(current, x, y);
                let newState = 0;
                if(curState == 1){
                    if(neighbors < 2 || neighbors > 3)
                        newState = 0;
                    
                    if(neighbors == 2 || neighbors == 3)
                        newState = 1;
                }
                else{
                    if(neighbors == 3)
                        newState = 1;
                    else
                        newState = 0;
                }
                next[y][x] = newState;
            }
        }
        this.currentIndex += 1;
        this.currentIndex = this.currentIndex % 2;
    }

    draw() {
        let current = this.getCurrentState();
        fill(157, 172, 201);
        for (let y = 0; y < this.size.y; y++) {
            for (let x = 0; x < this.size.x; x++) {
                if (current[y][x])
                    rect(x * this.pixelsPerCell + 1, y * this.pixelsPerCell + 1, this.pixelsPerCell, this.pixelsPerCell);
            }

        }
    }

    getCurrentState(){
        return this.states[this.currentIndex];
    }

    getNextState(){
        return this.states[(this.currentIndex + 1) % 2];
    }

    countNeighbors(current, x, y){
        let count = 0;
        for(let i = -1; i < 2; i++){
            for(let j = -1; j < 2; j++){
                let xIndex = (x + j + this.size.x) % this.size.x;
                let yIndex = (y + i + this.size.y) % this.size.y;
                count += current[yIndex][xIndex];
            }
        }
        count -= current[y][x];
        return count;
    }

    createArray2D(rows, cols) {
        let result = new Array(rows);
        for (let i = 0; i < rows; i++) {
            result[i] = new Array(cols);
            for (let j = 0; j < cols; j++) {
                //result[i][j] = 0;
                result[i][j] = floor(random(2));
                //if(i == j)
                    //result[i][j] = 1;
            }
        }
        return result;
    }
}