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
        },
        "controls": {
            "left": 37,
            "right": 39,
            "up": 38,
            "down": 40
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


    $(document).keydown(function(event) {

        var left = config.game.controls.left;
        var right = config.game.controls.right;
        var up = config.game.controls.up;
        var down = config.game.controls.down;

        switch(event.which) {
            case left:
                p1.angle = 3 * Math.PI/2;
                break;
            case right:
                p1.angle = Math.PI/2;
                break;
            case up:
                p1.angle = 0;
                break;
            case down:
                p1.angle = Math.PI;
                break;
        }

        p1.move();
        drawFloor();
        p1.draw();
    })

    $(document).mousemove(function(event) {
        var mousePos = {"x": event.clientX, "y": event.clientY};

        var angle = calcPlayerMouseAngle(p1.pos, mousePos);
        p1.angle = angle;

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

    this.speed = 15;
    this.angle = Math.PI/2;
}

Player.prototype.draw = function() {

    ctx.save();
    ctx.translate(this.pos.x + this.size.width / 2, this.pos.y + this.size.height / 2);
    ctx.rotate(this.angle);

    ctx.fillStyle = this.colour;
    ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);

    ctx.restore();
}

Player.prototype.move = function() {
    this.pos.x += Math.sin(this.angle) * this.speed;
    this.pos.y -= Math.cos(this.angle) * this.speed;
}

function calcPlayerMouseAngle(playerPos, mousePos) {
    var deltaX = mousePos.x - playerPos.x;
    var deltaY = mousePos.y - playerPos.y;

    return Math.atan2(deltaY, deltaX);
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
