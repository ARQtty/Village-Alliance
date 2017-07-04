#!/usr/bin/env node

'use strict';

var fs            = require("fs"),
    express       = require("express"),
    app           = express(),
    server        = require('http').createServer(app),
    io            = require('socket.io').listen(server, {log: false}),

    kernel        = require("./server/kernel.js"),
    movements     = require("./server/movements.js"),
    pursue        = require("./server/pursue.js"),
    dataGenerators= require("./server/dataGenerators.js"),

    map           = require('./media/map.json'),
    _             = require("underscore"),
    
    anySocket = null,
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

function dropIndex(arr, i){
   return arr.slice(0, i)
          .concat(arr.slice(i+1, arr.length))
}

var monsters = [],
    units = [],
    units = [],
    unitsMap = [],
    abs = Math.abs,
    ENEMIES_SEARCH_RADIUS = 9,
    MONSTERS_LIMIT = 0,
    UNITS_LIMIT = 0,
    hitPairs = [];

for (var i=0; i<map.length; i++){
   unitsMap.push([]);
   for (var j=0; j<map[i].length; j++){
      unitsMap[i][j] = 0;
   }
}
/*******************************/

/* Monsters AI */
setInterval(function(){
   if (users.length)
   {

   // Generate new monsters
   if (monsters.length < MONSTERS_LIMIT) {
      for (var i=0; i<MONSTERS_LIMIT; i++){
         var monster = dataGenerators.createMonster();
         if (kernel.isMoveable(map, unitsMap, monster.x, monster.y)){
            unitsMap[monster.x][monster.y] = monster.unitCode;
            console.log('okey new M');
            anySocket.emit('newUnit', monster);
            anySocket.broadcast.emit('newUnit', monster);
            monsters.push(monster);
         }
      }
   }
   // Generate new units
   if (units.length < UNITS_LIMIT){
      for (var i=0; i<UNITS_LIMIT; i++){
         var hero = dataGenerators.createHero();
         if (kernel.isMoveable(map, unitsMap, hero.x, hero.y)){
            unitsMap[hero.x][hero.y] = hero.unitCode;
            console.log('okey new U');
            anySocket.emit('newUnit', hero);
            anySocket.broadcast.emit('newUnit', hero)
            units.push(hero);
         }
      }
   }

   /*********** Monsters' AI *********/
   for (var i=0; i<monsters.length; i++){
      monsters[i].moving.serverUpd.untilCounter--;
      // If monster has finished his move and ready for move now
      if (monsters[i].moving.serverUpd.untilCounter == 0){
         monsters[i].moving.serverUpd.untilCounter = monsters[i].moving.serverUpd.interval;
         
         var unitIsNear     = movements.unitIsNear(unitsMap, monsters[i].x, monsters[i].y, ENEMIES_SEARCH_RADIUS),
             buildingIsNear  = movements.buildingIsNear(map, monsters[i].x, monsters[i].y, ENEMIES_SEARCH_RADIUS),
             somethingCoords= ['_', '_'], 
             somethingIsNear;
         let stopRange, stopDottedLineRange;

         // Following units is priority
         if ((unitIsNear.instance && buildingIsNear.instance) || (unitIsNear.instance && !buildingIsNear.instance)){
            somethingIsNear = true;
            somethingCoords = [unitIsNear.x, unitIsNear.y];
            stopRange = 1;
            stopDottedLineRange = 1;  // 0 here is a root of the evil. It makes overlap monster on unit.
         }else if (!unitIsNear.instance && buildingIsNear.instance){
            somethingIsNear = true;
            somethingCoords = [buildingIsNear.x, buildingIsNear.y];
            stopRange = 1;
            stopDottedLineRange = 1;
         }else{
            somethingIsNear = false;
            stopRange = 0;
            stopDottedLineRange = 0;
         }

         if (somethingIsNear){
            var attackedUnitX = somethingCoords[0],
                attackedUnitY = somethingCoords[1],
                path = kernel.shortestPathTo(map, unitsMap, monsters[i].x, monsters[i].y, attackedUnitX, attackedUnitY, stopRange, stopDottedLineRange);

            let dxdy = path[0],
                dx = dxdy[0],
                dy = dxdy[1],
                dottedLine = path[1];

            if (dx != 0 || dy != 0){
              io.sockets.emit('moveUnit', {action: 'move',
                                           id: monsters[i].id,
                                           dx: dx, // blocks
                                           dy: dy});
              io.sockets.emit('dottedPathLine', {moveID: monsters[i].id, // id uses for moveID only here
                                                 color: dataGenerators.randomRed(),
                                                 points: dottedLine.slice(1, path[1].length)});

              unitsMap = movements.verifyUnitMove(unitsMap, monsters[i].x, monsters[i].y, monsters[i].x + dx, monsters[i].y + dy, monsters[i].unitCode);

              
              // If monter is pursued and makes a step, we update his pursuers target coords
              // (Update his (he is a target to some creatures) coords)
              if (pursue.instance.pursued(monsters[i])){
                units = pursue.update.pursuersTarget(monsters[i].x, 
                                                                  monsters[i].y, 
                                                                  monsters[i].x + dx,
                                                                  monsters[i].y + dy,
                                                                  units);
              }
              /*
              // If monster pursue something and makes a step, we update his (pursuer) self coords
              // Maybe M pursued building, and now it sees a unit, and start follow it
              if (pursue.instance.pursuer(monsters[i])){
                pursue.update.pursuerCoords(monsters[i].x,
                                            monsters[i].y,
                                            monsters[i].x+dx,
                                            monsters[i].y+dy);
              }else{
                pursue.start.bePursuer({x: monsters[i].x+dx,
                                        y: monsters[i].y+dy,
                                        owner: 'no one'})
              }
              */

              // If target is buildinga and isn't pursued, monster starts doing it
              if (!pursue.instance.pursued({x: attackedUnitX, y: attackedUnitY}) &&
                  buildingIsNear.instance){
                   pursue.start.pursueBuilding({targetX: attackedUnitX,
                                                targetY: attackedUnitY,
                                                moveID: monsters[i].id,
                                                owner: 'ARQ_Build'})

              }

            }else{   // Dxdy == 0!
               // If path finding algorithm returns dxdy 0, it means that we are near 
               // the target or we can't destinate it. Anyway, we haven't display dtl 
               // for user (-> drop dtl)
               sendDropUnitMove({targetX: monsters[i].x,
                                 targetY: monsters[i].y,
                                 moveID: monsters[i].id});
               if (dottedLine){
                  // So, we can't move closer to target, process next monster
               }else{
                  // Or we can't destinate target
                  pursue.stop.bePursuer(monsters[i].x, monsters[i].y);
               }
            }

            monsters[i].x += dx;
            monsters[i].y += dy;
            monsters[i].abs_x += dx;
            monsters[i].abs_y += dy;
            continue; // Process next monster
            
         }else{   // No one is near!
            // If there is no unit nearby, maybe we lost it. So, this monster
            // doesn't pursue anyone now
            pursue.stop.bePursuer(monsters[i].x, monsters[i].y);
            sendDropUnitMove({targetX: monsters[i].x,                      // Maybe bug with cross is here!
                              targetY: monsters[i].y,
                              moveID: monsters[i].id})

            // Random move
            let dx = _.random(-1, 1);
            let dy = (dx == 0) ? _.random(-1, 1) : 0;

            if (kernel.isMoveable(map, unitsMap, monsters[i].x + dx, monsters[i].y + dy)){
               io.sockets.emit('moveUnit', {
                                     action: 'move',
                                     id: monsters[i].id,
                                     dx: dx, // blocks
                                     dy: dy});
               unitsMap = movements.verifyUnitMove(unitsMap, monsters[i].x, monsters[i].y, monsters[i].x + dx, monsters[i].y + dy, monsters[i].unitCode);
               
               if (pursue.instance.pursued(monsters[i])){
                  units = pursue.update.pursuersTarget(monsters[i].x, 
                                                                    monsters[i].y, 
                                                                    monsters[i].x + dx,
                                                                    monsters[i].y + dy,
                                                                    units);
               }

               monsters[i].x += dx;
               monsters[i].y += dy;
               monsters[i].abs_x += dx;
               monsters[i].abs_y += dy;
            }
         }
      }else{   // Monster is moving slowly and there isn't time for move it now
         continue;
      }
   }


   /******* Player units part ********/
   // Now do a step for all units which be sent off by player
   for (var i=0; i<units.length; i++){
      units[i].moving.serverUpd.untilCounter--;
      if (units[i].moving.serverUpd.untilCounter == 0 && units[i].attack){
         units[i].moving.serverUpd.untilCounter = units[i].moving.serverUpd.interval;

         var toX = units[i].targetX,
             toY = units[i].targetY,
             fromX = units[i].unitX,
             fromY = units[i].unitY,
             attack = units[i].attack,
             attackedType = units[i].attackedType,
             stopRange, stopDottedLineRange;

         if (!attack){
            stopRange = 0;
            stopDottedLineRange = 0;
         }else if (attack && attackedType == 'unit'){
            stopRange = 1;
            stopDottedLineRange = 0;
         }else if (attack && attackedType == 'building'){
            stopRange = 1;         
            stopDottedLineRange = 1;
         }
         
         // Translate end point around Moor neighborhood
         if (!kernel.isMoveable(map, unitsMap, toX, toY) && (Math.abs(toX-fromX)+Math.abs(toY-fromY)) <= stopRange){  // Maybe not need 
            sendDropUnitMove(units[i]);
            continue;   
         }
            /*var end_dx = _.random(-1, 1);
            var end_dy = (end_dx == 0)? _.random(-1, 1) : 0;
            if (kernel.isMoveable(map, unitsMap, toX+end_dx, toY+end_dy)){
               sendDropUnitMove(units[i]);
               toX += end_dx;
               toY += end_dy;
               console.log('Translate end point');
            }else{
               console.log('Deleted move with ID', units[i].moveID);
               sendDropUnitMove(units[i]);
               //units = dropIndex(units, i);
               i--;
               continue;
            }
         }*/
         
         
         // Pop unit which destinates target
         if (((abs(fromX - toX) + abs(fromY - toY)) == 0 && !attack) ||
            ((abs(fromX - toX) + abs(fromY - toY)) <= stopRange &&  attack))
         {
            //console.log('Deleted move with ID', units[i].moveID);
            sendDropUnitMove(units[i]);
            units = dropIndex(units, i);
            i--;
            continue;
         }

         var path = kernel.shortestPathTo(map, unitsMap, fromX, fromY, toX, toY, stopRange, stopDottedLineRange);
         var dxdy = path[0],
             dottedLine = path[1];

         if (dxdy[0] != 0 || dxdy[1] != 0){
            // If we have a path, we send it to owner of unit. Path will be
            // displayed as dotted line
            for (var j=0; j<users.length; j++){
                // Elements are sockets
                if (users[j].id == units[i].ownerSocketID){
                   if (dottedLine.length > 2){
                     dottedLine = dottedLine.slice(1, dottedLine.length);
                     users[j].emit('dottedPathLine', {moveID: units[i].moveID,
                                                      color: units[i].lineColor,
                                                      points: dottedLine});
                     break;
                   }
                }
             }

             if (pursue.instance.pursued(units[i])){
               units = pursue.update.pursuersTarget(units[i].unitX, 
                                                                 units[i].unitY, 
                                                                 units[i].unitX + dxdy[0],
                                                                 units[i].unitY + dxdy[1],
                                                                 units);
            }
            if (pursue.instance.pursuer(units[i])){
               console.log('some pursuer');
               pursue.update.pursuerCoords(units[i].unitX,
                                           units[i].unitY,
                                           units[i].unitX+dxdy[0],
                                           units[i].unitY+dxdy[1])
            }
            

             // And send move actually
              io.sockets.emit('moveUnit', {action: 'move',
                                           id: units[i].unitID,
                                           dx: dxdy[0],
                                           dy: dxdy[1]});

              unitsMap = movements.verifyUnitMove(unitsMap, 
                                                  units[i].unitX, 
                                                  units[i].unitY, 
                                                  units[i].unitX + dxdy[0], 
                                                  units[i].unitY + dxdy[1], 
                                                  units[i].unitMapCode);

            units[i].unitX += dxdy[0];
            units[i].unitY += dxdy[1];
          
          }else{
             // If we haven't path
             console.log('Dropped move with ID', units[i].moveID, 'cause of dxdy=0');
             if (pursue.instance.pursuer(units[i])){
                pursue.stop.bePursuer(units[i].unitX, units[i].unitY);
             }
             sendDropUnitMove(units[i]);
             units = dropIndex(units, i);
            i--;
            continue;
          }
      }else{
         continue;
      }
   }


   /********** Process hits **********/
   let pursuers         = pursue.get.pursuers(),
       pursuedBuildings = pursue.get.pursuedBuildings(),
       pursuedCreatures = pursue.get.pursuedCreatures();
   hitPairs = kernel.processHits(Math.abs,
                                 pursuers,
                                 pursuedBuildings,
                                 pursuedCreatures);
}}, 1000);


