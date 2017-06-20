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
	var coords = [_.random(5, 16), _.random(10, 19)];
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

function randomRed(){
	var firstLetter = 'abcdef',
	    secondSymb = '6789abcdef',
	    third = '123456789',
	    forth = '123456789bcd',
	    fifth = '123456789',
	    six   = '123456789abcd',
	    color = '#';
	color += firstLetter[_.random(0, firstLetter.length-1)] +
	          secondSymb[_.random(0, secondSymb.length-1)] +
	               third[_.random(0, third.length-1)] +
	               forth[_.random(0, forth.length-1)] +
	               fifth[_.random(0, fifth.length-1)] +
	                 six[_.random(0, six.length-1)];
	return color;
}

function sendDropUnitMove(unitsMove){
	// Func for destroy dotted line at client side. Line would be
	// destroyed if length of it will be 1. Cross will be destroyed if
	// his coords are equal with target coords. So we will send mimic message

	// At first, choose user's socket
	var thisSocket;
	for (var i=0; i<users.length; i++){
		if (users[i].id == unitsMove.ownerSocketID){
			thisSocket = users[i];
			break;
		}
	}
	console.log('[sendDropUnitMove]', unitsMove);

	// Send mimic message
	if (!thisSocket) return;
	thisSocket.emit('dottedPathLine', {moveID: unitsMove.moveID,
                                       color: "#000000",
    				                   points: [[unitsMove.toX, unitsMove.toY]]});
	console.log('OK')
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
	/*
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
	console.log('[UNITS]',maxMonsters+playersUnitsMoving.length);

	// For every unit
	for (var i=0; i<units.length; i++){

		// arr[0] = true/false
		// arr[1] = [x, y] if arr[0] is true. Else empty array
		var unitIsNear_ = movements.unitIsNear(unitsMap, units[i].x, units[i].y, ENEMIES_SEARCH_RADIUS);
		
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
	}*/

	// Now do a step for all units which be sent off by player
	for (var i=0; i<playersUnitsMoving.length; i++){
		var toX = playersUnitsMoving[i].targetX,
		    toY = playersUnitsMoving[i].targetY,
		    fromX = playersUnitsMoving[i].unitX,
		    fromY = playersUnitsMoving[i].unitY;

		// Translate end point around Moor neighborhood
		if (!movements.isMoveable(map, unitsMap, toX, toY) && Math.abs(toX-fromX)+Math.abs(toY-fromY) <= 2){
			var end_dx = _.random(-1, 1);
			var end_dy = (end_dx == 0)? _.random(-1, 1) : 0;
			if (movements.isMoveable(map, unitsMap, toX+end_dx, toY+end_dy)){
				toX += end_dx;
				toY += end_dy;
				console.log('Translate end point');
			}else{
				console.log('Deleted move with ID', playersUnitsMoving[i].moveID);
				sendDropUnitMove(playersUnitsMoving[i]);
				playersUnitsMoving = playersUnitsMoving.slice(0, i).concat(playersUnitsMoving.slice(i+1, playersUnitsMoving.length));
				i--;
				continue;
			}
		}

		// Pop unit which destinates target
		if (Math.abs(fromX - toX) + Math.abs(fromY - toY) == 0){
			console.log('Deleted move with ID', playersUnitsMoving[i].moveID);
			sendDropUnitMove(playersUnitsMoving[i]);
			playersUnitsMoving = playersUnitsMoving.slice(0, i).concat(playersUnitsMoving.slice(i+1, playersUnitsMoving.length));
			i--;
			continue;
		}

		//console.log('Search path from ',fromX,fromY,' to ', toX, toY);
		var path = movements.shortestPathTo(map, unitsMap, fromX, fromY, toX, toY);
		var dxdy = path[0],
		    dottedLine = path[1];

		if (dxdy[0] != 0 || dxdy[1] != 0){
			// If we have a path, we send it to owner of unit. Path will be
			// displayed as dotted line
			for (var j=0; j<users.length; j++){
    			// Elements are sockets
    			if (users[j].id == playersUnitsMoving[i].ownerSocketID){
    				//console.log('Emit dottedLine:', dottedLine);
    				users[j].emit('dottedPathLine', {moveID: playersUnitsMoving[i].moveID,
    					                             color: playersUnitsMoving[i].lineColor,
    					                             points: dottedLine});
    				break;
    			}
    		}
    	}else{
    		console.log('Dropped move with ID', playersUnitsMoving[i].moveID);
    		sendDropUnitMove(playersUnitsMoving[i]);
    		playersUnitsMoving = playersUnitsMoving.slice(0, i).concat(playersUnitsMoving.slice(i+1, playersUnitsMoving.length));
			i--;
			continue;
    	}
    	// And send move actually
    	console.log('send move to '+ playersUnitsMoving[i].unitID);
        io.sockets.emit('moveUnit', {action: 'move',
                                     id: playersUnitsMoving[i].unitID,
                                     dx: dxdy[0],
                                     dy: dxdy[1]});
        //console.log('Was ',playersUnitsMoving[i].unitX, playersUnitsMoving[i].unitY);
        unitsMap = movements.verifyUnitMove(unitsMap, 
        	                                playersUnitsMoving[i].unitX, 
        	                                playersUnitsMoving[i].unitY, 
        	                                playersUnitsMoving[i].unitX + dxdy[0], 
        	                                playersUnitsMoving[i].unitY + dxdy[1], 
        	                                playersUnitsMoving[i].unitMapCode);
		playersUnitsMoving[i].unitX += dxdy[0];
		playersUnitsMoving[i].unitY += dxdy[1];
		//console.log('Now ',playersUnitsMoving[i].unitX, playersUnitsMoving[i].unitY);
	}

}}, 1000);


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
    socket.emit('newUnit', createHero());
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
		data.moveID = _.random(1000, 9000);
		data.lineColor = randomRed();
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
