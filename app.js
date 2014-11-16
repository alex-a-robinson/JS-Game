var config  = require('./config.json');
var express = require('express');
var app = express();

var server = app.listen(config.port)

var io = require('socket.io').listen(server);

var router = express.Router();

app.use('/', router);

app.use(express.static(__dirname + '/public'));

router.get('/', function(req, res) {
	res.sendfile(__dirname + '/public/html/index.html');
});

// about page route (http://localhost:8080/about)
router.get('/about', function(req, res) {
	res.send('im the about page!');
});

var players = {};

io.on('connection', function(socket) {
    socket.on('player-update', function(data) {
        var playerID = data[0];
        var player = data[1];

        players[playerID] = player;

        console.log('players updated! - ' + playerID);
        console.log(Object.keys(players).length);

        io.emit('player-update', players);
    })
});
