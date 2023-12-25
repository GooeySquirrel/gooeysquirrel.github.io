let draw = [];
let objs = [];

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
            tpArray.push(this);
        } else if (type.substring(0,3) == "key") {
            this.type = "key";
            this.id = (type.substring(3,type.length));
            pbColliderArray.push(this);
        } else if (type.substring(0,2) == "kd") {
            this.type = "kd";
            this.id = (type.substring(2,type.length));
            this.on = true;
            keyArray.push(this);
            pbColliderArray.push(this);
        } else if (type == "pb") {
            pbArray.push(this);
            pbColliderArray.push(this);
            this.initialPos = [x1, x2, y1, y2];
            this.z_index = 2;
        } else if (type == "w") {
            pbColliderArray.push(this);
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
    }

    draw() {
        let x = (this.x-camera.x1)/(camera.x2-camera.x1)*canvas.width;
        let y = (this.y-camera.y1)/(camera.y2-camera.y1)*canvas.height;
        let r = this.r/factor;

        ctx.beginPath();
        ctx.arc(x, y, r, 0, 2*Math.PI);
        if (this.type == "SC")
            ctx.fillStyle = "white";
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
//console.log(camera);
let indivCoords = [];
const SC = new Circle("SC", 0, 0, 25);
const player = new Square("player", -10, 10, -10, 10);
const length = (player.x2-player.x1)/2;

const lockImg = new Image();
lockImg.src = "lock.png";

let phaseNumber = 1;
let pause = true;
let end = false;
let time = [0, 0, 0, 0];
let startTime, endTime, totalTime;

let tpArray = [];
let keyArray = [];
let pbArray = [];
let pbColliderArray = [];

// Cheats
let noclip = false;
let showCoords = false;
let coords = document.createElement("p");
coords.innerText = "(" + camera.pos.x + ", " + camera.pos.y + ")";
coords.style.fontSize = "30px";
coords.style.position = "relative";
coords.style.marginTop = "0";
coords.style.visibility = "hidden";
document.body.appendChild(coords);

canvas.onmousedown = function() {
    canvas.requestPointerLock();
}

document.addEventListener("pointerlockchange", () => {
    if (document.pointerLockElement)
        pause = false;
    else
        pause = true;
    if (!startTime)
        startTime = Date.now();
})

document.addEventListener("mousemove", (e) => {
    if (!pause) {
        const movement = new Vector(e.movementX*factor, e.movementY*factor);
        camera.toPos.add(movement);
    }
})

let ramVar = 0;

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
    
    // Detect movement
    indivCoords = [[camera.tempPos.x, camera.tempPos.y]];
    if (!camera.tempPos.equals(camera.pos)) {
        indivCoords = [];
        const movements = [Math.abs(xMovement), Math.abs(yMovement)];
        movements.sort(function(a,b){return b-a});
        const checks = Math.floor(movements[0]/10); // this is causing soooo many problems
        const changeX = xMovement/(checks+1);
        const changeY = yMovement/(checks+1);
        for (let i = 0; i <= checks; i++) {
            const x = camera.tempPos.x+(changeX*(i+1));
            const y = camera.tempPos.y+(changeY*(i+1));
            indivCoords.push([x, y]);
        }
    }

    // Detect if pb hits pbcollider
    for (let i = 0; i < pbArray.length; i++) {
        const pb = pbArray[i];
        for (let j = 0; j < pbColliderArray.length; j++) {
            const collider  = pbColliderArray[j];
            if ((collider.type == "kd" && collider.on == false))
                continue;
            if (collider.type == "key" && pb.x1 < collider.x2 && pb.x2 > collider.x1 && pb.y1 < collider.y2 && pb.y2 > collider.y1) {
                if (keyArray[collider.id].on)
                    keyArray[collider.id].on = false;
            } else if (pb != collider && pb.x1 < collider.x2 && pb.x2 > collider.x1 && pb.y1 < collider.y2 && pb.y2 > collider.y1) {
                const left = pb.x1 - collider.x2;
                const right = pb.x2 - collider.x1;
                const top = pb.y1 - collider.y2;
                const bottom = pb.y2 - collider.y1;
                const sideCollide = Math.min(Math.abs(left), Math.abs(right), Math.abs(top), Math.abs(bottom));
                if (Math.abs(left) == sideCollide) {
                    const add = collider.x2 - pb.x1;
                    pb.x1 += add;
                    pb.x2 += add;
                } else if (Math.abs(right) == sideCollide) {
                    const add = collider.x1 - pb.x2;
                    pb.x1 += add;
                    pb.x2 += add;
                } else if (Math.abs(top) == sideCollide) {
                    const add = collider.y2 - pb.y1;
                    pb.y1 += add;
                    pb.y2 += add;
                } else if (Math.abs(bottom) == sideCollide) {
                    const add = collider.y1 - pb.y2;
                    pb.y1 += add;
                    pb.y2 += add;
                }
            }
        }
    }

    // Detect collisions
    for (let h = 0; h < indivCoords.length; h++) {
        if (noclip == true)
            break;
        let x = indivCoords[h][0];
        let y = indivCoords[h][1];
        let wTouching;
        for (let i = 0; i < objs.length; i++) {
            if (x > objs[i].x1 - 10 && x < objs[i].x2 + 10 && y > objs[i].y1 - 10 && y < objs[i].y2 + 10) {
                if (objs[i].type == "w" || (objs[i].type == "kd" && objs[i].on == true)) {
                    const sideCollide = collide(x, y, objs[i]);
                    switch (sideCollide) {
                        case "left":
                            camera.toPos.x = objs[i].x1 - 10;
                            camera.pos.x = camera.toPos.x;
                            collideFix(camera.pos.x, "x");
                            break;
                        case "right":
                            camera.toPos.x = objs[i].x2 + 10;
                            camera.pos.x = camera.toPos.x;
                            collideFix(camera.pos.x, "x");
                            break;
                        case "top":
                            camera.toPos.y = objs[i].y1 - 10;
                            camera.pos.y = camera.toPos.y;
                            collideFix(camera.pos.y, "y");
                            break;
                        case "bottom":
                            camera.toPos.y = objs[i].y2 + 10;
                            camera.pos.y = camera.toPos.y;
                            collideFix(camera.pos.y, "y");
                            break;
                    }
                    x = indivCoords[h][0];
                    y = indivCoords[h][1];
                    //wTouching = true;
                } else if (objs[i].type == "kb" || (objs[i].type == "tkb" && objs[i].on == true)) {
                    camera.toPos.x = 0;
                    camera.toPos.y = 0;
                    camera.pos.x = 0;
                    camera.pos.y = 0;
                    indivCoords = [];
                    for (let j = 0; j < keyArray.length; j++)
                        keyArray[j].on = true;
                    for (let j = 0; j < pbArray.length; j++) {
                        const pb = pbArray[j];
                        pb.x1 = pb.initialPos[0];
                        pb.x2 = pb.initialPos[1];
                        pb.y1 = pb.initialPos[2];
                        pb.y2 = pb.initialPos[3];
                    }
                    break;
                } else if (objs[i].type == "db" || (objs[i].type == "tdb" && objs[i].on == true)) {
                    deathScreen();
                    indivCoords = [];
                } else if (objs[i].type == "tp") {
                    const id = objs[i].id
                    const locate = 2*parseInt(id);
                    let counterpart;
                    if (id[id.length-1] == "A")
                        counterpart = tpArray[locate+1];
                    else if (id[id.length-1] == "B")
                        counterpart = tpArray[locate];
                    if (counterpart.direction == "left") {
                        camera.toPos.x = counterpart.x1-10;
                        camera.toPos.y = (counterpart.y1+counterpart.y2)/2;
                    } else if (counterpart.direction == "right") {
                        camera.toPos.x = counterpart.x2+10;
                        camera.toPos.y = (counterpart.y1+counterpart.y2)/2;
                    } else if (counterpart.direction == "top") {
                        camera.toPos.x = (counterpart.x1+counterpart.x2)/2;
                        camera.toPos.y = counterpart.y1-10;
                    } else if (counterpart.direction == "bottom") {
                        camera.toPos.x = (counterpart.x1+counterpart.x2)/2;
                        camera.toPos.y = counterpart.y2+10;
                    }
                    camera.pos.x = camera.toPos.x;
                    camera.pos.y = camera.toPos.y;
                    indivCoords = [];
                } else if (objs[i].type == "key") {
                    keyArray[objs[i].id].on = false;
                } else if (objs[i].type == "pb") {
                    // PUSH BLOCK INDIVIDUALLLY
                    let push, add;
                    const sideCollide = collide(x, y, objs[i]);
                    switch (sideCollide) {
                        case "left":
                            add = camera.pos.x - objs[i].x1 + 10;
                            objs[i].x1 += add;
                            objs[i].x2 += add;
                            push = "right";
                            break;
                        case "right":
                            add = camera.pos.x - objs[i].x2 - 10;
                            objs[i].x1 += add;
                            objs[i].x2 += add;
                            push = "left";
                            break;
                        case "top":
                            add = camera.pos.y - objs[i].y1 + 10;
                            objs[i].y1 += add;
                            objs[i].y2 += add;
                            push = "down";
                            break;
                        case "bottom":
                            add = camera.pos.y - objs[i].y2 - 10;
                            objs[i].y1 += add;
                            objs[i].y2 += add;
                            push = "up";
                            break;
                    }

                    // PUSH BLOCKS (CHAIN)
                    const pbChain = [objs[i]];
                    for (let j = 0; j < pbChain.length; j++) {
                        let chainBlock = pbChain[j];
                        const multiple = [];
                        for (let k = 0; k < pbArray.length; k++) {
                            const checkBlock = pbArray[k];
                            if (!pbChain.includes(checkBlock)) {
                                if (push == "right" && chainBlock.y2 > checkBlock.y1 && chainBlock.y1 < checkBlock.y2 && chainBlock.x2 > checkBlock.x1 && chainBlock.x1 - (camera.pos.x - x) < checkBlock.x2) {
                                    multiple.push(checkBlock);
                                } else if (push == "left" && chainBlock.y2 > checkBlock.y1 && chainBlock.y1 < checkBlock.y2 && chainBlock.x2 - (camera.pos.x - x) > checkBlock.x1 && chainBlock.x1 < checkBlock.x2) {
                                    multiple.push(checkBlock);
                                } else if (push == "down" && chainBlock.x2 > checkBlock.x1 && chainBlock.x1 < checkBlock.x2 && chainBlock.y2 > checkBlock.y1 && chainBlock.y1 - (camera.pos.y - y) < checkBlock.y2) {
                                    multiple.push(checkBlock);
                                } else if (push == "up" && chainBlock.x2 > checkBlock.x1 && chainBlock.x1 < checkBlock.x2 && chainBlock.y2 - (camera.pos.y - y) > checkBlock.y1 && chainBlock.y1 < checkBlock.y2) {
                                    multiple.push(checkBlock);
                                }
                            }
                        }
                        if (push == "right")
                            multiple.sort(function(a,b){return a.x1-b.x1});
                        if (push == "left")
                            multiple.sort(function(a,b){return b.x2-a.x2});
                        if (push == "down")
                            multiple.sort(function(a,b){return a.y1-b.y1});
                        if (push == "up")
                            multiple.sort(function(a,b){return b.y2-a.y2});
                        while (multiple.length > 0) {
                            for (let k = 0; k < pbChain.length; k++) {
                                chainBlock = pbChain[pbChain.length-k-1];
                                const checkBlock = multiple[0];
                                if (push == "right" && chainBlock.y2 > checkBlock.y1 && chainBlock.y1 < checkBlock.y2 && chainBlock.x2 > checkBlock.x1 && chainBlock.x1 - (camera.pos.x - x) < checkBlock.x2) {
                                    const add = chainBlock.x2 - checkBlock.x1;
                                    checkBlock.x1 += add;
                                    checkBlock.x2 += add;
                                    pbChain.push(checkBlock);
                                    break;
                                } else if (push == "left" && chainBlock.y2 > checkBlock.y1 && chainBlock.y1 < checkBlock.y2 && chainBlock.x2 - (camera.pos.x - x) > checkBlock.x1 && chainBlock.x1 < checkBlock.x2) {
                                    const add = chainBlock.x1 - checkBlock.x2;
                                    checkBlock.x1 += add;
                                    checkBlock.x2 += add;
                                    pbChain.push(checkBlock);
                                    break;
                                } else if (push == "down" && chainBlock.x2 > checkBlock.x1 && chainBlock.x1 < checkBlock.x2 && chainBlock.y2 > checkBlock.y1 && chainBlock.y1 - (camera.pos.y - y) < checkBlock.y2) {
                                    const add = chainBlock.y2 - checkBlock.y1;
                                    checkBlock.y1 += add;
                                    checkBlock.y2 += add;
                                    pbChain.push(checkBlock);
                                    break;
                                } else if (push == "up" && chainBlock.x2 > checkBlock.x1 && chainBlock.x1 < checkBlock.x2 && chainBlock.y2 - (camera.pos.y - y) > checkBlock.y1 && chainBlock.y1 < checkBlock.y2) {
                                    const add = chainBlock.y1 - checkBlock.y2;
                                    checkBlock.y1 += add;
                                    checkBlock.y2 += add;
                                    pbChain.push(checkBlock);
                                    break;
                                }
                            }
                            multiple.shift();
                        }
                    }

                    // CHECK IF COLLIDE WITH WALL
                    for (let j = 0; j < pbChain.length; j++) {
                        const chainBlock = pbChain[j];
                        for (let k = 0; k < pbColliderArray.length; k++) {
                            const collider = pbColliderArray[k];
                            if (collider.type == "pb" || (collider.type == "kd" && collider.on == false) || collider.type == "key")
                                continue;
                            if (push == "right" && chainBlock.y2 > collider.y1 && chainBlock.y1 < collider.y2 && chainBlock.x2 > collider.x1 && chainBlock.x1 - (camera.pos.x - x) < collider.x2) {
                                const subtract = collider.x1 - chainBlock.x2;
                                for (let l = j - 1; l >= 0; l--) {
                                    const prevBlock = pbChain[l];
                                    if (prevBlock.x1 < collider.x1) {
                                        prevBlock.x1 += subtract;
                                        prevBlock.x2 += subtract;
                                    }
                                }
                                chainBlock.x1 += subtract;
                                chainBlock.x2 += subtract;
                                camera.toPos.x = pbChain[0].x1 - 10;
                                camera.pos.x = camera.toPos.x;
                                collideFix(camera.pos.x, "x");
                            } else if (push == "left" && chainBlock.y2 > collider.y1 && chainBlock.y1 < collider.y2 && chainBlock.x2 - (camera.pos.x - x) > collider.x1 && chainBlock.x1 < collider.x2) {
                                const subtract = collider.x2 - chainBlock.x1;
                                for (let l = j - 1; l >= 0; l--) {
                                    const prevBlock = pbChain[l];
                                    if (prevBlock.x2 > collider.x2) {
                                        prevBlock.x1 += subtract;
                                        prevBlock.x2 += subtract;
                                    }
                                }
                                chainBlock.x1 += subtract;
                                chainBlock.x2 += subtract;
                                camera.toPos.x = pbChain[0].x2 + 10;
                                camera.pos.x = camera.toPos.x;
                                collideFix(camera.pos.x, "x");
                                console.log("LEFT");
                            } else if (push == "down" && chainBlock.x2 > collider.x1 && chainBlock.x1 < collider.x2 && chainBlock.y2 > collider.y1 && chainBlock.y1 - (camera.pos.y - y) < collider.y2) {
                                const subtract = collider.y1 - chainBlock.y2;
                                for (let l = j - 1; l >= 0; l--) {
                                    const prevBlock = pbChain[l];
                                    if (prevBlock.y1 < collider.y1) {
                                        prevBlock.y1 += subtract;
                                        prevBlock.y2 += subtract;
                                    }
                                }
                                chainBlock.y1 += subtract;
                                chainBlock.y2 += subtract;
                                camera.toPos.y = pbChain[0].y1 - 10;
                                camera.pos.y = camera.toPos.y;
                                collideFix(camera.pos.y, "y");
                            } else if (push == "up" && chainBlock.x2 > collider.x1 && chainBlock.x1 < collider.x2 && chainBlock.y2 - (camera.pos.y - y) > collider.y1 && chainBlock.y1 < collider.y2) {
                                const subtract = collider.y2 - chainBlock.y1;
                                for (let l = j - 1; l >= 0; l--) {
                                    const prevBlock = pbChain[l];
                                    if (prevBlock.y2 > collider.y2) {
                                        prevBlock.y1 += subtract;
                                        prevBlock.y2 += subtract;
                                    }
                                }
                                chainBlock.y1 += subtract;
                                chainBlock.y2 += subtract;
                                camera.toPos.y = pbChain[0].y2 + 10;
                                camera.pos.y = camera.toPos.y;
                                collideFix(camera.pos.y, "y");
                            }
                            x = indivCoords[h][0];
                            y = indivCoords[h][1];
                        }
                    }
                } else if (objs[i].type == "c") {
                    clear();
                    phaseNumber++;
                    phase();
                    break;
                } else if (objs[i].type == "cb") {
                    winScreen();
                    indivCoords = [];
                }
            }
        }
    }

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
        coords.innerText = "(" + camera.pos.x + ", " + camera.pos.y + ")";

    // Update camera
    fixCamera();

    // Draw objects
    for (let i = 0; i < draw.length; i++)
        draw[i].draw();

    if (!end)
        requestAnimationFrame(run);

    //console.log(ramVar);
}

