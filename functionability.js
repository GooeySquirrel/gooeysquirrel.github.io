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

class Square {
    constructor(x1, x2, y1, y2, type) {
        if (type != "camera") { // SPECIAL TYPE
            this.x1 = x1;
            this.x2 = x2;
            this.y1 = y1;
            this.y2 = y2;
            this.type = type;
            objs.push(this);
        } else {
            this.toPos = new Vector(0, 0);
            this.pos = new Vector(0, 0);
            this.tempPos = new Vector(0, 0);
        }
    }

    draw() {
        let x = (this.x1-camera.x1)/(camera.x2-camera.x1)*canvas.width;
        let y = (this.y1-camera.y1)/(camera.y2-camera.y1)*canvas.height;
        let w = (this.x2-camera.x1)/(camera.x2-camera.x1)*canvas.width-x;
        let h = (this.y2-camera.y1)/(camera.y2-camera.y1)*canvas.height-y;

        ctx.beginPath();
        ctx.rect(x, y, w, h);
        if (this.type == "player")
            ctx.fillStyle = "gray";
        else if (this.type == "w")
            ctx.fillStyle = "black";
        else if (this.type == "kb")
            ctx.fillStyle = "orange";
        else if (this.type == "db")
            ctx.fillStyle = "red";
        else if (this.type == "c")
            ctx.fillStyle = "#ffff99";
        else if (this.type == "cb")
            ctx.fillStyle = "green";
        ctx.fill();
    }
}

class Circle {
    constructor(x, y, r, type) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.type = type;
        objs.unshift(this);
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

const canvas = document.getElementById("canvas");
canvas.width = window.screen.width;
canvas.height = window.screen.height;
const factor = 200/canvas.height;
const ctx = canvas.getContext("2d");

const cameraWidth = parseInt(100*canvas.width/canvas.height);
const camera = new Square(-cameraWidth, cameraWidth, -100, 100, "camera");
let indivCoords = [];
const player = new Square(-10, 10, -10, 10, "player");
const length = (player.x2-player.x1)/2;
const SC = new Circle(0, 0, 25, "SC");

let phaseNumber = 1;
let pause = true;
let end = false;
let time = [0, 0, 0, 0];
let startTime, endTime;

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

function run() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    camera.tempPos.x = camera.pos.x;
    camera.tempPos.y = camera.pos.y;

    camera.pos.interpolate(camera.toPos);
    
    // Detect movement
    indivCoords = [[camera.tempPos.x, camera.tempPos.y]];
    if (!camera.tempPos.equals(camera.pos)) {
        const movements = [Math.abs(camera.pos.x-camera.tempPos.x), Math.abs(camera.pos.y-camera.tempPos.y)];
        movements.sort(function(a,b){return b-a});
        const checks = Math.floor(movements[0]/20);
        const changeX = (camera.pos.x-camera.tempPos.x)/(checks+1);
        const changeY = (camera.pos.y-camera.tempPos.y)/(checks+1);
        for (let i = 0; i <= checks; i++) {
            const x = camera.tempPos.x+(changeX*(i+1));
            const y = camera.tempPos.y+(changeY*(i+1));
            indivCoords.push([x, y]);
        }
    }
    //console.log(camera.pos.x + ", " + camera.pos.y)

    // Square collisions
    for (let h = 0; h < indivCoords.length; h++) {
        const x = indivCoords[h][0];
        const y = indivCoords[h][1];
        for (let i = 0; i < objs.length; i++) {
            if (objs[i].type == "w") {
                if (x > objs[i].x1 - 10 && x < objs[i].x2 + 10 && y > objs[i].y1 - 10 && y < objs[i].y2 + 10) {
                    if (camera.tempPos.x <= objs[i].x1 - 10) {
                        camera.toPos.x = objs[i].x1 - 10;
                        camera.pos.x = (camera.toPos.x+camera.tempPos.x)/2;
                        collideFix(camera.pos.x, "x");
                    }
                    if (camera.tempPos.x >= objs[i].x2 + 10) {
                        camera.toPos.x = objs[i].x2 + 10;
                        camera.pos.x = (camera.toPos.x+camera.tempPos.x)/2;
                        collideFix(camera.pos.x, "x");
                    }
                    if (camera.tempPos.y <= objs[i].y1 - 10) {
                        camera.toPos.y = objs[i].y1 - 10;
                        camera.pos.y = (camera.toPos.y+camera.tempPos.y)/2;
                        collideFix(camera.pos.y, "y");
                    }
                    if (camera.tempPos.y >= objs[i].y2 + 10) {
                        camera.toPos.y = objs[i].y2 + 10;
                        camera.pos.y = (camera.toPos.y+camera.tempPos.y)/2;
                        collideFix(camera.pos.y, "y");
                    }
                }
            } else if (objs[i].type == "kb") { 
                if (x > objs[i].x1 - 10 && x < objs[i].x2 + 10 && y > objs[i].y1 - 10 && y < objs[i].y2 + 10) {
                    camera.toPos.x = 0;
                    camera.toPos.y = 0;
                    camera.pos.x = 0;
                    camera.pos.y = 0;
                    indivCoords = [[camera.toPos.x, camera.toPos.y]];
                }
            } else if (objs[i].type == "db") {
                if (x > objs[i].x1 - 10 && x < objs[i].x2 + 10 && y > objs[i].y1 - 10 && y < objs[i].y2 + 10) {
                    deathScreen();
                    indivCoords = [];
                }
            } else if (objs[i].type == "c") {
                if (x > objs[i].x1 - 10 && x < objs[i].x2 + 10 && y > objs[i].y1 - 10 && y < objs[i].y2 + 10) {
                    objs.splice(2, objs.length-2);
                    camera.toPos.x = 0;
                    camera.toPos.y = 0;
                    camera.pos.x = 0;
                    camera.pos.y = 0;
                    indivCoords = [[camera.toPos.x, camera.toPos.y]];
                    phaseNumber++;
                    phase();
                }
            } else if (objs[i].type == "cb") {
                if (x > objs[i].x1 - 10 && x < objs[i].x2 + 10 && y > objs[i].y1 - 10 && y < objs[i].y2 + 10) {
                    winScreen();
                    indivCoords = [];
                }
            }
        }
    }

    // Update camera
    fixCamera();

    // Draw objects
    for (let i = 0; i < objs.length; i++)
        objs[i].draw();

    if (!end)
        requestAnimationFrame(run);
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
	backToMenu.onclick = function() {location.replace("../Menu.html");}
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
    let duration = endTime - startTime;

    time[0] = Math.floor(duration/3600000);
    duration %= 3600000;
    time[1] = Math.floor(duration/60000);
    duration %= 60000;
    time[2] = Math.floor(duration/1000);
    duration %= 1000;
    time[3] = duration;
}

// END OF SIMPLE CODE (other below)

function phase() {
    if (phaseNumber == 1) {
        const c = new Square(-100, -50, -100, -50, "c");
        const cb = new Square(100, 150, -100, -50, "cb");
        const sq1 = new Square(15, 50, 0, 50, "w");
        const sq2 = new Square(0, 50, -51, -50, "kb");
        const sq3 = new Square(50, 100, 50, 100, "w");
        const sq4 = new Square(200, 300, 100, 150, "db");
        const sq5 = new Square(-50, -5, 10, 50, "db");
    } else if (phaseNumber == 2) {

    }
}

phase();