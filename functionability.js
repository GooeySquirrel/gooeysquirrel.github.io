let x;
let y;
let respawnPoint;
let tempX;
let tempY;
let arrayOfCoords = [];
let wTouched = [];
let kbTouched = [];
let dbTouched = [];
let pbTouched = [];
let levelEnded = false;
let startTime;
let endTime;
let totalTime = [0, 0, 0, 0];
let noclip = false;
let push;
let bump = [];
let dev = true;

let lock_image = new Image();
lock_image.src = 'lock.png';

//MOBILE
var deltaX = 0;
var deltaY = 0;
var previousX = 0;
var previousY = 0;
document.addEventListener("touchmove", (e) => {
	if (previousX !== 0 || previousY !== 0) {
		deltaX = parseInt(event.touches[0].clientX - previousX);
		deltaY = parseInt(event.touches[0].clientY - previousY);
		x += deltaX;
		y += deltaY;
	}
	
	previousX = event.touches[0].clientX;
	previousY = event.touches[0].clientY;
});

document.addEventListener("touchend", (e) => {
    deltaX = 0;
    deltaY = 0;
	previousX = 0;
	previousY = 0;
});

document.addEventListener('pointerlockchange', lockChangeAlert, false);
function lockChangeAlert() {
	if(document.pointerLockElement === canvas) {
		document.addEventListener("mousemove", canvasLoop, false);
		if (startTime == undefined) {
			startTime = Date.now();
			TAcounter(levelId);
		}
	} else {
		document.removeEventListener("mousemove", canvasLoop, false);
	}
}

function canvasLoop(e) {
	x += e.movementX;
	y += e.movementY;
	arrayOfCoords = [];
}

