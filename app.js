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

io.on('connection', function(socket) {
    socket.on('hiya', function(data) {
        socket.emit('hello', 'Whats up?');
    })
});
