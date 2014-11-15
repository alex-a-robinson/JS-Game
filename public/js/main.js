var config = {
    "canvas": {
        "width": 800,
        "height": 600
    },
    "game": {
        "scenery": {
            "floor": {
                "colour": "#D9D9D9",
            }
        }
    }
}

var ctx;

$(function() {
    var socket = io();

    var canvas = document.getElementById("board");

    canvas.width = config.canvas.width;
    canvas.height = config.canvas.height;

    ctx = canvas.getContext("2d");

    drawFloor();
})

// Draw a rect across the entire canvas
function drawFloor() {
    var width = config.canvas.width;
    var height = config.canvas.height;
    var colour = config.game.scenery.floor.colour;

    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, width, height);
}

function log(msg, level) {

    if (!level)
        level = 'INFO';

    switch (level) {
        case 'DEBUG':
            console.log(msg);
        case 'INFO':
            console.info(msg);
        case 'WARN':
            console.warn(msg);
        case 'ERROR':
            console.error(msg);
    }
}
