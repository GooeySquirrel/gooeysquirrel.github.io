let draw = [];
let objs = [];
let allObjs = [[]];

class Vector {
    constructor (x, y) {
        this.x = x;
        this.y = y;
    }
    add (v) {
        this.x += v.x;
        this.y += v.y;
    }
    interpolate (v) {
        const strength = 3;
        if (Math.round(this.x) != v.x)
            this.x = (v.x + (this.x*strength))/(strength+1);
        else
            this.x = v.x;
        if (Math.round(this.y) != v.y)
            this.y = (v.y + (this.y*strength))/(strength+1);
        else
            this.y = v.y;
    }
    equals (v) {
        if (this.x == v.x && this.y == v.y)
            return true;
        return false;
    }
}

class Camera {
    constructor () {
        this.x1 = -cameraWidth;
        this.x2 = cameraWidth;
        this.y1 = -cameraHeight;
        this.y2 = cameraHeight;
        this.toPos = new Vector(0, 0);
        this.pos = new Vector(0, 0);
        this.tempPos = new Vector(0, 0);
    }
}

// SHAPE CLASSES
class Square {
    constructor(type, x1, x2, y1, y2, movement) {
        this.type = type;
        this.x1 = x1;
        this.x2 = x2;
        this.y1 = y1;
        this.y2 = y2;
        this.z_index = 5;

        // Special properties
        if (type[0] == "tkb" || type[0] == "tdb") { // IF type[0] IS AN ARRAY, INCLUDE IT BEFORE THE SUBSTRING CHECKERS
            this.type = type[0];
            this.on = type[2];
            this.duration = type[1];
            this.currentTime = 0;
            this.z_index = 1;
        } else if (type[0] == "deco") {
            this.type = type[0];
            this.color = type[1];
            this.z_index = 20;
        } else if (type.substring(0,2) == "tp") {
            this.type = "tp";
            this.id = (type.substring(2,type.length));
            this.y1 = x2;
            this.direction = y1;
            if (this.direction == "left" || this.direction == "right") {
                this.x2 = this.x1 + 10;
                this.y2 = this.y1 + 40;
            } else if (this.direction == "top" || this.direction == "bottom") {
                this.x2 = this.x1 + 40;
                this.y2 = this.y1 + 10;
            }
            if (y1 == "left")
                new Square("exit", x1-5, x1, x2+10, x2+30);
            else if (y1 == "right")
                new Square("exit", x1+10, x1+15, x2+10, x2+30);
            else if (y1 == "top")
                new Square("exit", x1+10, x1+30, x2-5, x2);
            else if (y1 == "bottom")
                new Square("exit", x1+10, x1+30, x2+10, x2+15);
        } else if (type.substring(0,3) == "key") {
            this.type = "key";
            this.id = (type.substring(3,type.length));
        } else if (type.substring(0,2) == "kd") {
            this.type = "kd";
            this.id = (type.substring(2,type.length));
            this.on = true;
        } else if (type == "pb") {
            this.initialPos = [x1, x2, y1, y2];
            this.z_index = 2;
        } else if (type == "player") {
            this.z_index = 0;
        }
        
        // Add to objs array
        objs.push(this);
        draw.push(this);
        
        // Special for moving blocks
        if (movement) {
            this.movement = movement;
            this.speed = movement[movement.length-1];
            this.toArrayPos = 0;
            this.tempCoords = [x1, x2, y1, y2];
            this.toCoords = [movement[0][0], movement[0][1], movement[0][2], movement[0][3]];
            this.calculateVel();
        }
    }

    // Method for moving blocks
    calculateVel() {
        this.vel = [this.toCoords[0]-this.tempCoords[0], this.toCoords[1]-this.tempCoords[1], this.toCoords[2]-this.tempCoords[2], this.toCoords[3]-this.tempCoords[3]];
        const divide = Math.max(Math.abs(this.vel[0]), Math.abs(this.vel[1]), Math.abs(this.vel[2]), Math.abs(this.vel[3]));
        this.vel[0] /= divide / this.speed;
        this.vel[1] /= divide / this.speed;
        this.vel[2] /= divide / this.speed;
        this.vel[3] /= divide / this.speed;
    }

