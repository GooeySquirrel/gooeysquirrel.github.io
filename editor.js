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
            this.startOn = type[2];
            this.on = this.startOn;
            this.duration = type[1];
            this.offset = type[3];
            this.currentTime = this.offset;
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
        this.size = size;
        this.color = "black";
        if (color)
            this.color = color;
        this.deco = "";
        if (deco)
            this.deco = deco + " ";
        this.font = this.deco + this.size + "px Arial";
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
const objectList = document.getElementById("objectList");
const edit = document.getElementById("edit");
const remove = document.getElementById("delete");
let x1, x2, y1, y2, properties, exitProperties;
let tpId = "0A", keyId = 0, kdId = 0;

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
            if (selectBlock.value == "w" || selectBlock.value == "kb" || selectBlock.value == "db" || selectBlock.value == "pb" || selectBlock.value == "c" || selectBlock.value == "cb" || selectBlock.value == "w_invis") {
                new Square(selectBlock.value, Math.min(x1,x2), Math.max(x1,x2), Math.min(y1,y2), Math.max(y1,y2));
                properties = objs[objs.length-1];

                blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">" + "\nmove: <input type=\"text\" id=\"moveInput\" style=\"width: 6vw\">";
                document.getElementById("typeInput").value = properties.type;
                document.getElementById("x1Input").value = properties.x1;
                document.getElementById("x2Input").value = properties.x2;
                document.getElementById("y1Input").value = properties.y1;
                document.getElementById("y2Input").value = properties.y2;
            } else if (selectBlock.value == "key" || selectBlock.value == "kd") {
                if (selectBlock.value == "key") {
                    new Square("key" + keyId, Math.min(x1,x2), Math.max(x1,x2), Math.min(y1,y2), Math.max(y1,y2));
                    keyId++;
                } else if (selectBlock.value == "kd") {
                    new Square("kd" + kdId, Math.min(x1,x2), Math.max(x1,x2), Math.min(y1,y2), Math.max(y1,y2));
                    kdId++;
                }
                properties = objs[objs.length-1];

                blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "id: <input type=\"text\" id=\"idInput\" style=\"width: 7vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">";
                document.getElementById("typeInput").value = properties.type;
                document.getElementById("idInput").value = properties.id;
                document.getElementById("x1Input").value = properties.x1;
                document.getElementById("x2Input").value = properties.x2;
                document.getElementById("y1Input").value = properties.y1;
                document.getElementById("y2Input").value = properties.y2;
            } else if (selectBlock.value == "tkb" || selectBlock.value == "tdb") {
                new Square([selectBlock.value, 60, false, 0], Math.min(x1,x2), Math.max(x1,x2), Math.min(y1,y2), Math.max(y1,y2));
                properties = objs[objs.length-1];

                blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "duration: <input type=\"text\" id=\"durationInput\" style=\"width: 4vw\">" + "on: <input type=\"text\" id=\"onInput\" style=\"width: 6vw\">" + "offset: <input type=\"text\" id=\"offsetInput\" style=\"width: 5vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">";
                document.getElementById("typeInput").value = properties.type;
                document.getElementById("durationInput").value = properties.duration;
                document.getElementById("onInput").value = properties.startOn;
                document.getElementById("offsetInput").value = properties.offset;
                document.getElementById("x1Input").value = properties.x1;
                document.getElementById("x2Input").value = properties.x2;
                document.getElementById("y1Input").value = properties.y1;
                document.getElementById("y2Input").value = properties.y2;
            } else if (selectBlock.value == "sqdeco") {
                new Square(["deco", "#ffffff"], Math.min(x1,x2), Math.max(x1,x2), Math.min(y1,y2), Math.max(y1,y2));
                properties = objs[objs.length-1];

                blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "color: <input type=\"text\" id=\"colorInput\" style=\"width: 6vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">" + "\nmove: <input type=\"text\" id=\"moveInput\" style=\"width: 6vw\">";
                document.getElementById("typeInput").value = properties.type;
                document.getElementById("colorInput").value = properties.color;
                document.getElementById("x1Input").value = properties.x1;
                document.getElementById("x2Input").value = properties.x2;
                document.getElementById("y1Input").value = properties.y1;
                document.getElementById("y2Input").value = properties.y2;
            }
        }
        if (selectBlock.value == "tp") {
            new Square("tp" + tpId, x2, y2, "left");
            if (tpId.substring(tpId.length-1) == "A") {
                tpId = parseInt(tpId) + "B";
            } else if (tpId.substring(tpId.length-1) == "B") {
                tpId = (parseInt(tpId) + 1) + "A";
            }
            properties = objs[objs.length-1];
            exitProperties = objs[objs.length-2];

            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "id: <input type=\"text\" id=\"idInput\" style=\"width: 7vw\">" + "\nx: <input type=\"text\" id=\"xInput\" style=\"width: 8vw\">" + "\ny: <input type=\"text\" id=\"yInput\" style=\"width: 8vw\">" + "\ndirection: <input type=\"text\" id=\"directionInput\" style=\"width: 4vw\">";
            document.getElementById("typeInput").value = properties.type;
            document.getElementById("idInput").value = properties.id;
            document.getElementById("xInput").value = properties.x1;
            document.getElementById("yInput").value = properties.y1;
            document.getElementById("directionInput").value = properties.direction;
        } else if (selectBlock.value == "cdeco") {
            new Circle(["deco", "#eeeeee"], x2, y2, 25);
            properties = objs[objs.length-1];

            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "color: <input type=\"text\" id=\"colorInput\" style=\"width: 6vw\">" + "\nx: <input type=\"text\" id=\"xInput\" style=\"width: 8vw\">" + "\ny: <input type=\"text\" id=\"yInput\" style=\"width: 8vw\">" + "\nr: <input type=\"text\" id=\"rInput\" style=\"width: 8vw\">";
            document.getElementById("typeInput").value = properties.type;
            document.getElementById("colorInput").value = properties.color;
            document.getElementById("xInput").value = properties.x;
            document.getElementById("yInput").value = properties.y;
            document.getElementById("rInput").value = properties.r;
        } else if (selectBlock.value == "txt") {
            new Text("(Insert text here)", x2, y2, 25, "black");
            properties = draw[draw.length-1];

            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "text: <input type=\"text\" id=\"textInput\" style=\"width: 6vw\">" + "\nx: <input type=\"text\" id=\"xInput\" style=\"width: 8vw\">" + "\ny: <input type=\"text\" id=\"yInput\" style=\"width: 8vw\">" + "\nsize: <input type=\"text\" id=\"sizeInput\" style=\"width: 6vw\">" + "color: <input type=\"text\" id=\"colorInput\" style=\"width: 6vw\">" + "deco: <input type=\"text\" id=\"decoInput\" style=\"width: 6vw\">";
            document.getElementById("typeInput").value = "txt";
            document.getElementById("textInput").value = properties.text;
            document.getElementById("xInput").value = properties.x;
            document.getElementById("yInput").value = properties.y;
            document.getElementById("sizeInput").value = properties.size;
            document.getElementById("colorInput").value = properties.color;
            document.getElementById("decoInput").value = properties.deco;
        }
    }
    noObjects.innerText = draw.length-2;
    draw.sort(function(a,b){return b.z_index-a.z_index});
    objectList.innerHTML = "";
    for (let i = 0; i < draw.length; i++) {
        const option = document.createElement('option');
        option.setAttribute('value', i);
        option.innerText = draw[i].type + " (" + draw[i].x1 + ", " + draw[i].x2 + ", " + draw[i].y1 + ", " + draw[i].y2 + ")";
        if (draw[i].type == "SC" || (draw[i].type == "deco" && draw[i].x))
            option.innerText = draw[i].type + " (" + draw[i].x + ", " + draw[i].y + ", " + draw[i].r + ")";
        if (draw[i].type == "tp" || draw[i].type == "key" || draw[i].type == "kd")
            option.innerText = draw[i].type + draw[i].id + " (" + draw[i].x1 + ", " + draw[i].x2 + ", " + draw[i].y1 + ", " + draw[i].y2 + ")";
        if (draw[i].type == undefined)
            option.innerText = "text (" + draw[i].x + ", " + draw[i].y + ", " + draw[i].size + ")";
        objectList.appendChild(option);
        console.log(option.innerText);
    }
}

