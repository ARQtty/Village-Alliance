#!/usr/bin/env node

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

setInterval(function(){
	var r = Math.ceil(Math.random() * 3);
	if (anySocket){
		switch(r){
			case 1:
				anySocket.broadcast.emit('newUnit', {a:'a'});
				anySocket.emit('newUnit', {a:'a'});
				console.log('Send newUnit'); break;

			case 2:
				anySocket.broadcast.emit('moveUnit', {b:'b'}); 
				console.log('Send moveUnit'); break;
		}
	}
}, 500);

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