    // Display objects on canvas
    draw() {
        let x = (this.x1-camera.x1)/(camera.x2-camera.x1)*canvas.width;
        let y = (this.y1-camera.y1)/(camera.y2-camera.y1)*canvas.height;
        let w = (this.x2-camera.x1)/(camera.x2-camera.x1)*canvas.width-x;
        let h = (this.y2-camera.y1)/(camera.y2-camera.y1)*canvas.height-y;

        ctx.beginPath();
        ctx.rect(x, y, w, h);

        if (this.type == "player") {
            ctx.fillStyle = "gray";
            ctx.fill();
        } else if (this.type == "w") {
            ctx.fillStyle = "black";
            ctx.fill();
        } else if (this.type == "kb" || (this.type == "tkb" && this.on == true)) {
            ctx.fillStyle = "orange";
            ctx.fill();
        } else if (this.type == "db" || (this.type == "tdb" && this.on == true)) {
            ctx.fillStyle = "red";
            ctx.fill();
        } else if (this.type == "tp") {
            ctx.fillStyle = "blue";
            ctx.fill();
        } else if (this.type == "exit") {
            ctx.fillStyle = "cyan";
            ctx.fill();
        } else if (this.type == "key") {
            ctx.fillStyle = "LightPink";
            ctx.fill();
        } else if (this.type == "kd" && this.on == true) {
            ctx.fillStyle = "LightPink";
            ctx.strokeStyle = "black";
            ctx.setLineDash([]);
            ctx.stroke();
            ctx.fill();
            ctx.drawImage(lockImg, x+w/2-0.5*Math.min(w, h), y+h/2-0.5*Math.min(w, h), Math.min(w, h), Math.min(w, h));
        } else if (this.type == "tkb" && this.on == false) {
            ctx.strokeStyle = "orange";
            ctx.setLineDash([5, 5]);
            ctx.stroke();
        } else if (this.type == "tdb" && this.on == false) {
            ctx.strokeStyle = "red";
            ctx.setLineDash([5, 5]);
            ctx.stroke();
        } else if (this.type == "pb") {
            ctx.fillStyle = "#873e23";
            ctx.fill();
        } else if (this.type == "c") {
            ctx.fillStyle = "#ffff99";
            ctx.fill();
        } else if (this.type == "cb") {
            ctx.fillStyle = "green";
            ctx.fill();
        } else if (this.type == "deco") {
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

class Circle {
    constructor(type, x, y, r) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.r = r;
        this.z_index = 10;
        objs.push(this);
        draw.push(this);

        if (type[0] == "deco") {
            this.type = type[0];
            this.color = type[1];
            this.z_index = 15;
        }
    }

    draw() {
        let x = (this.x-camera.x1)/(camera.x2-camera.x1)*canvas.width;
        let y = (this.y-camera.y1)/(camera.y2-camera.y1)*canvas.height;
        let r = this.r/factor;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2*Math.PI);
        if (this.type == "SC")
            ctx.fillStyle = "white";
        if (this.type == "deco")
            ctx.fillStyle = this.color;
        ctx.fill();
    }
}

class Text {
    constructor(text, x, y, size, color, deco) {
        this.text = text;
        this.x = x;
        this.y = y;
        this.color = "black";
        if (color)
            this.color = color;
        this.deco = "";
        if (deco)
            this.deco = deco + " ";
        this.font = this.deco + size + "px Arial";
        this.z_index = 3;
        draw.push(this);
    }

