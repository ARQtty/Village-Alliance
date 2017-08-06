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

    buildings     = require('./media/buildings.json'),
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
// TODO -> broadcast dropDTL for monsters
function sendDropUnitMove(targetX, targetY, unitID, sockId){
   // Func for destroy dotted line at client side. Line would be
   // destroyed if length of it will be 1. Cross will be destroyed if
   // his coords are equal with target coords. So we will send mimic message

   // At first, choose user's socket
   var thisSocket;
   for (var i=0; i<users.length; i++){
      if (users[i].id == sockId){
         thisSocket = users[i];
         break;
      }
   }

   // Send mimic message
   if (!thisSocket) return;
   thisSocket.emit('dottedPathLine', {moveID: unitID,
                                      color: "#000000",
                                      points: [[targetX, targetY]]});
}

function dropIndex(arr, i){
   return arr.slice(0, i)
          .concat(arr.slice(i+1, arr.length))
}

function unsetAttackFlags(unit){
   var attackProps = ['targetX', 'targetY', 
                      'attack', 'attackOn',
                      'attackedOwner', 'attackerOwner', 
                      'ownerSocketID'];
   for (var i=0; i<attackProps.length; i++){
      let prop = attackProps[i];
      //delete unit[prop]
      unit[prop] = null;
   }

   return unit
}

function idOfCreature(x, y){
   for (var i=0; i<units.length; i++){
      if (units[i].x    == x &&     units[i].y == y) return     units[i].id;
   }
   for (var i=0; i<monsters.length; i++){
      if (monsters[i].x == x &&  monsters[i].y == y) return  monsters[i].id;
   }
   for (var i=0; i<buildings.length; i++){
      if (buildings[i].x == x && buildings[i].y == y) return buildings[i].id;
   }
   console.log('Cannot find id of creature at {'+x,y+'}');
}

function attackMsg(x, y, damage){
  if (anySocket){
    anySocket.emit("attack", {x: x,
                              y: y,
                              duration: 34,
                              damage: damage});
    anySocket.broadcast.emit("attack", {x: x,
                                        y: y,
                                        duration: 34,
                                        damage: damage});
  }
}

var monsters  = [],
    units     = [],
    unitsMap  = [],
    
    ENEMIES_SEARCH_RADIUS = 7,
    MONSTERS_LIMIT        = 10,
    UNITS_LIMIT           = 5,

    abs = Math.abs;

for (var i=0; i<map.length; i++){
   unitsMap.push([]);
   for (var j=0; j<map[i].length; j++){
      unitsMap[i][j] = 0;
   }
}
// Merge buildings and texture maps
for (var b=0; b<buildings.length; b++){
  let x = buildings[b].x,
      y = buildings[b].y;
  map[x][y] = buildings[b].code;
}
/*******************************/

