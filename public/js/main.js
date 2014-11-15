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


    var p1 = new Player('Me', {x: 100, y: 100}, {width: 50, height: 50}, '#FF0000');
    p1.draw();

    $(document).click(function() {
        p1.move();
        drawFloor();
        p1.draw();
    })
})

// Draw a rect across the entire canvas
function drawFloor() {
    var width = config.canvas.width;
    var height = config.canvas.height;
    var colour = config.game.scenery.floor.colour;

    ctx.fillStyle = colour;
    ctx.fillRect(0, 0, width, height);
}

var Player = function(name, pos, size, colour) {
    this.name = name;
    this.pos = pos;
    this.size = size;
    this.colour = colour;

    this.speed = 2;
    this.angle = Math.PI/2;
}

Player.prototype.draw = function() {
    ctx.fillStyle = this.colour;
    ctx.fillRect(this.pos.x, this.pos.y, this.size.width, this.size.height);
}

Player.prototype.move = function() {
    this.pos.x += Math.sin(this.angle) * this.speed;
    this.pos.y -= Math.cos(this.angle) * this.speed;
}

function log(msg, level) {

    if (!level)
        level = 'INFO';

    switch (level) {
        case 'DEBUG':
            console.log(msg);
            break;
        case 'INFO':
            console.info(msg);
            break
        case 'WARN':
            console.warn(msg);
            break;
        case 'ERROR':
            console.error(msg);
            break;
    }
}
