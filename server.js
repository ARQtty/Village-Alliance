#!/usr/bin/env nodejs

'use strict';

var express 	= require("express");
var app 		= express();
var server		= require('http').createServer(app);
var io          = require('socket.io').listen(server, {log: false});
server.listen(8000);
var anySocket = null;

app.use('/client', express.static(__dirname + '/client'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/media', express.static(__dirname + '/media'));


app.get('/', function (req, res) {
	res.sendfile(__dirname + '/client/client.html')
});

app.get('/media/*', function (req, res) {
    res.sendfile(__dirname + 'media/' + req.params[0]);
});


var oneNewUnit = {  x: Math.ceil(Math.random() * 17),
					y: Math.ceil(Math.random() * 17),
					id: 4538424, // some random number
					textureType: 1,
					info: {
						Name: 'zombie',
						avatar: 'zombie',
						description: 'Desc',
						},
					characteristics: {
						HP: Math.random()*400,
						XP: Math.random()*300,
						Reward: 300
						},
					moving: {
						speed: 32, // px/s
						need2Move: false,
						need2MoveX: 0,
						need2MoveY: 0,
						}
					};

/* Monsters AI */
setInterval(function(){
	var r = Math.ceil(Math.random() * 3);
	switch(r){
		case 1:
			io.sockets.emit('moveUnit', {
										 action: 'move',
										 id: 4538424,
										 dx: -1, // blocks
										 dy: 0});
			console.log('Send moveUnit dx: 1 dy: 1'); break;
	}
}, 1000);

/* Clients */
io.sockets.on('connection', function(socket){
	anySocket = socket;
	console.log('+1 client');
	socket.emit('chat', {
		name: 'Server',
		message: 'Socket Established',
    });
    // One example unit
    socket.emit('newUnit', oneNewUnit);


    socket.on('chat', function (data) {
		socket.broadcast.emit('chat', {
			name: data.name,
			message: data.message
		});

        console.log("Chat"+ data.name + ": " + data.message);
	});
})
