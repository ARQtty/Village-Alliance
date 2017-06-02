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

/* Monsters AI */
setInterval(function(){
	var r = Math.ceil(Math.random() * 3);
	switch(r){
		case 1:
			io.sockets.emit('newUnit', {x: Math.ceil(Math.random() * 7),
										y: Math.ceil(Math.random() * 7),
										textureType: 0,
										Name: 'zombie',
										avatar: 'zombie',
										description: 'Desc',
										HP: Math.random()*400,
										XP: Math.random()*300,
										Reward: 300
										});
			console.log('Send newUnit'); break;

		case 2:
			io.sockets.emit('moveUnit', {b:'b'});
			console.log('Send moveUnit'); break;
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


    socket.on('chat', function (data) {
		socket.broadcast.emit('chat', {
			name: data.name,
			message: data.message
		});

        console.log("Chat"+ data.name + ": " + data.message);
	});
})
