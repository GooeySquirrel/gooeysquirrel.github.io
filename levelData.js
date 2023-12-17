let id = localStorage.getItem("playId");
console.log(id);

fetch(new Request("levels.json"))
.then((response) => response.json())
.then((data) => {
    const levelID = data.mainLevels[id].levelID;
    const levelName = data.mainLevels[id].levelName;
    levelData = data.mainLevels[id].levelData;
    levelData = levelData.split("#");
    levelData.shift();
    for (let i = 0; i < levelData.length; i++) {
        levelData[i] = levelData[i].split(";");
        levelData[i].pop();
    }
    phase();
})

/*const levelID = file[0].substring(9);
console.log(localStorage.getItem(levelID + "complete"));
if (localStorage.getItem(levelID + "complete") == null) {
    localStorage.setItem(levelID + "complete", false);
}

const levelName = file[1].substring(11);
file.splice(0,2);

file = file[0].split("#");
file.shift();

for (let i = 0; i < file.length; i++) {
    file[i] = file[i].split(";");
    file[i].pop();
}*/

function phase() {
    for (let i = 0; i < levelData.length; i++) {
        const phase = levelData[i]
        if (phaseNumber == phase[0]) {
            for (let j = 1; j < phase.length; j++) {
                phase[j] = phase[j].split(",")
                const block = phase[j];
                if (block[0] == "sq") {
                    if (block[1] == "w" || block[1] == "kb" || block[1] == "db" || block[1] == "pb" || block[1] == "c" || block[1] == "cb") {
                        if (!block[6])
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]));
                        if (block[6]) {
                            //console.log(block);
                            const move = [];
                            const moveLength = (block.length-7)/4;
                            for (let k = 0; k < moveLength; k++) {
                                move.push([parseInt(block[6+k*4]), parseInt(block[7+k*4]), parseInt(block[8+k*4]), parseInt(block[9+k*4])]);
                            }
                            move.push(parseInt(block[block.length-1]));
                            //console.log(move);
                            //console.log(new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]), move));
                        }
                    } else if (block[1] == "tkb" || block[1] == "tdb") {
                        new Square([block[1], parseInt(block[2]), block[3] == "true", parseInt(block[4])], parseInt(block[5]), parseInt(block[6]), parseInt(block[7]), parseInt(block[8]));
                    } else if (block[1].substring(0,2) == "tp") {
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), block[4]);
                    } else if (block[1].substring(0,1) == "k") {
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]));
                    }
                } else if (block[0] == "txt") {
                    new Text(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), block[5], block[6]);
                }
            }
            break;
        }
    }
    draw.sort(function(a,b){return b.z_index-a.z_index});
}

//phase();