function functionability() {
	ctx.clearRect(0, 0, c.width, c.height);
	
	//IN-DEPTH SCANNER FOR COLLISIONS
	if (x - tempX !== 0 || y - tempY !== 0) {
		let movements = [Math.abs(x - tempX), Math.abs(y - tempY)];
		movements.sort(function(a,b){return b-a});
		let changeX = (x - tempX) / Math.abs(movements[0]);
		let changeY = (y - tempY) / Math.abs(movements[0]);
		for (let i = 0; i < Math.abs(movements[0]); i++) {
			let xCoord = tempX + (changeX * (i + 1));
			let yCoord = tempY + (changeY * (i + 1));
			arrayOfCoords.push([xCoord, yCoord]);
		}
	}
	
	//MOVING BLOCKS
	for (let i = 0; i < movingBlockArray.length; i++) {
		let block = blockArray[movingBlockArray[i][0]];
		let speed = movingBlockArray[i][1][movingBlockArray[i][1].length-1];
		let xSpeed;
		let ySpeed;
		let xGain;
		let yGain;
		if (movingBlockArray[i][1][0][2] == undefined) {
			for (let j = 0; j < movingBlockArray[i][1].length-1; j++) {
				movingBlockArray[i][1][j].push(block[4], block[5]);
			}
		}
		//POSITION IN MOVING BLOCKS ARRAY DETECTOR
		let pos = movingBlockArray[i][6];
		if (pos == 0) {
			xSpeed = movingBlockArray[i][1][0][0] - movingBlockArray[i][2];
			ySpeed = movingBlockArray[i][1][0][1] - movingBlockArray[i][3];
			xGain = movingBlockArray[i][1][0][2] - movingBlockArray[i][4];
			yGain = movingBlockArray[i][1][0][3] - movingBlockArray[i][5];
		} else if (pos < movingBlockArray[i][1].length-1) {
			xSpeed = movingBlockArray[i][1][pos][0] - movingBlockArray[i][1][pos-1][0];
			ySpeed = movingBlockArray[i][1][pos][1] - movingBlockArray[i][1][pos-1][1];
			xGain = movingBlockArray[i][1][pos][2] - movingBlockArray[i][1][pos-1][2];
			yGain = movingBlockArray[i][1][pos][3] - movingBlockArray[i][1][pos-1][3];
		} else if (pos == movingBlockArray[i][1].length-1) {
			xSpeed = movingBlockArray[i][1][0][0] - movingBlockArray[i][1][pos-1][0];
			ySpeed = movingBlockArray[i][1][0][1] - movingBlockArray[i][1][pos-1][1];
			xGain = movingBlockArray[i][1][0][2] - movingBlockArray[i][1][pos-1][2];
			yGain = movingBlockArray[i][1][0][3] - movingBlockArray[i][1][pos-1][3];
			pos = 0;
		}
				
		//SPEED CALCULATOR
		let arrayOfSpeeds = [Math.abs(xSpeed), Math.abs(ySpeed)];
		arrayOfSpeeds.sort(function(a,b){return a-b});
		if (xSpeed !== 0) {
			xSpeed = xSpeed*speed / arrayOfSpeeds[1];
		}
		if (ySpeed !== 0) {
			ySpeed = ySpeed*speed / arrayOfSpeeds[1];
		}
		let arrayOfGains = [Math.abs(xGain), Math.abs(yGain)];
		arrayOfGains.sort(function(a,b){return a-b});
		if (xGain !== 0) {
			xGain = xGain*speed / arrayOfGains[1];
		}
		if (yGain !== 0) {
			yGain = yGain*speed / arrayOfGains[1];
		}

		//CLEAR LAST BLOCK FROM CANVAS
		ctx.clearRect(Math.round(block[2]), Math.round(block[3]), Math.round(block[4]), Math.round(block[5]));
		if (block[1][0] == "tp") {
			if (block[1][1] == "left" || block[1][1] == "right") {
				ctx.clearRect(Math.round(block[2])-5, Math.round(block[3])+15, 5, 20);
			}
			if (block[1][1] == "top" || block[1][1] == "bottom") {
				ctx.clearRect(Math.round(block[2])-5, Math.round(block[3])+15, 20, 5);
			}
		}
		
		//MOVER
		if (block[2] !== movingBlockArray[i][1][pos][0]) {
			block[2] += xSpeed;
		}
		if (xSpeed > 0 && block[2] > movingBlockArray[i][1][pos][0] || xSpeed < 0 && block[2] < movingBlockArray[i][1][pos][0]) {
			block[2] = movingBlockArray[i][1][pos][0];
		}
		
		if (block[3] !== movingBlockArray[i][1][pos][1]) {
			block[3] += ySpeed;
		}
		if (ySpeed > 0 && block[3] > movingBlockArray[i][1][pos][1] || ySpeed < 0 && block[3] < movingBlockArray[i][1][pos][1]) {
			block[3] = movingBlockArray[i][1][pos][1];
		}
		if (block[4] !== movingBlockArray[i][1][pos][2]) {
			block[4] += xGain;
		}
		if (xGain > 0 && block[4] > movingBlockArray[i][1][pos][2] || xGain < 0 && block[4] < movingBlockArray[i][1][pos][2]) {
			block[4] = movingBlockArray[i][1][pos][2];
		}
		
		if (block[5] !== movingBlockArray[i][1][pos][3]) {
			block[5] += yGain;
		}
		if (yGain > 0 && block[5] > movingBlockArray[i][1][pos][3] || yGain < 0 && block[5] < movingBlockArray[i][1][pos][3]) {
			block[5] = movingBlockArray[i][1][pos][3];
		}
		if (xSpeed > 0 && xGain > 0 || ySpeed > 0 && yGain > 0 || xSpeed < 0 && xGain < 0 || ySpeed < 0 && yGain < 0) {
			block[6] = movingBlockArray[i][1][movingBlockArray[i][1].length-1]*2;
		}
		if (block[2] == movingBlockArray[i][1][pos][0] && block[3] == movingBlockArray[i][1][pos][1] && block[4] == movingBlockArray[i][1][pos][2] && block[5] == movingBlockArray[i][1][pos][3]) {
			if (movingBlockArray[i][6] == movingBlockArray[i][1].length-1) {
				movingBlockArray[i][6] = 1;
			} else {
				movingBlockArray[i][6]++;
			}
		}
		
		//MOVING W DETECTS PB this code fucking sucks
		if (block[1] == "w") {
			for (let j = 0; j < pbArray.length; j++) {
				let pb = [];
				let firstPb = blockArray[pbArray[j]];
				pb.push(firstPb);
				if (block[2] + block[4] > firstPb[2] && block[2] < firstPb[2] + firstPb[4] && block[3] + block[5] > firstPb[3] && block[3] < firstPb[3] + firstPb[5]) {
					let leftSide = block[2] + block[4] - firstPb[2];
					let rightSide = firstPb[2] + firstPb[4] - block[2];
					let topSide = block[3] + block[5] - firstPb[3];
					let bottomSide = firstPb[3] + firstPb[5] - block[3];
					let orderSides = [leftSide, rightSide, topSide, bottomSide];
					orderSides.sort(function(a,b){return a-b});
					if (leftSide == orderSides[0]) {
						firstPb[2] = block[2] + block[4];
					} else if (rightSide == orderSides[0]) {
						firstPb[2] = block[2] - firstPb[4];
					} else if (topSide == orderSides[0]) {
						firstPb[3] = block[3] + block[5];
					} else if (bottomSide == orderSides[0]) {
						firstPb[3] = block[3] - firstPb[5];
					}
					for (k = 0; k < pb.length; k++) {
						let currentPb = pb[k]
						for (l = 0; l < pbArray.length; l++) {
							let otherPb = blockArray[pbArray[l]];
							if (currentPb !== otherPb) {
								if (currentPb[2] + currentPb[4] > otherPb[2] && currentPb[2] < otherPb[2] + otherPb[4] && currentPb[3] + currentPb[5] > otherPb[3] && currentPb[3] < otherPb[3] + otherPb[5]) {
									let leftSide = currentPb[2] + currentPb[4] - otherPb[2];
									let rightSide = otherPb[2] + otherPb[4] - currentPb[2];
									let topSide = currentPb[3] + currentPb[5] - otherPb[3];
									let bottomSide = otherPb[3] + otherPb[5] - currentPb[3];
									let orderSides = [leftSide, rightSide, topSide, bottomSide];
									orderSides.sort(function(a,b){return a-b});
									if (leftSide == orderSides[0]) {
										otherPb[2] = currentPb[2] + currentPb[4];
									} else if (rightSide == orderSides[0]) {
										otherPb[2] = currentPb[2] - otherPb[4];
									} else if (topSide == orderSides[0]) {
										otherPb[3] = currentPb[3] + currentPb[5];
									} else if (bottomSide == orderSides[0]) {
										otherPb[3] = currentPb[3] - otherPb[5];
									}
									pb.push(otherPb);
								}
							}
						}
					}
				}
			}
		}
	}
	
	//FIX CANVAS
	for (let i = 0; i < blockArray.length; i++) {
		let block = blockArray[i][0];
		let type = blockArray[i][1];
		let p1 = blockArray[i][2];
		let p2 = blockArray[i][3];
		let p3 = blockArray[i][4];
		let p4 = blockArray[i][5];
		fixCanvas(block, type, p1, p2, p3, p4);
	}
		
	//get block name
	for (let j = 0; j < blockId; j++) {
		if (x > leftEdge(j) && x < rightEdge(j) && y > topEdge(j) && y < bottomEdge(j)) {
			document.getElementById("blockName").innerText = blockArray[j];
		}
	}

	//COLLISIONS
	if (noclip == false) {
	for (let i = 0; i < arrayOfCoords.length; i++) {
		let individualX = arrayOfCoords[i][0];
		let individualY = arrayOfCoords[i][1];
		for (let j = 0; j < blockId; j++) {
			var speed = 0;
			if (blockArray[j][6] !== undefined) {
				speed = blockArray[j][6];
			}
			var block = blockArray[j];
			if (block[1] == "w") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j)) {
					if (tempX <= leftEdge(j) + speed) {
						if (x-tempX > -1) {
							x = leftEdge(j);
							tempArrayOfCoords(x);
							wTouched[0] = i;
						}
					} else if (tempX >= rightEdge(j) - speed) {
						if (x-tempX < 1) {
							x = rightEdge(j);
							tempArrayOfCoords(x);
							wTouched[0] = i;
						}
					} else if (tempY <= topEdge(j) + speed) {
						if (y-tempY > -1) {
							y = topEdge(j);
							tempArrayOfCoords(y);
							wTouched[0] = i;
						}
					} else if (tempY >= bottomEdge(j) - speed) {
						if (y-tempY < 1) {
							y = bottomEdge(j);
							tempArrayOfCoords(y);
							wTouched[0] = i;
						}
					} else {
						let leftSide = individualX + 20 - block[2];
						let rightSide = block[2] + block[4] - individualX;
						let topSide = individualY + 20 - block[3];
						let bottomSide = block[3] + block[5] - individualY;
						let orderSides = [leftSide, rightSide, topSide, bottomSide];
						orderSides.sort(function(a,b){return a-b});
						if (leftSide == orderSides[0]) {
							x = block[2] - 20;
							tempArrayOfCoords(x);
						} else if (rightSide == orderSides[0]) {
							x = block[2] + block[4];
							tempArrayOfCoords(x);
						} else if (topSide == orderSides[0]) {
							y = block[3] - 20;
							tempArrayOfCoords(y);
						} else if (bottomSide == orderSides[0]) {
							y = block[3] + block[5];
							tempArrayOfCoords(y);
						}
					}
				}
			} else if (block[1] == "kb") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j)) {
					if (tempX <= leftEdge(j) + speed) {
						kbTouched[0] = i;
					} else if (tempX >= rightEdge(j) - speed) {
						kbTouched[0] = i;
					} else if (tempY <= topEdge(j) + speed) {
						kbTouched[0] = i;
					} else if (tempY >= bottomEdge(j) - speed) {
						kbTouched[0] = i;
					} else {
						for (let k = 0; k < keyArray.length; k++) {
							keyArray[k] = "locked";
						}
						for (let k = 0; k < pbInitialArray.length; k++) {
							let block = blockArray[pbInitialArray[k][0]];
							let blockInitial = pbInitialArray[k];
							block[2] = blockInitial[1];
							block[3] = blockInitial[2];
						}
						x = respawnPoint[0];
						y = respawnPoint[1];
						arrayOfCoords = [[x, y]];
					}
				}
			} else if (block[1] == "db") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j) && arrayOfCoords[0][0] !== respawnPoint[0] && arrayOfCoords[0][1] !== respawnPoint[1]) {
					if (tempX <= leftEdge(j) + speed) {
						dbTouched[0] = i;
					} else if (tempX >= rightEdge(j) - speed) {
						dbTouched[0] = i;
					} else if (tempY <= topEdge(j) + speed) {
						dbTouched[0] = i;
					} else if (tempY >= bottomEdge(j) - speed) {
						dbTouched[0] = i;
					} else {
						deathScreen();
					}
				}
			} else if (block[1][0] == "tp") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j)) {
					var counterpart = block[0];
					if (counterpart[counterpart.length - 1] == "A") {
						counterpart = blockArray[j+1];
					} else if (counterpart[counterpart.length - 1] == "B") {
						counterpart = blockArray[j-1];
					}
					if (counterpart[1][1] == "left") {
						x = counterpart[2] - 20;
						y = counterpart[3] + 15;
					} else if (counterpart[1][1] == "right") {
						x = counterpart[2] + 10;
						y = counterpart[3] + 15;
					} else if (counterpart[1][1] == "top") {
						x = counterpart[2] + 15;
						y = counterpart[3] - 20;
					} else if (counterpart[1][1] == "bottom") {
						x = counterpart[2] + 15;
						y = counterpart[3] + 10;
					}
					arrayOfCoords = [];
				}
			} else if (block[1] == "k") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j)) {
					keyArray[block[0].substring(1)-1] = "unlocked";
					if (tempX <= leftEdge(j) + speed) {
						x = leftEdge(j);
						tempArrayOfCoords(x);
					} else if (tempX >= rightEdge(j) - speed) {
						x = rightEdge(j);
						tempArrayOfCoords(x);
					} else if (tempY <= topEdge(j) + speed) {
						y = topEdge(j);
						tempArrayOfCoords(y);
					} else if (tempY >= bottomEdge(j) - speed) {
						y = bottomEdge(j);
						tempArrayOfCoords(y);
					}
				}
			} else if (block[1] == "kd") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j) && keyArray[block[0].substring(2)-1] == "locked") {
					if (tempX <= leftEdge(j) + speed) {
						x = leftEdge(j);
						tempArrayOfCoords(x);
					} else if (tempX >= rightEdge(j) - speed) {
						x = rightEdge(j);
						tempArrayOfCoords(x);
					} else if (tempY <= topEdge(j) + speed) {
						y = topEdge(j);
						tempArrayOfCoords(y);
					} else if (tempY >= bottomEdge(j) - speed) {
						y = bottomEdge(j);
						tempArrayOfCoords(y);
					}
				}
			} else if (block[1][0] == "Tkb") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j) && block[1][2] == "on") {
					for (let k = 0; k < keyArray.length; k++) {
						keyArray[k] = "locked";
					}
					for (let k = 0; k < pbInitialArray.length; k++) {
						let block = blockArray[pbInitialArray[k][0]];
						let blockInitial = pbInitialArray[k];
						block[2] = blockInitial[1];
						block[3] = blockInitial[2];
					}
					x = respawnPoint[0];
					y = respawnPoint[1];
					arrayOfCoords = [[x, y]];
					
				}
			} else if (block[1][0] == "Tdb") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j) && block[1][2] == "on") {
					deathScreen();
				}
			} else if (block[1] == "pb") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j)) {
					let pb = [];
					if (tempX <= leftEdge(j)) {
						pb.push(block);
						ctx.clearRect(Math.round(block[2]), Math.round(block[3]), Math.round(block[4]), Math.round(block[5]));
						block[2] = Math.round(individualX) + 20;
						push = "r";
					} else if (tempX >= rightEdge(j)) {
						pb.push(block);
						ctx.clearRect(Math.round(block[2]), Math.round(block[3]), Math.round(block[4]), Math.round(block[5]));
						block[2] = Math.round(individualX) - block[4];
						push = "l";
					} else if (tempY <= topEdge(j)) {
						pb.push(block);
						ctx.clearRect(Math.round(block[2]), Math.round(block[3]), Math.round(block[4]), Math.round(block[5]));
						block[3] = Math.round(individualY) + 20;
						push = "d";
					} else if (tempY >= bottomEdge(j)) {
						pb.push(block);
						ctx.clearRect(Math.round(block[2]), Math.round(block[3]), Math.round(block[4]), Math.round(block[5]));
						block[3] = Math.round(individualY) - block[5];
						push = "u";
					} else {
						let leftSide = individualX + 20 - block[2];
						let rightSide = block[2] + block[4] - individualX;
						let topSide = individualY + 20 - block[3];
						let bottomSide = block[3] + block[5] - individualY;
						let orderSides = [leftSide, rightSide, topSide, bottomSide];
						orderSides.sort(function(a,b){return a-b});
						if (leftSide == orderSides[0]) {
							x = block[2] - 20;
							tempArrayOfCoords(x);
						} else if (rightSide == orderSides[0]) {
							x = block[2] + block[4];
							tempArrayOfCoords(x);
						} else if (topSide == orderSides[0]) {
							y = block[3] - 20;
							tempArrayOfCoords(y);
						} else if (bottomSide == orderSides[0]) {
							y = block[3] + block[5];
							tempArrayOfCoords(y);
						}
					}
					//PUSHES OTHER PB BLOCKS
					if (pb.length !== 0) {
					for (let k = 0; k < pb.length; k++) {
						let currentPb = pb[k];
						for (let l = 0; l < pbArray.length; l++) {
							let otherPb = blockArray[pbArray[l]];
							if (currentPb !== otherPb) {
								if (currentPb[2] + currentPb[4] > otherPb[2] && currentPb[2] < otherPb[2] + otherPb[4] && currentPb[3] + currentPb[5] > otherPb[3] && currentPb[3] < otherPb[3] + otherPb[5]) {
									ctx.clearRect(Math.round(otherPb[2]), Math.round(otherPb[3]), Math.round(otherPb[4]), Math.round(otherPb[5]));
									if (push == "r") {
										otherPb[2] = currentPb[2] + currentPb[4];
									} else if (push == "l") {
										otherPb[2] = currentPb[2] - otherPb[4];
									} else if (push == "d") {
										otherPb[3] = currentPb[3] + currentPb[5];
									} else if (push == "u") {
										otherPb[3] = currentPb[3] - otherPb[5];
									}
									pb.push(otherPb);
									ctx.beginPath();
									ctx.fillStyle = "#873e23";
									ctx.rect(Math.round(otherPb[2]), Math.round(otherPb[3]), Math.round(otherPb[4]), Math.round(otherPb[5]));
									ctx.fill();
								}
							}
						}
					}
					//DETECTS W COLLISION WITH PB
					for (let k = 0; k < colliderArray.length; k++) {
						let wall = blockArray[colliderArray[k]];
						let prevent = false;
						if (wall[1] == "kd") {
							if (keyArray[wall[0].substring(2)-1] == "unlocked") {
								prevent = true;
							}
						}
						if (prevent == false) {
						for (let l = 0; l < pb.length; l++) {
							let finalPb = pb[l];
							if (finalPb[2] + finalPb[4] > wall[2] && finalPb[2] < wall[2] + wall[4] && finalPb[3] + finalPb[5] > wall[3] && finalPb[3] < wall[3] + wall[5]) {
								if (wall[1] == "k") {
									keyArray[wall[0].substring(1)-1] = "unlocked";
								}
								if (push == "r") {
									let former = finalPb[2];
									finalPb[2] = wall[2] - finalPb[4];
									former -= finalPb[2];
									for (let m = pb.length-2; m > -1; m--) {
										pb[m][2] -= former;
									}
									wTouched[0] = i;
									x = pb[0][2] - 20;
									tempArrayOfCoords(x);
									bump.push([pb, "r"])
								} else if (push == "l") {
									let former = finalPb[2];
									finalPb[2] = wall[2] + wall[4];
									former -= finalPb[2];
									for (let m = pb.length-2; m > -1; m--) {
										pb[m][2] -= former;
									}
									wTouched[0] = i;
									x = pb[0][2] + pb[0][4];
									tempArrayOfCoords(x);
									bump.push([pb, "l"])
								} else if (push == "d") {
									let former = finalPb[3];
									finalPb[3] = wall[3] - finalPb[5];
									former -= finalPb[3];
									for (let m = pb.length-2; m > -1; m--) {
										pb[m][3] -= former;
									}
									wTouched[0] = i;
									y = pb[0][3] - 20;
									tempArrayOfCoords(y);
									bump.push([pb, "d"])
								} else if (push == "u") {
									let former = finalPb[3];
									finalPb[3] = wall[3] + wall[5];
									former -= finalPb[3];
									for (let m = pb.length-2; m > -1; m--) {
										pb[m][3] -= former;
									}
									wTouched[0] = i;
									y = pb[0][3] + pb[0][5];
									tempArrayOfCoords(y);
									bump.push([pb, "u"])
								}
							}
						}
						}
					}
					}
					ctx.beginPath();
					ctx.fillStyle = "#873e23";
					ctx.rect(Math.round(block[2]), Math.round(block[3]), Math.round(block[4]), Math.round(block[5]));
					ctx.fill();
				}
			} else if (block[1] == "C") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j)) {
					phaseNumber++;
					phase();
				}
			} else if (block[1] == "CB") {
				if (individualX > leftEdge(j) && individualX < rightEdge(j) && individualY > topEdge(j) && individualY < bottomEdge(j)) {
					winScreen();
				}
			}
		}	
	}
	}
	
	//OVERRIDES TOUCHING W/PB OVER KB/DB
	if (wTouched.length == 0 && pbTouched.length == 0 && kbTouched.length !== 0) {
		for (let k = 0; k < keyArray.length; k++) {
			keyArray[k] = "locked";
		}
		for (let k = 0; k < pbInitialArray.length; k++) {
			let block = blockArray[pbInitialArray[k][0]];
			let blockInitial = pbInitialArray[k];
			block[2] = blockInitial[1];
			block[3] = blockInitial[2];
		}
		x = respawnPoint[0];
		y = respawnPoint[1];
		arrayOfCoords = [[x, y]];
	}
	if (wTouched.length == 0 && pbTouched.length == 0 && dbTouched.length !== 0) {
		deathScreen();
	}
	if (wTouched.length !== 0) {
		if (kbTouched.length !== 0 && wTouched[0] < kbTouched[0]) {
			for (let k = 0; k < keyArray.length; k++) {
				keyArray[k] = "locked";
			}
			for (let k = 0; k < pbInitialArray.length; k++) {
				let block = blockArray[pbInitialArray[k][0]];
				let blockInitial = pbInitialArray[k];
				block[2] = blockInitial[1];
				block[3] = blockInitial[2];
			}
			x = respawnPoint[0];
			y = respawnPoint[1];
			arrayOfCoords = [[x, y]];
		}
		if (dbTouched.length !== 0 && wTouched[0] < dbTouched[0]) {
			deathScreen();
		}
	}
	if (pbTouched.length !== 0) {
		if (kbTouched.length !== 0 && pbTouched[0] < kbTouched[0]) {
			
		}
		if (dbTouched.length !== 0 && pbTouched[0] < dbTouched[0]) {
		}
	}
	
	document.getElementById("coords").innerText = x + ', ' + y;
	
	bump = [];
	wTouched = [];
	kbTouched = [];
	dbTouched = [];
	pbTouched = [];
	
	tempX = x;
	tempY = y;
	player.style.left = x + 'px';
	player.style.top = y + 'px';
	
	window.requestAnimationFrame(functionability);
}