run();

function fixCamera() {
    camera.x1 = -cameraWidth + camera.pos.x;
    camera.x2 = cameraWidth + camera.pos.x;
    camera.y1 = -100 + camera.pos.y;
    camera.y2 = 100 + camera.pos.y;
    player.x1 = (camera.x2+camera.x1)/2 - length;
    player.x2 = (camera.x2+camera.x1)/2 + length;
    player.y1 = (camera.y2+camera.y1)/2 - length;
    player.y2 = (camera.y2+camera.y1)/2 + length;
}

function collide(x, y, obj) {
    const left = x - (obj.x1 - 10);
    const right = x - (obj.x2 + 10);
    const top = y - (obj.y1 - 10);
    const bottom = y - (obj.y2 + 10);
    const sideCollide = Math.min(Math.abs(left), Math.abs(right), Math.abs(top), Math.abs(bottom));
    switch (sideCollide) {
        case Math.abs(left):
            return "left";
            break;
        case Math.abs(right):
            return "right";
            break;
        case Math.abs(top):
            return "top";
            break;
        case Math.abs(bottom):
            return "bottom";
            break;
    }
}

function collideFix(val, coord) {
    if (coord == "x")
        for (let i = 0; i < indivCoords.length; i++)
            indivCoords[i][0] = val;
    if (coord == "y")
        for (let i = 0; i < indivCoords.length; i++)
            indivCoords[i][1] = val;
}

