let file = localStorage.getItem("playLevel");
//file = "LevelID: Level1\nLevelName: 1\n"
//file += "#1;sq,w,100,200,100,200;sq,w,500,550,0,50,550,600,0,50,550,600,50,100,500,550,50,100,500,550,0,50,1;sq,c,200,300,100,200;sq,tp0A,50,10,top;sq,tp0B,-100,-10,bottom;sq,key0,-100,-50,-300,-200;sq,kd0,0,50,-300,-200;txt,GooeySquirrel,0,-50,20;txt,Teddy,0,-40,20;#2;sq,kb,-100,-50,-100,-50;sq,db,50,100,50,100;sq,tkb,20,false,0,-100,-50,50,100;sq,tdb,20,true,0,50,100,-100,-50;" // THIS IS FOR LOCAL, DELETE THIS LINE ON GITHUB
file = file.split("\n");

const levelID = file[0].substring(9);
file.shift();
const levelName = file[0].substring(11);
file.shift();

file = file[0].split("#");
file.shift();

for (let i = 0; i < file.length; i++) {
    file[i] = file[i].split(";");
    file[i].pop();
}

function phase() {
    for (let i = 0; i < file.length; i++) {
        const phase = file[i]
        if (phaseNumber == phase[0]) {
            for (let j = 1; j < phase.length; j++) {
                phase[j] = phase[j].split(",")
                const block = phase[j];
                if (block[0] == "sq") {
                    if (block[1] == "w" || block[1] == "kb" || block[1] == "db" || block[1] == "pb" || block[1] == "c" || block[1] == "cb") {
                        if (!block[6])
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]));
                        if (block[6]) {
                            console.log(block);
                            const move = [];
                            const moveLength = (block.length-7)/4;
                            for (let k = 0; k < moveLength; k++) {
                                move.push([parseInt(block[6+k*4]), parseInt(block[7+k*4]), parseInt(block[8+k*4]), parseInt(block[9+k*4])]);
                            }
                            move.push(parseInt(block[block.length-1]));
                            console.log(move);
                            console.log(new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]), move));
                        }
                    } else if (block[1] == "tkb" || block[1] == "tdb") {
                        new Square([block[1], parseInt(block[2]), block[3] == "true", parseInt(block[4])], parseInt(block[5]), parseInt(block[6]), parseInt(block[7]), parseInt(block[8]));
                    } else if (block[1].substring(0,2) == "tp") {
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), block[4]);
                    } else if (block[1].substring(0,1) == "k") {
                        new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]));
                    }
                } else if (block[0] == "txt") {
                    new Text(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]));
                }
            }
            break;
        }
    }
    draw.sort(function(a,b){return b.z_index-a.z_index});
}

phase();