function editBlock() {
    properties.type = document.getElementById("typeInput").value;
    if (properties.type == "w" || properties.type == "kb" || properties.type == "db" || properties.type == "pb" || selectBlock.value == "c" || selectBlock.value == "cb" || selectBlock.value == "w_invis") {
        properties.type = document.getElementById("typeInput").value;
        properties.x1 = parseInt(document.getElementById("x1Input").value);
        properties.x2 = parseInt(document.getElementById("x2Input").value);
        properties.y1 = parseInt(document.getElementById("y1Input").value);
        properties.y2 = parseInt(document.getElementById("y2Input").value);
        if (properties.x1 > properties.x2 || properties.y1 > properties.y2)
            alert("WARNING: You made x1 > x2 or y1 > y2; this will cause bugs (it makes the block uninteractable)")
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
            if (move.length > 1)
                alert("ERROR: Invalid numbers");
            properties.movement = undefined;
        }
    } else if (properties.type == "key" || properties.type == "kd") {
        properties.type = document.getElementById("typeInput").value;
        properties.id = document.getElementById("idInput").value;
        properties.x1 = parseInt(document.getElementById("x1Input").value);
        properties.x2 = parseInt(document.getElementById("x2Input").value);
        properties.y1 = parseInt(document.getElementById("y1Input").value);
        properties.y2 = parseInt(document.getElementById("y2Input").value);
        if (properties.x1 > properties.x2 || properties.y1 > properties.y2)
            alert("WARNING: You made x1 > x2 or y1 > y2; this will cause bugs (it makes the block uninteractable)")
        console.log(objs);
    } else if (properties.type == "tkb" || properties.type == "tdb") {
        properties.type = document.getElementById("typeInput").value;
        properties.duration = parseInt(document.getElementById("durationInput").value);
        properties.startOn = document.getElementById("onInput").value;
        properties.on = properties.startOn;
        properties.offset = parseInt(document.getElementById("offsetInput").value);
        properties.currentTime = properties.offset;
        properties.x1 = parseInt(document.getElementById("x1Input").value);
        properties.x2 = parseInt(document.getElementById("x2Input").value);
        properties.y1 = parseInt(document.getElementById("y1Input").value);
        properties.y2 = parseInt(document.getElementById("y2Input").value);

    } else if (properties.type == "deco" && properties.x1) { // sqdeco
        properties.type = document.getElementById("typeInput").value;
        properties.color = document.getElementById("colorInput").value;
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
            properties.toCoords = [parseInt(properties.movement[0][0]), parseInt(properties.movement[0][1]), parseInt(properties.movement[0][2]), parseInt(properties.movement[0][3])];
            properties.calculateVel();
        } else {
            if (move.length > 1)
                alert("ERROR: Invalid numbers");
            properties.movement = undefined;
        }
    } else if (properties.type == "deco") { // cdeco
        properties.color = document.getElementById("colorInput").value;
        properties.x = parseInt(document.getElementById("xInput").value);
        properties.y = parseInt(document.getElementById("yInput").value);
        properties.r = parseInt(document.getElementById("rInput").value);
    } else if (properties.type == "txt") {
        console.log("E");
        properties.text = document.getElementById("textInput").value;
        properties.x = document.getElementById("xInput").value;
        properties.y = document.getElementById("yInput").value;
        properties.size = document.getElementById("sizeInput").value;
        properties.color = document.getElementById("colorInput").value;
        properties.deco = document.getElementById("decoInput").value;
        properties.font = properties.deco + " " + properties.size + "px Arial";
    } else if (properties.type == "tp") {
        properties.id = document.getElementById("idInput").value;
        const changeX = parseInt(document.getElementById("xInput").value) - properties.x1;
        const changeY = parseInt(document.getElementById("yInput").value) - properties.y1;
        properties.x1 += changeX;
        properties.x2 += changeX;
        properties.y1 += changeY;
        properties.y2 += changeY;
        exitProperties.x1 += changeX;
        exitProperties.x2 += changeX;
        exitProperties.y1 += changeY;
        exitProperties.y2 += changeY;
        const direction = document.getElementById("directionInput").value;
        console.log(properties.direction + ", " + direction);
        if (properties.direction == "left" && direction == "right") {
            exitProperties.x1 += 15;
            exitProperties.x2 += 15;
        } else if (properties.direction == "left" && direction == "top") {
            properties.x2 += 30;
            properties.y2 -= 30;
            exitProperties.x1 += 15;
            exitProperties.x2 += 30;
            exitProperties.y1 -= 15;
            exitProperties.y2 -= 30;
        } else if (properties.direction == "left" && direction == "bottom") {
            properties.x2 += 30;
            properties.y2 -= 30;
            exitProperties.x1 += 15;
            exitProperties.x2 += 30;
            exitProperties.y2 -= 15;
        } else if (properties.direction == "right" && direction == "left") {
            exitProperties.x1 -= 15;
            exitProperties.x2 -= 15;
        } else if (properties.direction == "right" && direction == "top") {
            properties.x2 += 30;
            properties.y2 -= 30;
            exitProperties.x2 += 15;
            exitProperties.y1 -= 15;
            exitProperties.y2 -= 30;
        } else if (properties.direction == "right" && direction == "bottom") {
            properties.x2 += 30;
            properties.y2 -= 30;
            exitProperties.x2 += 15;
            exitProperties.y2 -= 15;
        } else if (properties.direction == "top" && direction == "left") {
            properties.x2 -= 30;
            properties.y2 += 30;
            exitProperties.x1 -= 15;
            exitProperties.x2 -= 30;
            exitProperties.y1 += 15;
            exitProperties.y2 += 30;
        } else if (properties.direction == "top" && direction == "right") {
            properties.x2 -= 30;
            properties.y2 += 30;
            exitProperties.x2 -= 15;
            exitProperties.y1 += 15;
            exitProperties.y2 += 30;
        } else if (properties.direction == "top" && direction == "bottom") {
            exitProperties.y1 += 15;
            exitProperties.y2 += 15;
        } else if (properties.direction == "bottom" && direction == "left") {
            properties.x2 -= 30;
            properties.y2 += 30;
            exitProperties.x1 -= 15;
            exitProperties.x2 -= 30;
            exitProperties.y2 += 15;
        } else if (properties.direction == "bottom" && direction == "right") {
            properties.x2 -= 30;
            properties.y2 += 30;
            exitProperties.x2 -= 15;
            exitProperties.y2 += 15;
        } else if (properties.direction == "bottom" && direction == "top") {
            exitProperties.y1 -= 15;
            exitProperties.y2 -= 15;
        }
        properties.direction = document.getElementById("directionInput").value;
    }
}

