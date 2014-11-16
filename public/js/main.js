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
    var newPos = {
        'x': this.pos.x + Math.sin(this.angle) * this.speed,
        'y': this.pos.y - Math.cos(this.angle) * this.speed
    };


    var intersect = false;
    var myVertices = rectVertices(newPos, this.size, this.angle);
    for (var id in window.players) {
        if (id == this.id)
            continue;
        player = window.players[id];

        var vertices = rectVertices(player.pos, player.size, player.angle);
        if (doPolygonsIntersect(myVertices, vertices))
            intersect = true;
    }

    if (!intersect) {
        this.pos.x = newPos.x;
        this.pos.y = newPos.y;
    }
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

// Returns an array of a the coordinates of a rectangles vertivies
function rectVertices(pos, size, angle) {
    // pos is the coordinats of the center of the shape
    pos = calcCornerCoords(pos, size);
    var x, y;
    var cosTheta = Math.cos(angle);
    var sinTheta = Math.sin(angle);

    var verticies = [];
    verticies.push(pos);

    x = pos.x + size.width;
    y = pos.y;
    verticies.push({'x': x, 'y': y});
    //verticies.push({'x': x*cosTheta - y*sinTheta, 'y': x*sinTheta + y*cosTheta});

    x = pos.x + size.width;
    y = pos.y + size.height;
    verticies.push({'x': x, 'y': y});
    //verticies.push({'x': x*cosTheta - y*sinTheta, 'y': x*sinTheta + y*cosTheta});

    x = pos.x;
    y = pos.y + size.height;
    verticies.push({'x': x, 'y': y});
    //verticies.push({'x': x*cosTheta - y*sinTheta, 'y': x*sinTheta + y*cosTheta});

    drawVertices(verticies);
    return verticies;
}

/**
 * http://stackoverflow.com/a/12414951
 *
 * Helper function to determine whether there is an intersection between the two polygons described
 * by the lists of vertices. Uses the Separating Axis Theorem
 *
 * @param a an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @param b an array of connected points [{x:, y:}, {x:, y:},...] that form a closed polygon
 * @return true if there is any intersection between the 2 polygons, false otherwise
 */
function doPolygonsIntersect (a, b) {
    var polygons = [a, b];
    var minA, maxA, projected, i, i1, j, minB, maxB;

    for (i = 0; i < polygons.length; i++) {

        // for each polygon, look at each edge of the polygon, and determine if it separates
        // the two shapes
        var polygon = polygons[i];
        for (i1 = 0; i1 < polygon.length; i1++) {

            // grab 2 vertices to create an edge
            var i2 = (i1 + 1) % polygon.length;
            var p1 = polygon[i1];
            var p2 = polygon[i2];

            // find the line perpendicular to this edge
            var normal = { x: p2.y - p1.y, y: p1.x - p2.x };

            minA = maxA = undefined;
            // for each vertex in the first shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            for (j = 0; j < a.length; j++) {
                projected = normal.x * a[j].x + normal.y * a[j].y;
                if (isUndefined(minA) || projected < minA) {
                    minA = projected;
                }
                if (isUndefined(maxA) || projected > maxA) {
                    maxA = projected;
                }
            }

            // for each vertex in the second shape, project it onto the line perpendicular to the edge
            // and keep track of the min and max of these values
            minB = maxB = undefined;
            for (j = 0; j < b.length; j++) {
                projected = normal.x * b[j].x + normal.y * b[j].y;
                if (isUndefined(minB) || projected < minB) {
                    minB = projected;
                }
                if (isUndefined(maxB) || projected > maxB) {
                    maxB = projected;
                }
            }

            // if there is no overlap between the projects, the edge we are looking at separates the two
            // polygons, and we know there is no overlap
            if (maxA < minB || maxB < minA) {
                return false;
            }
        }
    }
    return true;
};

// Calculate coordinate of center from coordinate of top left corner
function calcCenterCoords(pos, size) {
    var centerPos = {};
    centerPos.x = pos.x + size.width / 2;
    centerPos.y = pos.y + size.height / 2;
    return centerPos;
}

// Calculate coordinate of top left corner from coordinate of center
function calcCornerCoords(pos, size, angle) {
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

function isUndefined(a) {
    return a === undefined;
}

function drawVertices(vertices) {
    for (var v in vertices) {
        var vertex = vertices[v];

        window.ctx.beginPath();
        window.ctx.arc(vertex.x, vertex.y, 1, 0, 2 * Math.PI, false);
        window.ctx.fillStyle = 'green';
        window.ctx.fill();
    }
}