    draw() {
        let x = (this.x-camera.x1)/(camera.x2-camera.x1)*canvas.width;
        let y = (this.y-camera.y1)/(camera.y2-camera.y1)*canvas.height;

        ctx.beginPath();
        ctx.font = this.font;
        ctx.fillStyle = this.color;
        ctx.fillText(this.text, x, y);
    }
}

const canvas = document.getElementById("canvas");
canvas.width = window.screen.width;
canvas.height = window.screen.height;
const ctx = canvas.getContext("2d");
ctx.textAlign = "center";

const cameraHeight = 100;
const cameraWidth = parseInt(cameraHeight*canvas.width/canvas.height);
const factor = 2*cameraHeight/canvas.height;
const camera = new Camera();
const SC = new Circle("SC", 0, 0, 25);
const player = new Square("player", -10, 10, -10, 10);
const length = (player.x2-player.x1)/2;

const lockImg = new Image();
lockImg.src = "lock.png";

let phaseNumber = 1;
let mode = 1;

// Interface
let showCoords = true;
const coords = document.getElementById("coords");
const xCoord = document.getElementById("xCoord");
const yCoord = document.getElementById("yCoord");
const selectBlock = document.getElementById("selectBlock");
const modeText = document.getElementById("mode");
const phaseText = document.getElementById("phaseNo");
const noObjects = document.getElementById("objects");
const blockProperties = document.getElementById("properties")
let x1, x2, y1, y2, properties;

canvas.onmousedown = function(e) {
    x1 = Math.floor((e.x/canvas.width)*(camera.x2-camera.x1)+camera.x1);
    y1 = Math.floor((e.y/canvas.height)*(camera.y2-camera.y1)+camera.y1);
}

canvas.onmouseup = function(e) {
    x2 = Math.floor((e.x/canvas.width)*(camera.x2-camera.x1)+camera.x1);
    y2 = Math.floor((e.y/canvas.height)*(camera.y2-camera.y1)+camera.y1);
    if (x1 == undefined)
        x1 = x2;
    if (y1 == undefined)
        y1 = y2;
    if (mode == 1) {
        if (x1 != x2 && y1 != y2) {
            if (selectBlock.value == "w" || selectBlock.value == "kb" || selectBlock.value == "db") {
                new Square(selectBlock.value, Math.min(x1,x2), Math.max(x1,x2), Math.min(y1,y2), Math.max(y1,y2));
                properties = objs[objs.length-1];

                blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">" + "\nmove: <input type=\"text\" id=\"moveInput\" style=\"width: 6vw\">";
                document.getElementById("typeInput").value = properties.type;
                document.getElementById("x1Input").value = properties.x1;
                document.getElementById("x2Input").value = properties.x2;
                document.getElementById("y1Input").value = properties.y1;
                document.getElementById("y2Input").value = properties.y2;
            }
        }
        if (selectBlock.value == "tp") {
            new Square("tp", x2, y2, "left");
            properties = objs[objs.length-1];
        }
    }
    noObjects.innerText = objs.length-2;
}

function editBlock() {
    properties.type = document.getElementById("typeInput").value;
    if (properties.type == "w" || properties.type == "kb" || properties.type == "db") {
        properties.type = document.getElementById("typeInput").value;
        properties.x1 = parseInt(document.getElementById("x1Input").value);
        properties.x2 = parseInt(document.getElementById("x2Input").value);
        properties.y1 = parseInt(document.getElementById("y1Input").value);
        properties.y2 = parseInt(document.getElementById("y2Input").value);
        let move = document.getElementById("moveInput").value;
        move = move.split(",");
        if (move.length >= 5 && (move.length-1)%4 == 0) {
            const moveArray = [];
            const moveLength = (move.length-1)/4;
            for (let i = 0; i < moveLength; i++)
                moveArray.push([parseInt(move[i*4]), parseInt(move[i*4+1]), parseInt(move[i*4+2]), parseInt(move[i*4+3])]);
            moveArray.push(move[move.length-1]);

            properties.movement = moveArray;
            properties.speed = properties.movement[properties.movement.length-1];
            properties.toArrayPos = 0;
            properties.tempCoords = [parseInt(properties.x1), parseInt(properties.x2), parseInt(properties.y1), parseInt(properties.y2)];
            console.log(properties.tempCoords);
            properties.toCoords = [parseInt(properties.movement[0][0]), parseInt(properties.movement[0][1]), parseInt(properties.movement[0][2]), parseInt(properties.movement[0][3])];
            properties.calculateVel();
            console.log(properties);
        } else {
            properties.movement = undefined;
        }
    }
}

function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Square movements
    for (let i = 0; i < objs.length; i++) {
        if (objs[i].movement) {
            const block = objs[i];

            block.x1 += block.vel[0];
            block.x2 += block.vel[1];
            block.y1 += block.vel[2];
            block.y2 += block.vel[3];

            const x1True = (block.vel[0] > 0 && block.x1 >= block.toCoords[0]) || (block.vel[0] < 0 && block.x1 <= block.toCoords[0]) || (block.vel[0] == 0 && block.x1 == block.toCoords[0]);
            const x2True = (block.vel[1] > 0 && block.x2 >= block.toCoords[1]) || (block.vel[1] < 0 && block.x2 <= block.toCoords[1]) || (block.vel[1] == 0 && block.x2 == block.toCoords[1]);
            const y1True = (block.vel[2] > 0 && block.y1 >= block.toCoords[2]) || (block.vel[2] < 0 && block.y1 <= block.toCoords[2]) || (block.vel[2] == 0 && block.y1 == block.toCoords[2]);
            const y2True = (block.vel[3] > 0 && block.y2 >= block.toCoords[3]) || (block.vel[3] < 0 && block.y2 <= block.toCoords[3]) || (block.vel[3] == 0 && block.y2 == block.toCoords[3]);

            // Detect if toCoords has been met
            if (x1True && x2True && y1True && y2True) {
                block.x1 = block.toCoords[0];
                block.x2 = block.toCoords[1];
                block.y1 = block.toCoords[2];
                block.y2 = block.toCoords[3];
                block.toArrayPos++;
                const pos = block.toArrayPos;
                if (pos == block.movement.length-1) {
                    block.toArrayPos = 0;
                    block.toCoords = [block.movement[0][0], block.movement[0][1], block.movement[0][2], block.movement[0][3]];
                } else {
                    block.toCoords = [block.movement[pos][0], block.movement[pos][1], block.movement[pos][2], block.movement[pos][3]];
                }
                block.tempCoords = [block.movement[pos-1][0], block.movement[pos-1][1], block.movement[pos-1][2], block.movement[pos-1][3]];
                block.calculateVel();
            }
        }
    }

