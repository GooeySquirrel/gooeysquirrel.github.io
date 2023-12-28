const id = localStorage.getItem("playId");
let levelID, levelName, levelData, audio;

if (localStorage.getItem(id + "complete") == null)
    localStorage.setItem(id + "complete", false);

fetch(new Request("levels.json"))
.then((response) => response.json())
.then((data) => {
    if (id.substring(0,5) == "level") {
        const mainId = id.substring(5,id.length);
        levelID = data.mainLevels[mainId].levelID;
        audio = new Audio("Songs/" + levelID + "song.mp3");
        levelName = data.mainLevels[mainId].levelName;
        levelData = data.mainLevels[mainId].levelData;
    } else {
        levelID = data.userLevels[id].levelID;
        levelName = data.userLevels[id].levelName;
        levelData = data.userLevels[id].levelData;
    }
    levelData = levelData.split("*");
    levelData.shift();
    for (let i = 0; i < levelData.length; i++) {
        levelData[i] = levelData[i].split(";");
        levelData[i].pop();
    }
    phase();

    // TOTAL ATTEMPTS
    const TA = levelID + "TA";
    if (localStorage.getItem(TA) == null)
        localStorage.setItem(TA, 0);
    localStorage.setItem(TA, parseInt(localStorage.getItem(TA)) + 1);
})

function phase() {
    for (let i = 0; i < levelData.length; i++) {
        const phase = levelData[i]
        if (phaseNumber == phase[0]) {
            for (let j = 1; j < phase.length; j++) {
                phase[j] = phase[j].split(",")
                const block = phase[j];
                if (block[0] == "sq") {
                    if (block[1] == "w" || block[1] == "kb" || block[1] == "db" || block[1] == "pb" || block[1] == "c" || block[1] == "cb" || block[1] == "w_invis") {
                        if (!block[6])
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]));
                        if (block[6]) {
                            const move = [];
                            const moveLength = (block.length-7)/4;
                            for (let k = 0; k < moveLength; k++) {
                                move.push([parseInt(block[6+k*4]), parseInt(block[7+k*4]), parseInt(block[8+k*4]), parseInt(block[9+k*4])]);
                            }
                            move.push(parseInt(block[block.length-1]));
                            new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]), move);
                        }
                    } else if (block[1] == "tkb" || block[1] == "tdb") {
                        new Square([block[1], parseInt(block[2]), block[3] == "true", parseInt(block[4])], parseInt(block[5]), parseInt(block[6]), parseInt(block[7]), parseInt(block[8]));
                    } else if (block[1] == "deco") {
                        new Square([block[1], block[2]], parseInt(block[3]), parseInt(block[4]), parseInt(block[5]), parseInt(block[6]))
                        console.log(block);
                    } else if (block[1].substring(0,2) == "tp") {
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), block[4]);
                    } else if (block[1].substring(0,1) == "k") {
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]));
                    }
                } else if (block[0] == "c") {
                    if (block[1] == "deco")
                        new Circle([block[1], block[2]], parseInt(block[3]), parseInt(block[4]), parseInt(block[5]));
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