function leftEdge(j) {
	return blockArray[j][2] - 20;
}
function rightEdge(j) {
	return blockArray[j][2] + blockArray[j][4];
}
function topEdge(j) {
	return blockArray[j][3] - 20;
}
function bottomEdge(j) {
	return blockArray[j][3] + blockArray[j][5];
}
function tempArrayOfCoords(val) {
	for (let k = 0; k < arrayOfCoords.length; k++) {
		if (val == x) {
			arrayOfCoords[k][0] = val;
		} else if (val == y) {
			arrayOfCoords[k][1] = val;
		}
	}
}

let blockId = 0;
let movingBlockId = 0;
let blockArray = [];
let movingBlockArray = [];
let keyArray = [];
let textId = 0;
let colliderArray = [];
let pbArray = [];
let pbInitialArray = [];

function sBD(block, type, p1, p2, p3, p4, p5) {
	p1 *= c.width/1366;
	p1 = Math.round(p1);
	p2 *= c.height/768;
	p2 = Math.round(p2);
	p3 *= c.width/1366;
	p3 = Math.round(p3);
	p4 *= c.height/768;
	p4 = Math.round(p4);
	if (type == "SC") {
		clear();
		respawnPoint = [p1-10, p2-10]
		x = respawnPoint[0];
		y = respawnPoint[1];
		tempX = x;
		tempY = y;
		arrayOfCoords = [[x, y]];
		player.style.left = x + 'px';
		player.style.top = y + 'px';
	}
	if (type == "w" || type == "k" || type == "kd") {
		colliderArray.push(blockId);
	}
	if (type[0] == "tp") {
		if (type[1] == "left" || type[1] == "right") {
			p3 = 10;
			p4 = 50;
		}
		if (type[1] == "top" || type[1] == "bottom") {
			p3 = 50;
			p4 = 10;
		}
	}
	if (type == "k") {
		keyArray.push("locked");
	}
	if (type[0] == "Tkb" || type[0] == "Tdb") {
		if (type[3] == undefined) {
			type.push(0);
 		}
	}
	if (type == "pb") {
		pbArray.push(blockId);
		pbInitialArray.push([blockId, p1, p2, p3, p4]);
	}
	
	blockArray.push([block, type, p1, p2, p3, p4, p5]);
	blockId++;
	fixCanvas(block, type, p1, p2, p3, p4);
}

