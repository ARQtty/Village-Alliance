#!/usr/bin/env node

'use strict';

var fs      = require("fs"),
    express = require("express"),
    app     = express(),
    server  = require('http').createServer(app),
    io      = require('socket.io').listen(server, {log: false}),

    map = require('./media/map.json'),
    _   = require("underscore"),
    movements     = require("./server/movements.js"),
    playerActions = require("./server/playerActions.js"),
    anySocket     = null;

/******** Requests *************/
server.listen(8000);
console.log('Wait for clients...');

app.use('/client', express.static(__dirname + '/client'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/media', express.static(__dirname + '/media'));


app.get('/', function (req, res) {
	res.sendfile(__dirname + '/client/client.html')
});

app.get('/media/*', function (req, res) {
    res.sendfile(__dirname + 'media/' + req.params[0]);
});
/*******************************/


/******** Variables ************/
function createMonster(){
	var coords = [_.random(0, 360), _.random(0, 720)];
	var HP = _.random(100, 300);
	if (_.random(0, 1)) {
		var textureType = 0,
		    unitCode = 2,
		    Name = 'Zombie',
		    avatar = 'zombie.png',
		    description = 'smelly decayed zombie. It can infect you',
		    speed = 32;
	}else{
        textureType = 1,
		    unitCode = 1,
		    Name = 'Snake',
		    avatar = 'snake.png',
		    description = 'slippery, creeping fucking creature. Poisonous',
		    speed = 32;
	}
	var unit = {x: coords[0],
	            y: coords[1],
	            abs_x: coords[0],
	            abs_y: coords[1],
	            id: _.random(10000, 50000),
	            textureType: textureType,
	            unitCode: unitCode,
	            info: {
	            	Name: Name,
	            	avatar: avatar,
	            	description: description
	            },
	            characts: {
	            	HP: HP,
	            	XP: Math.ceil(0.35 * HP),
	            	Reward: HP - 70
	            },
	            moving: {
	            	speed: speed, // px/s
	            	need2Move: false,
	            	need2MoveX: 0,
	            	need2MoveY: 0
	            }
	        }
	return unit
}

var maxMonsters = 0;
var units = [createMonster(), createMonster()];
var unitsMap = [];
for (var i=0; i<map.length; i++){
	unitsMap.push([]);
	for (var j=0; j<map[i].length; j++){
		unitsMap[i][j] = 0;
	}
}
unitsMap[12][11] = 3;
var ENEMIES_SEARCH_RADIUS = 6,
    MONSTERS_LIMIT = 2000;
/*******************************/

/* Monsters AI */
setInterval(function(){
	if (anySocket)
	{

	// Chance to generate new unit
	if (maxMonsters < MONSTERS_LIMIT) {
		for (var i=0; i<200; i++){
			var unit = createMonster()
			anySocket.emit('newUnit', unit);
			units.push(unit);
			console.log('[SERVER] Create new monster');
			maxMonsters += 1;
		}
	}
	console.log('[UNITS]',maxMonsters);

	// For every unit
	for (var i=0; i<units.length; i++){

		// arr[0] = true/false
		// arr[1] = [x, y] if arr[0] is true. Else empty array
		var unitIsNear_ = movements.unitIsNear(unitsMap, units[i].x, units[i].y, ENEMIES_SEARCH_RADIUS);

		if (unitIsNear_[0]){
			console.log('[SERVER] Go to target');
			var attackedUnitX = unitIsNear_[1][0],
			    attackedUnitY = unitIsNear_[1][1];
			var dxdy = movements.shortestStepTo(map,
						                        units[i].x,
						                        units[i].y,
						                        attackedUnitX,
						                        attackedUnitY);
			//console.log('Monster {',units[i].x,',',units[i].y,'} attacks unit {',attackedUnitX,',',attackedUnitY,'}');
			//console.log('dxdy is ', dxdy);
			var dx = dxdy[0],
			    dy = dxdy[1];
			if (dx == Infinity && dy == Infinity){
				// Random move
				var x = _.random(-1, 1);
				var y = (x == 0) ? _.random(-1, 1) : 0;

				if (movements.isMoveable(map, units[i].x + x, units[i].y + y)){
					io.sockets.emit('moveUnit', {
												 action: 'move',
												 id: units[i].id,
												 dx: x, // blocks
												 dy: y});
					console.log('[SERVER] Send random moveUnit '+units[i].id+' dx: '+x+' dy: '+y);
					unitsMap = movements.verifyUnitMove(unitsMap,
						                                units[i].x,
						                                units[i].y,
						                                units[i].x + x,
						                                units[i].y + y,
						                                units[i].unitCode);
					units[i].x += x;
					units[i].y += y;
					units[i].abs_x += x;
					units[i].abs_y += y;
				}else{
					console.log("[SERVER] immoveable...", units[i].x, '+', x, ', ', units[i].y, '+', y);
				}
				continue
			}
			io.sockets.emit('moveUnit', {
										 action: 'move',
										 id: units[i].id,
										 dx: dx, // blocks
										 dy: dy});
			unitsMap = movements.verifyUnitMove(unitsMap,
				                                units[i].x,
				                                units[i].y,
				                                units[i].x + dx,
				                                units[i].y + dy,
				                                units[i].unitCode);
			units[i].x += dx;
			units[i].y += dy;
			units[i].abs_x += x;
			units[i].abs_y += y;
			unitsMap[12][11] = 3;

		}else{
			// Random move
			var x = _.random(-1, 1);
			var y = (x == 0) ? _.random(-1, 1) : 0;

			if (movements.isMoveable(map, units[i].x + x, units[i].y + y)){
				io.sockets.emit('moveUnit', {
											 action: 'move',
											 id: units[i].id,
											 dx: x, // blocks
											 dy: y});
				console.log('[SERVER] Send random moveUnit '+units[i].id+' dx: '+x+' dy: '+y);
				unitsMap = movements.verifyUnitMove(unitsMap,
					                                units[i].x,
					                                units[i].y,
					                                units[i].x + x,
					                                units[i].y + y,
					                                units[i].unitCode);
				units[i].x += x;
				units[i].y += y;
				units[i].abs_x += x;
				units[i].abs_y += y;
			}else{
				console.log("[SERVER] immoveable...", units[i].x, '+', x, ', ', units[i].y, '+', y);
			}
		}
	}
	}
}, 2000);


/* Clients */
io.sockets.on('connection', function(socket){
	anySocket = socket;
	console.log('[SERVER] +1 client');
	socket.emit('chat', {
		name: 'Server',
		message: 'Socket Established',
    });
    // All units
    for (var i=0; i<units.length; i++) {
    socket.emit('newUnit', units[i])
    }


    socket.on('chat', function (data) {
		socket.broadcast.emit('chat', {
			name: data.name,
			message: data.message
		});

        console.log("[CHAT] User "+ data.name + " sad '" + data.message + "'");
	});

	socket.on('verifyBuild', function(data){
		map = playerActions.verifyBuild(map, socket, data.x, data.y, data.structureID);
		// Save map
		fs.writeFileSync('media/map.json', JSON.stringify(map));
	});

	socket.on('disconnect', function() {
		console.log('[SERVER] Client disconnected');
		console.log(maxMonsters);
		anySocket = null;
	})
})
