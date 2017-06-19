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
    anySocket     = null,
    users = [];


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
	var coords = [_.random(0, 720), _.random(0, 360)];
	var HP = _.random(100, 350);
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
		    speed = 64;
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
	            	Reward: HP - 50
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

function createHero(){
	var coords = [_.random(10, 10), _.random(14, 14)];
	var HP = _.random(100, 350);
	var hero = {x: coords[0],
	            y: coords[1],
	            abs_x: coords[0],
	            abs_y: coords[1],
	            id: _.random(60000, 90000),
	            textureType: 2,
	            unitCode: 2,
	            owner: "ARQ",
	            info: {
	            	Name: "Knight",
	            	avatar: "Knight.png",
	            	description: "the hero which comes to destroy evil creatures"
	            },
	            characts: {
	            	HP: HP,
	            	XP: Math.ceil(0.65 * HP),
	            	Reward: HP + 50
	            },
	            moving: {
	            	speed: 64, // px/s
	            	need2Move: false,
	            	need2MoveX: 0,
	            	need2MoveY: 0
	            }
	        }
	return hero
}

var maxMonsters = 0;
var units = [];
var playersUnitsMoving = [];
var unitsMap = [];
for (var i=0; i<map.length; i++){
	unitsMap.push([]);
	for (var j=0; j<map[i].length; j++){
		unitsMap[i][j] = 0;
	}
}
unitsMap[12][11] = 3;
var ENEMIES_SEARCH_RADIUS = 6,
    MONSTERS_LIMIT = 0;
/*******************************/

/* Monsters AI */
setInterval(function(){
	if (users.length)
	{

	// Chance to generate new unit
	if (maxMonsters < MONSTERS_LIMIT) {
		for (var i=0; i<MONSTERS_LIMIT; i++){
			var unit = createMonster()
			if (map[unit.x][unit.y] != 2 && map[unit.x][unit.y] != 3 && unitsMap[unit.x][unit.y] == 0){
				unitsMap[unit.x][unit.y] = unit.unitCode;
				anySocket.emit('newUnit', unit);
				units.push(unit);
				console.log('[SERVER] Create new monster');
				maxMonsters += 1;
			}
		}
	}
	console.log('[UNITS]',maxMonsters);

	// For every unit
	for (var i=0; i<units.length; i++){

		// arr[0] = true/false
		// arr[1] = [x, y] if arr[0] is true. Else empty array
		var unitIsNear_ = movements.unitIsNear(unitsMap, units[i].x, units[i].y, ENEMIES_SEARCH_RADIUS);
		/*
		if (unitIsNear_[0]){
			console.log('[SERVER] Go to target');
			var attackedUnitX = unitIsNear_[1][0],
			    attackedUnitY = unitIsNear_[1][1],
			    path = movements.shortestPathTo(map, unitsMap, units[i].x, units[i].y, attackedUnitX, attackedUnitY);
			var dxdy = path[0],
			    dx = dxdy[0],
			    dy = dxdy[1];

			if (dx != 0 && dy != 0){
				io.sockets.emit('moveUnit', {
											 action: 'move',
											 id: units[i].id,
											 dx: dx, // blocks
											 dy: dy});
				unitsMap = movements.verifyUnitMove(unitsMap, units[i].x, units[i].y, units[i].x + dx, units[i].y + dy, units[i].unitCode);
				units[i].x += dx;
				units[i].y += dy;
				units[i].abs_x += x;
				units[i].abs_y += y;
				continue;
			}
		}

		// Random move
		var x = _.random(-1, 1);
		var y = (x == 0) ? _.random(-1, 1) : 0;

		if (movements.isMoveable(map, unitsMap, units[i].x + x, units[i].y + y)){
			io.sockets.emit('moveUnit', {
										 action: 'move',
										 id: units[i].id,
										 dx: x, // blocks
										 dy: y});
			unitsMap = movements.verifyUnitMove(unitsMap, units[i].x, units[i].y, units[i].x + x, units[i].y + y, units[i].unitCode);
			units[i].x += x;
			units[i].y += y;
			units[i].abs_x += x;
			units[i].abs_y += y;
		}
		*/
	}
	// Now do a step for all units which be sent off by player
	for (var i=0; i<playersUnitsMoving.length; i++){
		var toX = playersUnitsMoving[i].targetX,
		    toY = playersUnitsMoving[i].targetY,
		    fromX = playersUnitsMoving[i].unitX,
		    fromY = playersUnitsMoving[i].unitY;

		// Pop unit which destinates target
		if (Math.abs(fromX - toX) + Math.abs(fromY - toY) == 0){
			playersUnitsMoving = playersUnitsMoving.slice(0, i).concat(playersUnitsMoving.slice(i+1, playersUnitsMoving.length));
			console.log('Deleted');
			i--;
			continue;
		}

		console.log('Search path from ',fromX,fromY,' to ', toX, toY);
		var path = movements.shortestPathTo(map, unitsMap, fromX, fromY, toX, toY);
		var dxdy = path[0],
		    dottedLine = path[1];

		// UPDATE UNITSMAP

		if (dxdy[0] != 0 || dxdy[1] != 0){
			// If we have a path, we send it to owner of unit. Path will be
			// displayed as dotted line
			for (var j=0; j<users.length; j++){
    			// Elements are sockets
    			if (users[j].id == playersUnitsMoving[i].ownerSocketID){
    				//console.log('Emit dottedLine:', dottedLine);
    				users[j].emit('dottedPathLine', dottedLine);
    				break;
    			}
    		}
    	}else{
    		playersUnitsMoving = playersUnitsMoving.slice(0, i).concat(playersUnitsMoving.slice(i+1, playersUnitsMoving.length));
			console.log('Dropped');
			i--;
			continue;
    	}
    	// And send move actually
        io.sockets.emit('moveUnit', {action: 'move',
                                     id: playersUnitsMoving[i].unitID,
                                     dx: dxdy[0],
                                     dy: dxdy[1]});
        console.log('Was ',playersUnitsMoving[i].unitX, playersUnitsMoving[i].unitY);
		playersUnitsMoving[i].unitX += dxdy[0];
		playersUnitsMoving[i].unitY += dxdy[1];
		console.log('Now ',playersUnitsMoving[i].unitX, playersUnitsMoving[i].unitY);
	}

}}, 2000);


/* Clients */
io.sockets.on('connection', function(socket){
	//socket.emit('socketName', socket.id);
	users.push(socket);
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
    socket.emit('newUnit', createHero());


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


	socket.on('sendOffUnit', function(data){
		playersUnitsMoving.push(data);
	});


	socket.on('disconnect', function() {
		console.log('[SERVER] Client disconnected');
		// Delete socket from users
		for (var i=0; i<users.length; i++){
			if (users[i].id == socket.id){
				users = users.slice(0, i).concat(users.slice(i+1, users.length));
			}
		}
		if (!users.length){
			anySocket = null;
		}
	})
})