/* Game loop */
setInterval(function(){
   if (users.length)
   {

   // Generate new monsters
   if (monsters.length < MONSTERS_LIMIT) {
      for (var i=0; i<MONSTERS_LIMIT; i++){
         var monster = dataGenerators.createMonster();
         if (kernel.isMoveable(map, unitsMap, monster.x, monster.y)){
            unitsMap[monster.x][monster.y] = monster.unitCode;
            console.log('okey new M '+monster.id);
            anySocket.emit('newUnit', monster);
            anySocket.broadcast.emit('newUnit', monster);
            monsters.push(monster);
         }
      }
   }
   // Generate new units
   if (units.length < UNITS_LIMIT){
      for (var i=0; i<UNITS_LIMIT; i++){
         var hero = dataGenerators.createHero('', '', 'autogen hero');
         if (kernel.isMoveable(map, unitsMap, hero.x, hero.y)){
            unitsMap[hero.x][hero.y] = hero.unitCode;
            console.log('okey new U'+hero.id);
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
         
         var unitIsNear      = movements.unitIsNear(unitsMap, monsters[i].x, monsters[i].y, ENEMIES_SEARCH_RADIUS),
             buildingIsNear  = movements.buildingIsNear(map,  monsters[i].x, monsters[i].y, ENEMIES_SEARCH_RADIUS),
             somethingCoords = ['_', '_'], 
             somethingIsNear;
         let stopRange, stopDottedLineRange;

         // Following units is priority
         if ((unitIsNear.instance &&  buildingIsNear.instance) || (unitIsNear.instance && !buildingIsNear.instance)){
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
            if (true){
              let tmp = pursue.stopPursue(monsters[i].id, monsters, units, buildings);
              monsters = tmp.monsters;
              units    = tmp.units;
              buildings= tmp.buildings;
            }
            var attackedUnitX = somethingCoords[0],
                attackedUnitY = somethingCoords[1],
                path = kernel.shortestPathTo(map, unitsMap, monsters[i].x, monsters[i].y, attackedUnitX, attackedUnitY, stopRange, stopDottedLineRange);

            let dxdy = path[0],
                dx = dxdy[0],
                dy = dxdy[1],
                dottedLine = path[1];

            if (true){
               // If target isn't pursued, monster starts doing it
              let tmp = pursue.startPursue(attackedUnitX,
                                           attackedUnitY,
                                           monsters[i].id,
                                           monsters[i].owner,
                                           monsters,
                                           units,
                                           buildings)
              monsters = tmp.monsters;
              units    = tmp.units;
              buildings= tmp.buildings;
            }

            if (dx != 0 || dy != 0){
              io.sockets.emit('moveUnit', {action: 'move',
                                           id: monsters[i].id,
                                           dx: dx, // blocks
                                           dy: dy});
              io.sockets.emit('dottedPathLine', {moveID: monsters[i].id, // id uses for moveID only here
                                                 color: dataGenerators.randomRed(),
                                                 points: dottedLine.slice(1, path[1].length)});

              unitsMap = movements.verifyUnitMove(unitsMap, 
                                                  monsters[i].x, 
                                                  monsters[i].y, 
                                                  monsters[i].x + dx, 
                                                  monsters[i].y + dy, 
                                                  monsters[i].unitCode);

              
              // If monter is pursued and makes a step, we update his pursuers target coords
              // (Update his (he is a target to some creatures) coords)
              if (pursue.instance.pursued(monsters[i])){
                let tmp = pursue.update.pursuersTarget(monsters[i].x, 
                                                       monsters[i].y, 
                                                       monsters[i].x + dx,
                                                       monsters[i].y + dy,
                                                       monsters,
                                                       units);
                units = tmp.units;
                monsters = tmp.monsters;
              }
            
            }else{   // Dxdy == 0!
               // If path finding algorithm returns dxdy 0, it means that we are near 
               // the target or we can't destinate it. Anyway, we haven't display dtl 
               // for user (-> drop dtl)
               sendDropUnitMove(monsters[i].x,
                                monsters[i].y,
                                monsters[i].id);
               if (dottedLine){
                  // So, we can't move closer to target, process next monster
               }else{
                  // Or we can't destinate target
                  let tmp = pursue.stopPursue(monsters[i].id, monsters, units, buildings);
                  monsters = tmp.monsters;
                  units    = tmp.units;
                  buildings= tmp.buildings;
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
            let tmp = pursue.stopPursue(monsters[i].id, monsters, units, buildings);
            monsters = tmp.monsters;
            units    = tmp.units;
            buildings= tmp.buildings;

            sendDropUnitMove({targetX: monsters[i].x,                      // Maybe bug with cross is here!
                              targetY: monsters[i].y,
                              moveID: monsters[i].id})

            // Random move
            let dx =             _.random(-1, 1);
            let dy = (dx == 0) ? _.random(-1, 1) : 0;

            if (kernel.isMoveable(map, unitsMap, monsters[i].x + dx, monsters[i].y + dy)){
               io.sockets.emit('moveUnit', {
                                     action: 'move',
                                     id: monsters[i].id,
                                     dx: dx, // blocks
                                     dy: dy});
               unitsMap = movements.verifyUnitMove(unitsMap, monsters[i].x, monsters[i].y, monsters[i].x + dx, monsters[i].y + dy, monsters[i].unitCode);
               
               if (pursue.instance.pursued(monsters[i])){
                  let tmp = pursue.update.pursuersTarget(monsters[i].x, 
                                                         monsters[i].y, 
                                                         monsters[i].x + dx,
                                                         monsters[i].y + dy,
                                                         monsters,
                                                         units);
                  monsters = tmp.monsters;
                  units    = tmp.units;
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
      if (units[i].moving.serverUpd.untilCounter == 0){
         units[i].moving.serverUpd.untilCounter = units[i].moving.serverUpd.interval;

         var toX = units[i].targetX,
             toY = units[i].targetY,
             fromX = units[i].x,
             fromY = units[i].y,
             attack = units[i].attack,
             attackedType = units[i].attackedType,
             stopRange, stopDottedLineRange;

         if (!toX){
            sendDropUnitMove(toX, toY, units[i].id, units[i].ownerSocketID);
            continue
         }else if (attackedType == 'nothing'){
            stopRange = 0;
            stopDottedLineRange = 0;
         }else if (attackedType == 'unit'){
            stopRange = 1;
            stopDottedLineRange = 0;
         }else if (attackedType == 'building'){
            stopRange = 1;         
            stopDottedLineRange = 1;
         }
         
         // Translate end point around Moor neighborhood
         if (!kernel.isMoveable(map, unitsMap, toX, toY) && (Math.abs(toX-fromX)+Math.abs(toY-fromY)) <= stopRange){  // Maybe not need 
            sendDropUnitMove(units[i].targetX, units[i].targetY, units[i].id, units[i].ownerSocketID);
            //units[i] = unsetAttackFlags(units[i]);
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
            sendDropUnitMove(units[i].targetX, units[i].targetY, units[i].id, units[i].ownerSocketID);
            //units[i] = unsetAttackFlags(units[i]);
            //continue;
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
                     users[j].emit('dottedPathLine', {moveID: units[i].id,
                                                      color:  units[i].lineColor,
                                                      points: dottedLine});
                     break;
                   }
                }
             }

             if (pursue.instance.pursued(units[i])){
               let tmp = pursue.update.pursuersTarget(units[i].x, 
                                                      units[i].y, 
                                                      units[i].x + dxdy[0],
                                                      units[i].y + dxdy[1],
                                                      monsters,
                                                      units);
               monsters = tmp.monsters;
               units    = tmp.units;
            }
            

             // And send move actually
              io.sockets.emit('moveUnit', {action: 'move',
                                           id: units[i].id,
                                           dx: dxdy[0],
                                           dy: dxdy[1]});

              unitsMap = movements.verifyUnitMove(unitsMap, 
                                                  units[i].x, 
                                                  units[i].y, 
                                                  units[i].x + dxdy[0], 
                                                  units[i].y + dxdy[1], 
                                                  units[i].unitCode);

            units[i].x += dxdy[0];
            units[i].y += dxdy[1];
            units[i].abs_x += dxdy[0];
            units[i].abs_y += dxdy[1];
          
          }else{
             // If we haven't path
             console.log('Dropped move with ID', units[i].moveID, 'cause of dxdy=0');
             //if (pursue.instance.pursuer(units[i].targetX,
             //                            units[i].targetY,
             //                            monsters, units)){
               /*let tmp = pursue.stopPursue(units[i].id, 
                                           monsters,
                                           units,
                                           buildings);
               monsters = tmp.monsters;
               units    = tmp.units;
               buildings= tmp.buildings;*/
             //}
             sendDropUnitMove(units[i].targetX, units[i].targetY, units[i].id, units[i].ownerSocketID);
             //units[i] = unsetAttackFlags(units[i]);
            continue;
          }
      }else{
         continue;
      }
   }


   /********** Process hits **********/

   // Prepare for indexErrors when deletes last element and app crushes with 
   // "cant read prop of undefined". This elements will be deleted in the
   // end of processing hits
   units.push({pursuers: []});
   monsters.push({pursuers: []});
   
   var near = function(atckX, atckY, trgtX, trgtY, atckRng){ return abs(atckX-trgtX)+abs(atckY-trgtY) <= atckRng };
   var hitFunc = function(attackerType, attackerIndex, attackedType, attackedIndex) {
      var attackerArray, attackedArray, damage;
      switch(attackerType){
        case 'unit':
          attackerArray = units; break;
        case 'monster':
          attackerArray = monsters; break;
      }
      switch(attackedType){
        case 'unit':
          attackedArray = units; break;
        case 'monster':
          attackedArray = monsters; break;
        case 'building':
          attackedArray = buildings; break;
      }

      damage = attackerArray[attackerIndex].characts.damage;
      attackedArray[attackedIndex].characts.HP -= damage;


      if (attackedArray[attackedIndex].characts.HP <= 0){
        console.log('[DIED] ID '+attackedArray[attackedIndex].id);
        let x_died = attackedArray[attackedIndex].x,
            y_died = attackedArray[attackedIndex].y;

        // Drop creature from original array
        switch(attackedType){

          case 'unit':
            unitsMap[x_died][y_died] = 0;
            console.log('Unit died');
            if (anySocket){
              anySocket.emit('died_unit', {id: attackedArray[attackedIndex].id});
              anySocket.broadcast.emit('died_unit', {id: attackedArray[attackedIndex].id});
            }else{ console.log('No socket for send died_building')}
            return 'died';

          case 'monster':
            unitsMap[x_died][y_died] = 0;
            return false;

          case 'building':
            map[x_died][y_died] = 0;
            console.log('Building died');
            if (anySocket){
              anySocket.emit('died_building', {x: x_died, y: y_died});
              anySocket.broadcast.emit('died_building', {x: x_died, y: y_died});
            }else{ console.log('No socket for send died_building') }
            return 'died';
        }

      }else{
        console.log('[ATTACK] '+attackerArray[attackerIndex].id+
                    ' on '     +attackedArray[attackedIndex].id+
                    ' damage ' +damage);
        attackMsg(attackedArray[attackedIndex].x,
                  attackedArray[attackedIndex].y, 
                  damage);
        console.log('Attacked creature HP is '+attackedArray[attackedIndex].characts.HP);
      }
   };

   console.log('----');
   var dethFlag = false;
   // M->U, U->U
   for (var i=0; i<units.length; i++){
      //console.log('[PROCESS] unit '+units[i].id, units[i].pursuers);
      if (units[i].pursuers.length){
         // If this unit is pursued, look at all creatures which can damage it and
         // and search for equals in this unit.pursuers ids and other unit ids. If 
         // we find equal and their owners aren't same, we will count it like a hit
         for (var p=0; p<units[i].pursuers.length; p++){
            // For every pursuer we check if it near this unit
            if (dethFlag != 'died'){
               for (var j=0; j<monsters.length; j++){
                  if (monsters[j].id == units[i].pursuers[p].id){
                     if (near(monsters[j].x, monsters[j].y, units[i].x, units[i].y, 1)){
                        dethFlag = hitFunc('monster', j, 'unit', i);
                     }
                  }
               }
            }else{ 
              units = dropIndex(units, i); 
              p=0; 
              dethFlag=true;
              console.log('dethFlag DIED condition'); 
              continue 
            } // deth. Go to next unit
            if (!dethFlag){
               for (var j=0; j<units.length; j++){
                  if (units[j].id == units[i].pursuers[p].id &&
                      units[j].owner != units[i].owner){
                     if (near(units[j].x, units[j].y, units[i].x, units[i].y, 1)){
                        dethFlag = hitFunc('unit', j, 'unit', i);
                     }
                  }
               }
            }else{ 
              units = dropIndex(units, i); 
              p=0; 
              dethFlag=true;
              console.log('dethFlag DIED condition'); 
              continue 
            } // deth. Go to next unit
         }
      }
   }
   // M->M, U->M
   for (var i=0; i<monsters.length; i++){
      if (monsters[i].pursuers.length){
         for (var p=0; p<monsters[i].pursuers.length; p++){
            if (!dethFlag){
               for (var j=0; j<monsters.length; j++){
                  if (monsters[j].id == monsters[i].pursuers[p].id){
                     if (near(monsters[j].x, monsters[j].y, monsters[i].x, monsters[i].y, 1)){
                        dethFlag = hitFunc('monster', j, 'monster', i);
                     }
                  }
               }
            }else{ monsters = dropIndex(monsters, i); i--; dethFlag=false; continue } // deth. Go to next monster
            if (!dethFlag){
               for (var j=0; j<units.length; j++){
                  if (units[j].id == monsters[i].pursuers[p].id){
                     if (near(units[j].x, units[j].y, monsters[i].x, monsters[i].y, 1)){
                        dethFlag =  hitFunc('unit', j, 'monster', i);
                     }
                  }
               }
            }else{ monsters = dropIndex(monsters, i); i--; dethFlag=false; continue } // deth. Go to next monster
         }
      }
   }
   // M->B, U->B
   for (i=0; i<buildings.length; i++){
      if (buildings[i].pursuers.length){
         for (var p=0; p<buildings[i].pursuers.length; p++){
            if (dethFlag != 'died'){
               for (var j=0; j<monsters.length; j++){
                  if (monsters[j].id == buildings[i].pursuers[p].id){
                    if (near(monsters[j].x, monsters[j].y, buildings[i].x, buildings[i].y, 1)){
                       dethFlag = hitFunc('monster', j, 'building', i);
                     }
                  }
               }
            }else{ 
               buildings = dropIndex(buildings, i); 
               p=0; 
               dethFlag=true; 
               console.log('dethFlag else condition'); 
               fs.writeFileSync('media/buildings.json', JSON.stringify(buildings)); 
               continue 
            } // deth. Go to next building
            if (dethFlag != 'died'){
               for (var j=0; j<units.length; j++){
                  if (units[j].id == buildings[i].pursuers[p].id &&
                      units[j].owner != buildings[i].owner){
                     if (near(units[j].x, units[j].y, buildings[i].x, buildings[i].y, 1)){
                        dethFlag = hitFunc('unit', j, 'building', i);
                     }
                  }
               }
            }else{ 
               buildings = dropIndex(buildings, i); 
               p=0; 
               dethFlag=true; 
               console.log('dethFlag else condition'); 
               fs.writeFileSync('media/buildings.json', JSON.stringify(buildings)); 
               continue 
            } // deth. Go to next building
         }
      }
   }

   // Delete empty element
   units = dropIndex(units, units.length-1);
   monsters = dropIndex(monsters, monsters.length-1);

}}, 1000);


/************** Network **************/
io.sockets.on('connection', function(socket){
   users.push(socket);
   anySocket = socket;
   
   (function initClient(){
      console.log('[SERVER] +1 client');
      socket.emit('chat', {name: 'Server',
                           message: 'Socket Established',
                           });
       // Send all monsters
       for (var i=0; i<monsters.length; i++) {
         socket.emit('newUnit', monsters[i]);
         socket.broadcast.emit('newUnit', monsters[i]);
       }
       // Send all units
       for (var i=0; i<units.length; i++){
          socket.emit('newUnit', units[i]);
          socket.broadcast.emit('newUnit', units[i]);
       }
       /*
       // Send all buildings
       for (var i=0; i<buildings.length; i++){
         socket.emit('newBuild', buildings[i]);
         socket.broadcast.emit('newBuild', buildings[i]);
       }*/
    })();

   socket.on('chat', function (data) {
      socket.broadcast.emit('chat', {
         name: data.name,
         message: data.message
      });
        console.log("[CHAT] User "+ data.name + " sad '" + data.message + "'");
   });


   socket.on('verifyBuild', function(data){
      // owner on client-side is ready. Make buildings as array of objects
      if (!kernel.isUnit(unitsMap, data.x, data.y)){
         map = movements.verifyBuild(map, socket, data.x, data.y, data.structureID);
         // Save map
         fs.writeFileSync('media/map.json', JSON.stringify(map));
      }
   });


   socket.on('verifyUnit', function(data){
      if (kernel.isMoveable(map, unitsMap, data.x, data.y)){
         var hero = dataGenerators.createHero(data.x, data.y, data.owner);
         unitsMap[hero.x][hero.y] = hero.unitCode;
         units.push(hero);
         console.log('Create hero '+hero.x+' '+hero.y+' by '+hero.owner);
         socket.emit('newUnit', hero);
         socket.broadcast.emit('newUnit', hero);
      }
   })


   socket.on('sendOffUnit', function(data){
      // Remember attacker and attacked creatures in pursue module
      if (data.attackedType == 'building' || data.attackedType == 'unit'){
        let tmp = pursue.startPursue(data.targetX,
                                     data.targetY,
                                     data.unitID,
                                     data.attackerOwner,
                                     monsters,
                                     units,
                                     buildings);
        monsters = tmp.monsters;
        units    = tmp.units;
        buildings= tmp.buildings;
      }
      // And set a flag to attacker unit
      for (var i=0; i<units.length; i++){
         if (units[i].x == data.x && units[i].y == data.y){
             units[i].targetX = data.targetX;
             units[i].targetY = data.targetY;
             units[i].attack = data.attack;
             units[i].attackedType = data.attackedType;
             units[i].attackedOwner = data.attackedOwner;
             units[i].attackerOwner = data.attackerOwner;
             units[i].ownerSocketID = data.ownerSocketID;
             units[i].lineColor = dataGenerators.randomRed();
         }
      }
   });


   socket.on('stopMoveUnit', function(data){
      console.log('[stopMoveUnit] -->', data);
      
      let tmp = pursue.stopPursue(data.unitID, monsters, units, buildings);
      monsters = tmp.monsters;
      units    = tmp.units;
      buildings= tmp.buildings;
      
      // Unset unit's attack flag
      for (var i=0; i<units.length; i++){
         if (data.unitID == units[i].id){
            sendDropUnitMove(units[i].targetX, units[i].targetY, units[i].id, units[i].ownerSocketID);
            units[i] = unsetAttackFlags(units[i])
         }
      }
   })


   socket.on('disconnect', function() {
      console.log('[SERVER] Client disconnected');
      // Delete socket from users
      for (var i=0; i<users.length; i++){
         if (users[i].id == socket.id) users = dropIndex(users, i);
      }
      if (!users.length) anySocket = null;
   })
})