function sMBD(block, type, p1, p2, p3, p4, p5) {
	p1 *= c.width/1366;
	p1 = Math.round(p1);
	p2 *= c.height/768;
	p2 = Math.round(p2);
	p3 *= c.width/1366;
	p3 = Math.round(p3);
	p4 *= c.height/768;
	p4 = Math.round(p4);
	for (let i = 0; i < p5.length-1; i++) {
		p5[i][0] *= c.width/1366;
		p5[i][1] *= c.height/768;
	}
	movingBlockArray.push([blockId, p5, p1, p2, p3, p4, 0]); //movingBlockArray stores initialpos & allpos's & speed
	sBD(block, type, p1, p2, p3, p4, p5[p5.length-1]); //blockArray stores currentpos & speed
	movingBlockId++;
}

function fixCanvas(block, type, p1, p2, p3, p4) {
	if (type == "SC") {
		ctx.beginPath();
		ctx.fillStyle = "white";
		ctx.arc(p1, p2, 50, 0, 2*Math.PI);
		ctx.fill();
	} else if (type == "w") {
		ctx.beginPath();
		ctx.fillStyle = "black";
		ctx.rect(Math.round(p1), Math.round(p2), Math.round(p3), Math.round(p4));
		ctx.fill();
	} else if (type == "kb") {
		ctx.beginPath();
		ctx.fillStyle = "orange";
		ctx.rect(Math.round(p1), Math.round(p2), Math.round(p3), Math.round(p4));
		ctx.fill();
	} else if (type == "db") {
		ctx.beginPath();
		ctx.fillStyle = "red";
		ctx.rect(Math.round(p1), Math.round(p2), Math.round(p3), Math.round(p4));
		ctx.fill();
	} else if (type[0] == "tp") {
		ctx.beginPath();
		ctx.fillStyle = "blue";
		if (type[1] == "left") {
			ctx.rect(p1, p2, 10, 50);
			ctx.fill();
			ctx.beginPath();
			ctx.rect(p1-5, p2+15, 5, 20);
			ctx.fillStyle = "cyan";
			ctx.fill();
		} else if (type[1] == "right") {
			ctx.rect(p1, p2, 10, 50);
			ctx.fill();
			ctx.beginPath();
			ctx.rect(p1+10, p2+15, 5, 20);
			ctx.fillStyle = "cyan";
			ctx.fill();
		} else if (type[1] == "top") {
			ctx.rect(p1, p2, 50, 10);
			ctx.fill();
			ctx.beginPath();
			ctx.rect(p1+15, p2-5, 20, 5);
			ctx.fillStyle = "cyan";
			ctx.fill();
		} else if (type[1] == "bottom") {
			ctx.rect(p1, p2, 50, 10);
			ctx.fill();
			ctx.beginPath();
			ctx.rect(p1+15, p2+10, 20, 5);
			ctx.fillStyle = "cyan";
			ctx.fill();
		}
	} else if (type == "k") {
		ctx.beginPath();
		ctx.fillStyle = "LightPink";
		ctx.rect(Math.round(p1), Math.round(p2), Math.round(p3), Math.round(p4));
		ctx.fill();
	} else if (type == "kd") {
		if (keyArray[block.substring(2)-1] == "locked") {
			ctx.strokeStyle = "black";
			ctx.setLineDash([]);
			ctx.fillStyle = "LightPink";
			ctx.beginPath();
			ctx.rect(p1+1, p2+1, p3-2, p4-2);
			ctx.fill();
			ctx.stroke();
			ctx.drawImage(lock_image, (p1+p1+p3)/2-(0.5*Math.min(p3, p4)), (p2+p2+p4)/2-(0.5*Math.min(p3, p4)), Math.min(p3, p4), Math.min(p3, p4));
		}
	} else if (type[0] == "Tkb") {
		if (type[2] == "off") {
			ctx.strokeStyle = "orange";
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.rect(p1+1, p2+1, p3-2, p4-2);
			ctx.stroke();
		} else if (type[2] == "on") {
			ctx.fillStyle = "orange";
			ctx.beginPath();
			ctx.rect(p1, p2, p3, p4);
			ctx.fill();
		}
		type[3]++;
		if (type[3] == type[1]) {
			if (type[2] == "on") {
				type[2] = "off";
				ctx.clearRect(p1, p2, p3, p4);
			} else {
				type[2] = "on";
			}
			type[3] = 0;
		}
	} else if (type[0] == "Tdb") {
		if (type[2] == "off") {
			ctx.strokeStyle = "red";
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.rect(p1+1, p2+1, p3-2, p4-2);
			ctx.stroke();
		} else if (type[2] == "on") {
			ctx.fillStyle = "red";
			ctx.beginPath();
			ctx.rect(p1, p2, p3, p4);
			ctx.fill();
		}
		type[3]++;
		if (type[3] == type[1]) {
			if (type[2] == "on") {
				type[2] = "off";
				ctx.clearRect(p1, p2, p3, p4);
			} else {
				type[2] = "on";
			}
			type[3] = 0;
		}
	} else if (type == "pb") {
		ctx.beginPath();
		ctx.fillStyle = "#873e23";
		ctx.rect(Math.round(p1), Math.round(p2), Math.round(p3), Math.round(p4));
		ctx.fill();
	} else if (type == "C") {
		ctx.beginPath();
		ctx.fillStyle = "#ffff99";
		ctx.rect(Math.round(p1), Math.round(p2), Math.round(p3), Math.round(p4));
		ctx.fill();
	} else if (type == "CB") {
		ctx.beginPath();
		ctx.fillStyle = "green";
		ctx.rect(Math.round(p1), Math.round(p2), Math.round(p3), Math.round(p4));
		ctx.fill();
	}
}