// END OF COMPLEX CODE (simple interface below)

function deathScreen() {
    end = true;
    stopTimer();
    document.exitPointerLock();
	document.body.innerHTML = "";
	document.body.style.backgroundColor = "#f78b8b";
	const deathMessage = document.createElement("h1");
	deathMessage.innerText = "You died!";
	deathMessage.style.fontSize = "75px";
	deathMessage.style.marginTop = "40vh";
	deathMessage.style.textAlign = "center";
	const resetButton = document.createElement("button");
	resetButton.onclick = function() {location.reload();};
	resetButton.innerText = 'Hit "r" or this button to reset';
	resetButton.style.margin = "auto";
	resetButton.style.display = "flex";
	resetButton.style.justifyContent = "center";
	const backToMenu = document.createElement("button");
	backToMenu.onclick = function() {location.replace("Menu.html");}
	backToMenu.innerText = 'Return to menu';
	backToMenu.style.margin = "auto";
	backToMenu.style.marginTop = "30px";
	backToMenu.style.display = "flex";
	backToMenu.style.justifyContent = "center";
	document.body.appendChild(deathMessage);
	document.body.appendChild(resetButton);
	document.body.appendChild(backToMenu);
	document.body.onkeydown = function(e){	
        if (e.key == "r") {
            location.reload();
        }
    }
}

