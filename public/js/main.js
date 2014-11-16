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

window.ctx;
window.canvas;
window.mouseHeld = false;
window.mousePos;
window.me;
window.players = {};
window.socket;

$(function() {
    window.socket = io();

    window.canvas = document.getElementById("board");

    window.canvas.width = config.canvas.width;
    window.canvas.height = config.canvas.height;

    window.ctx = window.canvas.getContext("2d");

    window.me = new Player('Me', {x: config.canvas.width/2, y: config.canvas.height/2}, {width: 20, height: 20}, '#'+Math.floor(Math.random()*16777215).toString(16));

    window.players[window.me.id] = window.me;

    gameLoop();

    window.socket.on('player-update', function(players) {
        for (var id in players) {

            if (id == window.me.id) {
                continue;
            }
            
            var data = players[id];

            var player = new Player.Create(data);

            window.players[id] = player;
        }
    });
})

// Draw a rect across the entire canvas
function drawFloor() {
    var width = config.canvas.width;
    var height = config.canvas.height;
    var colour = config.game.scenery.floor.colour;

    window.ctx.fillStyle = colour;
    window.ctx.fillRect(0, 0, width, height);
}

var Player = function(name, pos, size, colour) {
    this.name = name;
    this.pos = pos;
    this.size = size;
    this.colour = colour;

    this.maxSpeed = 5;
    this.speed = 0;
    this.angle = 0;

    this.id = Math.floor((Math.random() * 999999) + 100000);
}

Player.prototype.draw = function() {

    var cornerPos = calcCornerCoords(this.pos, this.size);

    window.ctx.save();
    window.ctx.translate(cornerPos.x + this.size.width / 2, cornerPos.y + this.size.height / 2);
    window.ctx.rotate(this.angle);

    window.ctx.fillStyle = this.colour;
    window.ctx.fillRect(-this.size.width / 2, -this.size.height / 2, this.size.width, this.size.height);

    window.ctx.restore();
}

Player.prototype.move = function() {
    this.pos.x += Math.sin(this.angle) * this.speed;
    this.pos.y -= Math.cos(this.angle) * this.speed;
}

Player.Create = function(data) {
    var name = data.name;
    var pos = data.pos;
    var size = data.size;
    var colour = data.colour;

    var player = new Player(name, pos, size, colour);

    player.maxSpeed = data.maxSpeed;
    player.speed    = data.speed;
    player.angle    = data.angle;
    player.id       = data.id;

    return player;
}

// Calculate coordinate of center from coordinate of top left corner
function calcCenterCoords(pos, size) {
    var centerPos = {};
    centerPos.x = pos.x + size.width / 2;
    centerPos.y = pos.y + size.height / 2;
    return centerPos;
}

// Calculate coordinate of top left corner from coordinate of center
function calcCornerCoords(pos, size) {
    var cornerPos = {};
    cornerPos.x = pos.x - size.width / 2;
    cornerPos.y = pos.y - size.height / 2;
    return cornerPos;
}

function calcPlayerMouseAngle(playerPos) {
    var deltaX = window.mousePos.x - playerPos.x;
    var deltaY = window.mousePos.y - playerPos.y;

    return Math.atan2(deltaY, deltaX) + Math.PI/2;
}

function calcPlayerSpeedFromMouseDistance(distance, maxSpeed) {
    var distanceModifiyer = config.game.controls.distanceModifyer;

    if (distance >= maxSpeed * distanceModifiyer) {
        return window.me.maxSpeed;
    } else {
        return distance / distanceModifiyer;
    }
}

function calcPlayerMouseDistance(playerPos) {
    var deltaX = window.mousePos.x - playerPos.x;
    var deltaY = window.mousePos.y - playerPos.y;

    return Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
}

function onMouseHold() {
    var distance = calcPlayerMouseDistance(window.me.pos);
    var maxSpeed = window.me.maxSpeed;

    var speed  = calcPlayerSpeedFromMouseDistance(distance, maxSpeed);

    window.me.speed = speed;
}

function gameLoop() {
    if (mouseHeld)
        onMouseHold();

    drawFloor();
    for(var id in window.players) {
        var player = window.players[id];
        player.move();
        player.draw();
    }

    window.socket.emit('player-update', [window.me.id, window.me]);

    setTimeout(gameLoop, 10);
}


$(document).mouseup(function(event) {
    mouseHeld = false;
    window.me.speed = 0;
});

$(document).mousedown(function(event) {
    mouseHeld = true;
});

$(document).mousemove(function(event) {
    window.mousePos = {"x": event.clientX, "y": event.clientY};
    var angle = calcPlayerMouseAngle(window.me.pos);
    window.me.angle = angle;
});

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
