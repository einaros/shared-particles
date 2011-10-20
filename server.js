var express = require('express');
var app = express.createServer();
var io = require('socket.io').listen(app);
app.listen(8003);
app.use(express.static(__dirname + '/public'));
io.set('log level', 1);
io.sockets.on('connection', function(socket) {
    socket.on('p', function(message) {
        socket.broadcast.emit('p', message);
    });
});
process.on('uncaughtException', function (err) {
    console.log('Caught exception: ' + err);
});
