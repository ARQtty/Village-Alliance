#!/usr/bin/env node

'use strict';

var express 	= require("express");
var app 		= express();
var server		= require('http').createServer(app);
var io          = require('socket.io').listen(server, {log: false});
server.listen(8000);


app.use('/client', express.static(__dirname + '/client'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/media', express.static(__dirname + '/js'));


app.get('/', function (req, res) {
	res.sendfile(__dirname + '/client/client.html')
});

app.get('/media/*', function (req, res) {
    res.sendfile(__dirname + '/media/' + req.params[0]);
});


io.sockets.on('connection', function(client){
	console.log('+1 client');
	client.on('Hello', function(message){
		console.log('...World!)');
	})
})