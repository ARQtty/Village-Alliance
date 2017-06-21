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
    dataGenerators= require("./server/dataGenerators.js"),
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

	// Send mimic message
	if (!thisSocket) return;
	thisSocket.emit('dottedPathLine', {moveID: unitsMove.moveID,
                                       color: "#000000",
    				                   points: [[unitsMove.targetX, unitsMove.targetY]]});
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
var ENEMIES_SEARCH_RADIUS = 6,
    MONSTERS_LIMIT = 5;
/*******************************/

/* Monsters AI */
setInterval(function(){
	if (users.length)
	{
	/******* Monsters part *********/
	// Chance to generate new unit
	if (maxMonsters < MONSTERS_LIMIT) {
		for (var i=0; i<MONSTERS_LIMIT; i++){
			var unit = dataGenerators.createMonster();
			if (movements.isMoveable(map, unitsMap, unit.x, unit.y)){
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
		units[i].moving.serverUpd.untilCounter--;
		if (units[i].moving.serverUpd.untilCounter == 0){
			units[i].moving.serverUpd.untilCounter = units[i].moving.serverUpd.interval;
			// arr[0] = true/false
			// arr[1] = [x, y] if arr[0] is true. Else empty array
			var unitIsNear_ = movements.unitIsNear(unitsMap, units[i].x, units[i].y, ENEMIES_SEARCH_RADIUS);
			
			if (unitIsNear_[0]){
				console.log('[SERVER] Go to target'+unitIsNear_[1][0]+' '+unitIsNear_[1][1]);
				var attackedUnitX = unitIsNear_[1][0],
				    attackedUnitY = unitIsNear_[1][1],
				    path = movements.shortestPathTo(map, unitsMap, units[i].x, units[i].y, attackedUnitX, attackedUnitY);
				console.log('Attack ',attackedUnitX, attackedUnitY);
				var dxdy = path[0],
				    dx = dxdy[0],
				    dy = dxdy[1],
				    dottedLine = path[1];

				if (dx != 0 || dy != 0){
					io.sockets.emit('moveUnit', {
												 action: 'move',
												 id: units[i].id,
												 dx: dx, // blocks
												 dy: dy});
					console.log('Send dtl');
					io.sockets.emit('dottedPathLine', {moveID: units[i].id, // id uses for moveID only here
						                               color: dataGenerators.randomRed(),
						                               points: dottedLine});

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
		}else{
			continue;
		}
	}


	/******* Units part ********/
	// Now do a step for all units which be sent off by player
	for (var i=0; i<playersUnitsMoving.length; i++){
		playersUnitsMoving[i].moving.serverUpd.untilCounter--;
		if (playersUnitsMoving[i].moving.serverUpd.untilCounter == 0){
			playersUnitsMoving[i].moving.serverUpd.untilCounter = playersUnitsMoving[i].moving.serverUpd.interval;
			
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

			var path = movements.shortestPathTo(map, unitsMap, fromX, fromY, toX, toY);
			var dxdy = path[0],
			    dottedLine = path[1];

			if (dxdy[0] != 0 || dxdy[1] != 0){
				// If we have a path, we send it to owner of unit. Path will be
				// displayed as dotted line
				for (var j=0; j<users.length; j++){
	    			// Elements are sockets
	    			if (users[j].id == playersUnitsMoving[i].ownerSocketID){
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

	        unitsMap = movements.verifyUnitMove(unitsMap, 
	        	                                playersUnitsMoving[i].unitX, 
	        	                                playersUnitsMoving[i].unitY, 
	        	                                playersUnitsMoving[i].unitX + dxdy[0], 
	        	                                playersUnitsMoving[i].unitY + dxdy[1], 
	        	                                playersUnitsMoving[i].unitMapCode);
			playersUnitsMoving[i].unitX += dxdy[0];
			playersUnitsMoving[i].unitY += dxdy[1];
		}else{
			continue;
		}
	}

}}, 1000);


/* Clients */
io.sockets.on('connection', function(socket){
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
    for (var i=0; i<2; i++){
    	var hero = dataGenerators.createHero();
    	unitsMap[hero.x][hero.y] = hero.unitCode;
    	console.log('Create hero '+hero.x+' '+hero.y);
	    socket.emit('newUnit', hero);
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


	socket.on('sendOffUnit', function(data){
		data.moveID = _.random(1000, 9000);
		data.lineColor = dataGenerators.randomRed();
		playersUnitsMoving.push(data);
	});


	socket.on('stopMoveUnit', function(data){
		console.log('[stopMoveUnit] -->', data);
		for (var i=0; i<playersUnitsMoving.length; i++){
			if (data.unitID == playersUnitsMoving[i].unitID){
				console.log('Catched!');
				sendDropUnitMove(playersUnitsMoving[i]);
				playersUnitsMoving = playersUnitsMoving.slice(0, i).concat(playersUnitsMoving.slice(i+1, playersUnitsMoving.length));
			}
		}
	})


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