function createText(string, xPos, yPos, size, lineSize) {
	let textNode = document.createElement('p');
	textNode.setAttribute('id', "textNo" + (textId));
	textNode.innerHTML = string;
	textNode.style.left = xPos + 'px';
	textNode.style.top = yPos + 'px';
	textNode.style.fontSize = size + 'px';
	textNode.style.width = lineSize + 'px';
	textNode.style.position = 'absolute';
	textNode.style.textAlign = 'center';
	document.body.appendChild(textNode);
	textId++;
}

//stats
function TAcounter(id) {
	let TA = "TA" + id;
	if (localStorage.getItem(TA) == null) {
		localStorage.setItem(TA, "0");
	}
	let newTA = parseInt(localStorage.getItem(TA)) + 1;
	localStorage.setItem(TA, newTA);
}

function TCcounter(id) {
	let LevelCompleteChecker = "Level" + id + "Complete";
	let TC = "TC" + id
	localStorage.setItem(LevelCompleteChecker, "true");
		if (localStorage.getItem(TC) == null) {
			localStorage.setItem(TC, "0");
		}
	let newTC = parseInt(localStorage.getItem(TC)) + 1;
	localStorage.setItem(TC, newTC);
}

function BTchecker(duration) {
	let BT = "BT" + levelId;
	if (localStorage.getItem(BT) !== null) {
		if (duration < parseInt(localStorage.getItem(BT))) {
			localStorage.setItem(BT, duration);
		}
	} else {
		localStorage.setItem(BT, duration);
	}
}

