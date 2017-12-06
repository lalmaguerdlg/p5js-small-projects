class MouseTool{
    constructor(mouseRad, shapes){
        this.mousePos = createVector(0, 0);
        this.mouseRad = mouseRad;
        this.shapes = shapes;
    }

    update(){
        this.mousePos.x = mouseX;
        this.mousePos.y = mouseY;
    }

    draw(){

    }

    mouseMovedCallback(){ }
    mouseDraggedCallback(mouseButton){ }
    mousePressedCallback(mouseButton){ }
    mouseReleasedCallback(mouseButton){ }
}

class MoveTool extends MouseTool{
    constructor(mouseRad, shapes){
        super(mouseRad, shapes);
        this.selectedPoint = null;
        this.isModifingShape = false;
    }

    draw(){

        if(!this.isModifingShape){
            for(let shape of this.shapes){
                let p = shape.GetPointNear(this.mousePos.x, this.mousePos.y, this.mouseRad);
                if(p != null){
                    fill(183, 147, 16);
                    strokeWeight(0);
                    ellipse(p.x, p.y, shape.editPointRad + 5, shape.editPointRad + 5);
                    break;
                }
            }
        }

        if(this.isModifingShape && mouseIsPressed){
            fill(114, 219, 129);
            strokeWeight(0);
            ellipse(this.selectedPoint.x, this.selectedPoint.y, 20, 20);
        }
    }

    mouseDraggedCallback(mouseButton){
        if(this.isModifingShape){
            this.selectedPoint.x = mouseX;
            this.selectedPoint.y = mouseY;
        }
    }

    mousePressedCallback(mouseButton){
        
        if(mouseButton === 'left' && !this.isModifingShape){
            for(let shape of this.shapes){
                this.selectedPoint = shape.GetPointNear(this.mousePos.x, this.mousePos.y, this.mouseRad);
                if(this.selectedPoint) {
                    this.isModifingShape = true;
                    break;
                }
            }
        }

    }

    mouseReleasedCallback(mouseButton){
        if(mouseButton === 'left' && this.isModifingShape){
            this.isModifingShape = false;
        }
    }
}

class ShapeTool extends MouseTool{
    constructor(mouseRad, shapes){
        super(mouseRad, shapes);
        this.shape = null;
        this.isCreatingShape = false;
        this.start = createVector(0, 0);
    }

    draw(){
        if(this.isCreatingShape){
            this.shape.draw();
            strokeWeight(1);
            line(this.start.x, this.start.y, this.mousePos.x, this.mousePos.y);
        }
    }

    mousePressedCallback(mouseButton){
        

        if(mouseButton === 'left' && !this.isCreatingShape){
            this.isCreatingShape = true;
            this.shape = new Shape();
        }

        if(mouseButton === 'left' && this.isCreatingShape){
            let point = createVector(this.mousePos.x, this.mousePos.y);
            this.shape.addPoint(point);
            this.start = createVector(this.mousePos.x, this.mousePos.y);
        }

    }

    mouseReleasedCallback(mouseButton){
        if(mouseButton === 'right' && this.isCreatingShape){
            this.isCreatingShape = false;
            if(this.shape.points.length > 1){
                this.shape.finished = true;
                this.shapes.push(this.shape);
            }
        }
    }

}