const file = localStorage.getItem("level");

function phase() {
    if (phaseNumber == 1) {
        new Square("w", 100, 200, 100, 200);
        new Square("w", 200, 300, 100, 200);
        new Text("Gooey Squirrel Teddy Gooey Squirrel Teddy Gooey Squirrel Teddy", 0, -50, 20);
        new Text("Gooey Squirrel Teddy Gooey Squirrel Teddy Gooey Squirrel Teddy", 0, -40, 20);
    } else if (phaseNumber == 2) {

    }
    draw.sort(function(a,b){return b.z_index-a.z_index});
}

phase();