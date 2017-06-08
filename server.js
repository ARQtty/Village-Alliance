#!/usr/bin/env node

'use strict';

var fs            = require("fs");
var express 	  = require("express");
var app 		  = express();
var server		  = require('http').createServer(app);
var io            = require('socket.io').listen(server, {log: false});

var map = require('./media/map.json');
var movements     = require("./server/movements.js");
var playerActions = require("./server/playerActions.js");

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
					unitCode: 1,
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
						speed: 64, // px/s
						need2Move: false,
						need2MoveX: 0,
						need2MoveY: 0,
						}
					};
var secondNewUnit = {x: Math.ceil(Math.random() * 17),
					y: Math.ceil(Math.random() * 17),
					id: 175237, // some random number
					textureType: 0,
					unitCode: 2,
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
					}

var units = [oneNewUnit, secondNewUnit];
var unitsMap = [];
for (var i=0; i<map.length; i++){
	units.push([]);
	for (var j=0; j<map[i].length; j++){
		units[i][j] = 0;
	}
}
ENEMIES_SEARCH_RADIUS = 4;

/* Monsters AI */
setInterval(function(){
	if (anySocket)
	{
	// For every unit
	for (var i=0; i<units.length; i++){

		// arr[0] = true/false
		// arr[1] = [x, y] if arr[0] is true. Else empty array
		var unitIsNear_ = movements.unitIsNear(unitsMap, units[i].x, units[i].y, ENEMIES_SEARCH_RADIUS);
		if (unitIsNear_[0]){
			var attackedUnitX = unitIsNear_[1][0],
			    attackedUnitY = unitIsNear_[1][1];
			    // TODO
			var nextPoint = shortestStepTo(units[i].x, 
				                           units[i].y, 
				                           attackedUnitX, 
				                           attackedUnitY);

		}else{
			// Random move

			var x = Math.ceil(Math.random()*3 - 2);
			var y = (x == 0) ? (Math.ceil(Math.random()*3 - 2)) : 0;

			if (movements.isMoveable(map, units[i].x + x, units[i].y + y)){
				io.sockets.emit('moveUnit', {
											 action: 'move',
											 id: units[i].id,
											 dx: x, // blocks
											 dy: y});
				console.log('Send moveUnit '+units[i].id+' dx: '+x+' dy: '+y);
				unitsMap = movements.verifyUnitMove(unitsMap, 
					                                units[i].x,
					                                units[i].y, 
					                                units[i].x + x, 
					                                units[i].y + y, 
					                                units[i].unitCode);
				units[i].x += x;
				units[i].y += y;
			}else{
				console.log("immoveable...", units[i].x, '+', x, ', ', units[i].y, '+', y);
			}
		}
	}
	}
}, 2000);

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
    socket.emit('newUnit', secondNewUnit);


    socket.on('chat', function (data) {
		socket.broadcast.emit('chat', {
			name: data.name,
			message: data.message
		});

        console.log("Chat"+ data.name + ": " + data.message);
	});

	socket.on('verifyBuild', function(data){
		map = playerActions.verifyBuild(map, socket, data.x, data.y, data.structureID);
	})
})