    camera.tempPos.x = camera.pos.x;
    camera.tempPos.y = camera.pos.y;

    camera.pos.interpolate(camera.toPos);

    const xMovement = camera.pos.x-camera.tempPos.x;
    const yMovement = camera.pos.y-camera.tempPos.y;

    for (let i = 0; i < objs.length; i++) {
        // Timed kbs/dbs
        if (objs[i].type == "tkb" || objs[i].type == "tdb") {
            objs[i].currentTime++;
            if (objs[i].currentTime == objs[i].duration) {
                objs[i].currentTime = 0;
                objs[i].on = objs[i].on ? false : true;
            }
        }
    }

    if (showCoords)
        coords.innerText = "(" + camera.toPos.x + ", " + camera.toPos.y + ")";

    // Update camera
    fixCamera();

    // Draw objects
    for (let i = 0; i < draw.length; i++)
        draw[i].draw();

    requestAnimationFrame(run);
}

run();

function fixCamera() {
    camera.x1 = -cameraWidth + camera.pos.x;
    camera.x2 = cameraWidth + camera.pos.x;
    camera.y1 = -100 + camera.pos.y;
    camera.y2 = 100 + camera.pos.y;
}

function clear() {
    if (allObjs[phaseNumber-1] == undefined)
        allObjs[phaseNumber-1] = [SC, player];
    draw = [...allObjs[phaseNumber-1]];
    objs = [...draw];
    draw.sort(function(a,b){return b.z_index-a.z_index});
    camera.toPos.x = 0;
    camera.toPos.y = 0;
    camera.pos.x = 0;
    camera.pos.y = 0;
    console.log(draw);
    console.log(objs);
    phaseText.innerText = phaseNumber;
    noObjects.innerText = objs.length-2;
}

document.body.onkeydown = function(e){
    if (e.key == "w") {
        camera.toPos.y -= 5;
    } else if (e.key == "a") {
        camera.toPos.x -= 5;
    } else if (e.key == "s") {
        camera.toPos.y += 5;
    } else if (e.key == "d") {
        camera.toPos.x += 5;
    }
    if (e.key == "ArrowUp") {
        allObjs[phaseNumber-1] = [...objs];
        phaseNumber++;
        clear();
    } else if (e.key == "ArrowDown" && phaseNumber > 1) {
        allObjs[phaseNumber-1] = [...objs];
        phaseNumber--;
        clear();
    }
    if (e.key == "Enter") {
        if (Number.isInteger(parseInt(xCoord.value)))
            camera.toPos.x = parseInt(xCoord.value);
        if (Number.isInteger(parseInt(yCoord.value)))
            camera.toPos.y = parseInt(yCoord.value);
    }
    if (e.key == 1) {
        mode = 1;
        modeText.innerText = "Build";
    } else if (e.key == 2) {
        mode = 2;
        modeText.innerText = "Edit";
    } else if (e.key == 3) {
        mode = 3;
        modeText.innerText = "Delete";
    }
}