function Pchecker(duration) {
	let P = "P" + levelId;
	if (localStorage.getItem(P) !== null) {
		let newTime = parseInt(localStorage.getItem(P)) + duration;
		localStorage.setItem(P, newTime);
	} else	 {
		localStorage.setItem(P, duration);
	}
}

//simple stuff below
function clear() {
	blockId = 0;
	movingBlockId = 0;
	blockArray = [];
	movingBlockArray = [];
	keyArray = [];
	arrayOfCoords = [];
	pbInitialArray = [];
	colliderArray = [];
	pbArray = [];
	for (let k = 0; k < textId; k++) {
		let txt = "textNo" + k;
		document.getElementById(txt).remove();
	}
	textId = 0;
	ctx.clearRect(0, 0, c.width, c.height);
	sBD("topBorder", "w", 0, -1, 1366, 1);
	sBD("leftBorder", "w", -1, 0, 1, 768);
	sBD("bottomBorder", "w", 0, 768, 1366, 1);
	sBD("rightBorder", "w", 1366, 0, 1, 768);
}

function deathScreen() {
	timeEnded();
	audio.pause();
	document.exitPointerLock();
	document.body.innerHTML = "";
	document.body.style.backgroundColor = "#f78b8b";
	const deathMessage = document.createElement("h1");
	deathMessage.innerText = "You died!";
	deathMessage.style.fontSize = "75px";
	deathMessage.style.marginTop = "40vh";
	deathMessage.style.textAlign = "center";
	const resetButton = document.createElement("button");
	resetButton.onclick = function() {location.reload()};
	resetButton.innerText = 'Hit "r" or this button to reset';
	resetButton.style.margin = "auto";
	resetButton.style.display = "flex";
	resetButton.style.justifyContent = "center";
	const backToMenu = document.createElement("button");
	backToMenu.onclick = function() {location.replace("Menu.html")}
	backToMenu.innerText = 'Return to menu';
	backToMenu.style.margin = "auto";
	backToMenu.style.marginTop = "30px";
	backToMenu.style.display = "flex";
	backToMenu.style.justifyContent = "center";
	document.body.appendChild(deathMessage);
	document.body.appendChild(resetButton);
	document.body.appendChild(backToMenu);
	document.body.onkeydown = function(e){	
		if(e.keyCode == 82){
			location.reload();
		}
	}
}