function editButton() {
    properties = draw[objectList.value];
    if (properties.type == "SC" || properties.type == "player")
        alert("ERROR: Cannot edit properties of SC/player");
    else {
        if (properties.type == "w" || properties.type == "kb" || properties.type == "db" || properties.type == "pb" || selectBlock.value == "c" || selectBlock.value == "cb" || selectBlock.value == "w_invis") {
            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">" + "\nmove: <input type=\"text\" id=\"moveInput\" style=\"width: 6vw\">";
            document.getElementById("typeInput").value = properties.type;
            document.getElementById("x1Input").value = properties.x1;
            document.getElementById("x2Input").value = properties.x2;
            document.getElementById("y1Input").value = properties.y1;
            document.getElementById("y2Input").value = properties.y2;
        } else if (properties.type == "key" || properties.type == "kd") {
            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "id: <input type=\"text\" id=\"idInput\" style=\"width: 7vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">";
            document.getElementById("typeInput").value = properties.type;
            document.getElementById("idInput").value = properties.id;
            document.getElementById("x1Input").value = properties.x1;
            document.getElementById("x2Input").value = properties.x2;
            document.getElementById("y1Input").value = properties.y1;
            document.getElementById("y2Input").value = properties.y2;
        } else if (properties.type == "tkb" || properties.type == "tdb") {
            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "duration: <input type=\"text\" id=\"durationInput\" style=\"width: 4vw\">" + "on: <input type=\"text\" id=\"onInput\" style=\"width: 6vw\">" + "offset: <input type=\"text\" id=\"offsetInput\" style=\"width: 5vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">";
            document.getElementById("typeInput").value = properties.type;
            document.getElementById("durationInput").value = properties.duration;
            document.getElementById("onInput").value = properties.startOn;
            document.getElementById("offsetInput").value = properties.offset;
            document.getElementById("x1Input").value = properties.x1;
            document.getElementById("x2Input").value = properties.x2;
            document.getElementById("y1Input").value = properties.y1;
            document.getElementById("y2Input").value = properties.y2;
        } else if (properties.type == "deco" && properties.x1) { // sqdeco
            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "color: <input type=\"text\" id=\"colorInput\" style=\"width: 6vw\">" + "\nx1: <input type=\"text\" id=\"x1Input\" style=\"width: 6vw\">" + "\nx2: <input type=\"text\" id=\"x2Input\" style=\"width: 6vw\">" + "\ny1: <input type=\"text\" id=\"y1Input\" style=\"width: 6vw\">" + "\ny2: <input type=\"text\" id=\"y2Input\" style=\"width: 6vw\">" + "\nmove: <input type=\"text\" id=\"moveInput\" style=\"width: 6vw\">";
            document.getElementById("typeInput").value = properties.type;
            document.getElementById("colorInput").value = properties.color;
            document.getElementById("x1Input").value = properties.x1;
            document.getElementById("x2Input").value = properties.x2;
            document.getElementById("y1Input").value = properties.y1;
            document.getElementById("y2Input").value = properties.y2;
        } else if (properties.type == "deco") { // cdeco
            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "color: <input type=\"text\" id=\"colorInput\" style=\"width: 6vw\">" + "\nx: <input type=\"text\" id=\"xInput\" style=\"width: 8vw\">" + "\ny: <input type=\"text\" id=\"yInput\" style=\"width: 8vw\">" + "\nr: <input type=\"text\" id=\"rInput\" style=\"width: 8vw\">";
            document.getElementById("typeInput").value = properties.type;
            document.getElementById("colorInput").value = properties.color;
            document.getElementById("xInput").value = properties.x;
            document.getElementById("yInput").value = properties.y;
            document.getElementById("rInput").value = properties.r;
        } else if (properties.type == "txt") {
            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "text: <input type=\"text\" id=\"textInput\" style=\"width: 6vw\">" + "\nx: <input type=\"text\" id=\"xInput\" style=\"width: 8vw\">" + "\ny: <input type=\"text\" id=\"yInput\" style=\"width: 8vw\">" + "\nsize: <input type=\"text\" id=\"sizeInput\" style=\"width: 6vw\">" + "color: <input type=\"text\" id=\"colorInput\" style=\"width: 6vw\">" + "deco: <input type=\"text\" id=\"decoInput\" style=\"width: 6vw\">";
            document.getElementById("typeInput").value = "txt";
            document.getElementById("textInput").value = properties.text;
            document.getElementById("xInput").value = properties.x;
            document.getElementById("yInput").value = properties.y;
            document.getElementById("sizeInput").value = properties.size;
            document.getElementById("colorInput").value = properties.color;
            document.getElementById("decoInput").value = properties.deco;
        } else if (properties.type == "tp") {
            blockProperties.innerHTML = "type: <input type=\"text\" id=\"typeInput\" style=\"width: 6vw\">" + "id: <input type=\"text\" id=\"idInput\" style=\"width: 7vw\">" + "\nx: <input type=\"text\" id=\"xInput\" style=\"width: 8vw\">" + "\ny: <input type=\"text\" id=\"yInput\" style=\"width: 8vw\">" + "\ndirection: <input type=\"text\" id=\"directionInput\" style=\"width: 4vw\">";
            document.getElementById("typeInput").value = properties.type;
            document.getElementById("idInput").value = properties.id;
            document.getElementById("xInput").value = properties.x1;
            document.getElementById("yInput").value = properties.y1;
            document.getElementById("directionInput").value = properties.direction;
        }
    }
}