function winScreen() {
    end = true;
    stopTimer();

    // COMPLETE CHECKER
    if (localStorage.getItem(id + "complete") == "false")
        localStorage.setItem(id + "complete", true);

    // TOTAL COMPLETES
    const TC = levelID + "TC";
    if (localStorage.getItem(TC) == null)
        localStorage.setItem(TC, 0);
    localStorage.setItem(TC, parseInt(localStorage.getItem(TC)) + 1);

    // BEST TIME
    const BT = levelID + "BT";
    if (localStorage.getItem(BT) == null)
        localStorage.setItem(BT, totalTime);
    if (totalTime < parseInt(localStorage.getItem(BT)))
        localStorage.setItem(BT, totalTime);

    document.exitPointerLock();
	document.body.innerHTML = "";
	document.body.style.backgroundColor = "#99ffb4";
	const winMessage = document.createElement("h1");
	winMessage.innerText = "Success!";
	winMessage.style.fontSize = "75px";
	winMessage.style.marginTop = "40vh";
	winMessage.style.textAlign = "center";
	const timeTaken = document.createElement("p");
	timeTaken.innerText = "Time: " + time[0] + " hours, " + time[1] + " minutes, " + time[2] + " seconds, " + time[3] + " millseceonds";
	timeTaken.style.textAlign = "center";
	const returnToMenu = document.createElement("button");
    returnToMenu.onclick = function() {location.replace("../Menu.html");}
	returnToMenu.innerText = 'Return to menu';
	returnToMenu.style.margin = "auto";
	returnToMenu.style.display = "flex";
	returnToMenu.style.justifyContent = "center";
	document.body.appendChild(winMessage);
	document.body.appendChild(timeTaken);
	document.body.appendChild(returnToMenu);
}

