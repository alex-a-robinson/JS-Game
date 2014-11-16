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
            "distanceModifyer": 10
        },
        "fps": 60
    }
}

var ctx;
var mouseHeld = false;
var p1;
var mousePos;

$(function() {
    var socket = io();

    var canvas = document.getElementById("board");

    canvas.width = config.canvas.width;
    canvas.height = config.canvas.height;

    ctx = canvas.getContext("2d");

    drawFloor();


    p1 = new Player('Me', {x: 100, y: 100}, {width: 50, height: 50}, '#FF0000');
    p1.draw();

    gameLoop();
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

    this.maxSpeed = 15;
    this.speed = 0;
    this.angle = 0;
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

    return Math.atan2(deltaY, deltaX) + Math.PI/2;
}

function calcPlayerSpeedFromMouseDistance(distance, maxSpeed) {
    var distanceModifiyer = config.game.controls.distanceModifyer;

    if (distance >= maxSpeed * distanceModifiyer) {
        return p1.maxSpeed;
    } else {
        return Math.floor(distance / distanceModifiyer);
    }
}

function calcPlayerMouseDistance(playerPos, mousePos) {
    var deltaX = mousePos.x - playerPos.x;
    var deltaY = mousePos.y - playerPos.y;

    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
}

function onMouseHold() {
    var distance = calcPlayerMouseDistance(p1.pos, mousePos);
    var maxSpeed = p1.maxSpeed;

    var speed  = calcPlayerSpeedFromMouseDistance(distance, maxSpeed);

    p1.speed = speed;
}

function gameLoop() {
    if (mouseHeld)
        onMouseHold();

    p1.move();
    drawFloor();
    p1.draw();

    setTimeout(gameLoop, 10);
}


$(document).mouseup(function(event) {
    mouseHeld = false;
    p1.speed = 0;
});

$(document).mousedown(function(event) {
    mouseHeld = true;
})

$(document).mousemove(function(event) {
    mousePos = {"x": event.clientX, "y": event.clientY};
    var angle = calcPlayerMouseAngle(p1.pos, mousePos);
    p1.angle = angle;
})

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