function deleteButton() {
    properties = draw[objectList.value];
    if (properties.type == "SC" || properties.type == "player")
        alert("ERROR: Cannot delete SC/player");
    else {
        draw.splice(objectList.value, 1);
        noObjects.innerText = draw.length-2;
        objectList.innerHTML = "";
        for (let i = 0; i < draw.length; i++) {
            const option = document.createElement('option');
            option.setAttribute('value', i);
            option.innerText = draw[i].type + " (" + draw[i].x1 + ", " + draw[i].x2 + ", " + draw[i].y1 + ", " + draw[i].y2 + ")";
            if (draw[i].type == "SC" || (draw[i].type == "deco" && draw[i].x))
                option.innerText = draw[i].type + " (" + draw[i].x + ", " + draw[i].y + ", " + draw[i].r + ")";
            if (draw[i].type == "tp" || draw[i].type == "key" || draw[i].type == "kd")
                option.innerText = draw[i].type + draw[i].id + " (" + draw[i].x1 + ", " + draw[i].x2 + ", " + draw[i].y1 + ", " + draw[i].y2 + ")";
            if (draw[i].type == undefined)
                option.innerText = "text (" + draw[i].x + ", " + draw[i].y + ", " + draw[i].size + ")";
            objectList.appendChild(option);
            console.log(option.innerText);
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
        allObjs[phaseNumber-1] = [...draw];
        phaseNumber++;
        clear();
    } else if (e.key == "ArrowDown" && phaseNumber > 1) {
        allObjs[phaseNumber-1] = [...draw];
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
    } /*else if (e.key == 2) {
        mode = 2;
        modeText.innerText = "Edit";
    } else if (e.key == 3) {
        mode = 3;
        modeText.innerText = "Delete";
    }*/
}