function stopTimer() {
    endTime = Date.now();
    if (!startTime)
        startTime = endTime;
    let duration = endTime - startTime;
    time[0] = Math.floor(duration/3600000);
    duration %= 3600000;
    time[1] = Math.floor(duration/60000);
    duration %= 60000;
    time[2] = Math.floor(duration/1000);
    duration %= 1000;
    time[3] = duration;
    totalTime = 3600000*time[0] + 60000*time[1] + 1000*time[2] + time[3];

    // PLAYTIME
    const PT = levelID + "PT";
    if (localStorage.getItem(PT) == null)
        localStorage.setItem(PT, 0);
    localStorage.setItem(PT, parseInt(localStorage.getItem(PT)) + totalTime);

    // GRAND TOTAL PLAYTIME
    if (localStorage.getItem("Playtime") == null)
        localStorage.setItem("Playtime", 0);
        localStorage.setItem("Playtime", parseInt(localStorage.getItem("Playtime")) + totalTime);
}

function clear() {
    draw = [SC, player];
    objs = [SC, player];
    camera.toPos.x = 0;
    camera.toPos.y = 0;
    camera.pos.x = 0;
    camera.pos.y = 0;
    indivCoords = [];
    tpArray = [];
    keyArray = [];
    pbArray = [];
    pbColliderArray = [];
}

// key shortcuts

document.body.onkeydown = function(e){
    if (e.key == "n" || e.key == "N") {
        noclip = noclip ? false : true;
        showCoords = showCoords ? false : true;
        coords.style.visibility = showCoords ? "visible" : "hidden";
    }
    if (end == false && e.key == "r" || e.key == "R") {
        deathScreen();
    }
    if (e.key == "ArrowRight") {
        phaseNumber++;
        clear();
        phase();
    } else if (e.key == "ArrowLeft") {
        phaseNumber--;
        clear();
        phase();
    }
}