/************** Network **************/
io.sockets.on('connection', function(socket){
   users.push(socket);
   anySocket = socket;
   console.log('[SERVER] +1 client');


   socket.emit('chat', {
      name: 'Server',
      message: 'Socket Established',
    });
    // Send all creatures
    for (var i=0; i<monsters.length; i++) {
      socket.emit('newUnit', monsters[i]);
      socket.broadcast.emit('newUnit', monsters[i]);
    }
    for (var i=0; i<units.length; i++){
       socket.emit('newUnit', units[i]);
       socket.broadcast.emit('newUnit', units[i]);
    }

    socket.on('chat', function (data) {
      socket.broadcast.emit('chat', {
         name: data.name,
         message: data.message
      });
        console.log("[CHAT] User "+ data.name + " sad '" + data.message + "'");
   });


   socket.on('verifyBuild', function(data){
      if (!kernel.isUnit(unitsMap, data.x, data.y)){
         map = movements.verifyBuild(map, socket, data.x, data.y, data.structureID);
         // Save map
         fs.writeFileSync('media/map.json', JSON.stringify(map));
      }
   });
   socket.on('verifyUnit', function(data){
      if (kernel.isMoveable(map, unitsMap, data.x, data.y)){
         var hero = dataGenerators.createHero(data.x, data.y);
         unitsMap[hero.x][hero.y] = hero.unitCode;
         units.push(hero);
         console.log('Create hero '+hero.x+' '+hero.y);
         socket.emit('newUnit', hero);
         socket.broadcast.emit('newUnit', hero);
      }
   })


   socket.on('sendOffUnit', function(data){
      data.lineColor = dataGenerators.randomRed();
      data.moveID = data.unitID;
      
      if (data.attack){
      
         if (data.attackedType == 'building'){
            pursue.start.pursueBuilding(data);
         }else{  // Attacks unit
            pursue.start.pursueCreature(data)
         }
      pursue.start.bePursuer(data);
      }
      units.push(data);
   });


   socket.on('stopMoveUnit', function(data){
      console.log('[stopMoveUnit] -->', data);
      for (var i=0; i<units.length; i++){
         if (data.unitID == units[i].unitID){
            pursue.stop.pursueCreature(units[i].moveID);
            pursue.stop.pursueBuilding(units[i].moveID);
            pursue.stop.bePursuer(units[i].unitX, units[i].unitY);
            sendDropUnitMove(units[i]);
            units = dropIndex(units, i);
         }
      }
   })


   socket.on('disconnect', function() {
      console.log('[SERVER] Client disconnected');
      // Delete socket from users
      for (var i=0; i<users.length; i++){
         if (users[i].id == socket.id){
            users = dropIndex(users, i);
         }
      }
      if (!users.length){
         anySocket = null;
      }
   })
})
