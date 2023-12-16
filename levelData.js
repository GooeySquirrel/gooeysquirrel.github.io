let file = localStorage.getItem("playLevel");
//file = "LevelID: Level1\nLevelName: 1\n#1;sq,w,100,200,100,200;sq,c,200,300,100,200;txt,GooeySquirrel,0,-50,20;txt,Teddy,0,-40,20;#2;sq,kb,-100,-50,-100,-50;sq,db,50,100,50,100;" // THIS IS FOR LOCAL, DELETE THIS LINE ON GITHUB
file = file.split("\n");

const levelID = file[0].substring(9);
file.shift();
const levelName = file[0].substring(11);
file.shift();
//console.log(levelID + ", " + levelName);

file = file[0].split("#");
file.shift();

for (let i = 0; i < file.length; i++) {
    file[i] = file[i].split(";");
    file[i].pop();
}

//console.log(file);

function phase() {
    if (phaseNumber == 1) {
        /*new Square("w", 100, 200, 100, 200);
        new Square("w", 200, 300, 100, 200);
        new Text("Gooey Squirrel Teddy Gooey Squirrel Teddy Gooey Squirrel Teddy", 0, -50, 20);
        new Text("Gooey Squirrel Teddy Gooey Squirrel Teddy Gooey Squirrel Teddy", 0, -40, 20);*/
    } else if (phaseNumber == 2) {
        /*new Square("kb", -100, -50, -100, -50);
        new Square("db", 50, 100, 50, 100);*/
    }
    for (let i = 0; i < file.length; i++) {
        const phase = file[i]
        if (phaseNumber == phase[0]) {
            for (let j = 1; j < phase.length; j++) {
                phase[j] = phase[j].split(",")
                const block = phase[j];
                if (block[0] == "sq" && (block[1] == "w" || block[1] == "kb" || block[1] == "db" || block[1] == "pb" || block[1] == "c" || block[1] == "cb")) {
                    new Square(block[1], parseInt(block[2]), parseInt(block[3]), parseInt(block[4]), parseInt(block[5]));
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