function winScreen() {
	timeEnded();
	TCcounter(levelId);
	let duration = endTime - startTime;
	BTchecker(duration);
	document.exitPointerLock();
	document.body.innerHTML = "";
	document.body.style.backgroundColor = "#99ffb4";
	const winMessage = document.createElement("h1");
	winMessage.innerText = "Success!";
	winMessage.style.fontSize = "75px";
	winMessage.style.marginTop = "40vh";
	winMessage.style.textAlign = "center";
	const timeTaken = document.createElement("p");
	timeTaken.innerText = "Time: " + totalTime[0] + " hours, " + totalTime[1] + " minutes, " + totalTime[2] + " seconds, " + totalTime[3] + " millseceonds";
	timeTaken.style.textAlign = "center";
	const returnToMenu = document.createElement("button");
	returnToMenu.innerText = 'Return to menu';
	returnToMenu.style.margin = "auto";
	returnToMenu.style.display = "flex";
	returnToMenu.style.justifyContent = "center";
	document.body.appendChild(winMessage);
	document.body.appendChild(timeTaken);
	document.body.appendChild(returnToMenu);
	returnToMenu.addEventListener('click', function handleClick(event) {
		location.replace("Menu.html")
	});
}

function timeEnded() {
	clear();
	levelEnded = true;
	endTime = Date.now();
	if (startTime !== undefined) {
		let duration = endTime - startTime;
		Pchecker(duration);
		let hours = parseInt(duration/3600000);
		for (let i = 0; i < hours; i++) {
			totalTime[0]++;
			duration -= 3600000;
		}
		let minutes = parseInt(duration/60000);
		for (let i = 0; i < minutes; i++) {
			totalTime[1]++;
			duration -= 60000;
		}
		let seconds = parseInt(duration/1000);
		for (let i = 0; i < seconds; i++) {
			totalTime[2]++;
			duration -= 1000;
		}
		totalTime[3] = duration;
	}
}

function devTools(e) {
	if (dev == true) {
	if (e.keyCode == 13) {
		alert(x + ', ' + y);
	}
	if (e.keyCode == 37) {
		phaseNumber--;
		phase();
	}
	if (e.keyCode == 39) {
		phaseNumber++;
		phase();
	}
	if (e.keyCode == 67) {
		document.getElementById("coords").style.visibility = "visible";
		document.getElementById("blockName").style.visibility = "visible";
	}
	if(e.keyCode == 78){
		if (noclip == false) {
			document.getElementById("noclip").style.visibility = "visible";
			noclip = true;
		} else {
			document.getElementById("noclip").style.visibility = "hidden";
			noclip = false;
		}
	}
	if(e.keyCode == 82){
		if (levelEnded == false) {
			deathScreen();
		}
	}
	}
}