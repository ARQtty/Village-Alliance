var pursuedCreaturesCoords = [],
    pursuedBuildingsCoords = [],
    pursuers = [];

function dropIndex(array, i){
      return array.slice(0, i)
             .concat(array.slice(i+1, array.length))
}

module.exports = {

   start:{
      pursueBuilding: function(moveData){
            console.log('[PL_ACTIONS] Start pursuing building');
            for (var i=0; i<pursuedBuildingsCoords.length; i++){
               if (moveData.targetX == pursuedBuildingsCoords[i].x && moveData.targetY == pursuedBuildingsCoords[i].y){
                  return
               }
            }
            pursuedBuildingsCoords.push({x: moveData.targetX,
                                         y: moveData.targetY,
                                         moveID: moveData.moveID,
                                         owner: moveData.attackedObjOwner})
            // TODO -> define owner of building when it puresued by monster
      },
      pursueCreature: function(moveData){
            var pursued = pursuedCreaturesCoords;
            for (var i=0; i<pursued.length; i++){
               if ((moveData.targetX == pursued[i].x && moveData.targetY == pursued[i].y) ||
                  (moveData.x       == pursued[i].x && moveData.y       == pursued[i].y))   
                  { console.log('already pursued');return }
            }
            console.log('Start pursue');

            var owner = moveData.attackedObjOwner || moveData.owner;
            var x = moveData.targetX || moveData.x,
                y = moveData.targetY || moveData.y;

            pursuedCreaturesCoords.push({x: x,
                                         y: y,
                                         moveID: moveData.moveID,
                                         owner: owner});
            console.log('Lets pursue')      
      },
      bePursuer: function(moveData){
         if (moveData.unitX){   // Is unit
            pursuers.push({x: moveData.unitX,
                           y: moveData.unitY,
                           owner: moveData.attackerOwner})
                           //moveID: moveData.moveID})
         }else{                 // is monster
            pursuers.push({x: moveData.x,
                           y: moveData.y,
                           owner: moveData.owner})
                           //moveData: moveData.moveID})
         }
      }
   },

   stop:{
      pursueBuilding: function(moveID){ // Not by moveID?
         for (var i=0; i<pursuedBuildingsCoords.length; i++){
            if (pursuedBuildingsCoords[i].moveID == moveID){
               console.log('[PL_ACTIONS] Stop pursue building {'+pursuedBuildingsCoords[i].x+', '+pursuedBuildingsCoords[i].y+'}');
               pursuedBuildingsCoords = dropIndex(pursuedBuildingsCoords, i);
               return true
            }
         }
         return false
      },
      pursueCreature: function(moveID){
         for (var i=0; i<pursuedCreaturesCoords.length; i++){
            if (pursuedCreaturesCoords[i].moveID == moveID){
               console.log('[PL_ACTIONS] Stop pursue creature {'+pursuedCreaturesCoords[i].x+', '+pursuedCreaturesCoords[i].y+'}');
               pursuedCreaturesCoords = dropIndex(pursuedCreaturesCoords, i);
               return true  // Maybe not returning anything
            }
         }
         return false
      },
      bePursuer: function(x, y){
         for (var i=0; i<pursuers.length; i++){
            if (x == pursuers[i].x && y == pursuers[i].y){
               pursuers = dropIndex(pursuers, i);
               console.log('Stop pursuing');
               return
            }
         }
      }
   },
   
   instance: {
      pursued: function(creature){
         for (var i=0; i<pursuedCreaturesCoords.length; i++){
            if ((creature.x       == pursuedCreaturesCoords[i].x && creature.y       == pursuedCreaturesCoords[i].y) ||   // For monster -> Monster
                (creature.targetX == pursuedCreaturesCoords[i].x && creature.targetY == pursuedCreaturesCoords[i].y))     // For unit    -> Monster   
            { return true }
         }
         for (var i=0; i<pursuedBuildingsCoords.length; i++){
            if ((creature.x       == pursuedBuildingsCoords[i].x && creature.y       == pursuedBuildingsCoords[i].y) ||   // For monster -> Monster
                (creature.targetX == pursuedBuildingsCoords[i].x && creature.targetY == pursuedBuildingsCoords[i].y))     // For unit    -> Monster   
            { return true }
         }
         return false
      },
      pursuer: function(creature){

         for (var i=0; i<pursuers.length; i++){
            if ((creature.x       == pursuers[i].x && creature.y       == pursuers[i].y) ||
               (creature.unitX == pursuers[i].x && creature.unitY == pursuers[i].y))
            { return true }
         }
         return false
      }
   },

   update: {
      pursuersTarget: function(oldTargetX, oldTargetY, newTargetX, newTargetY, pursuersGameLoopUnits){
         // Inside update
         for (var i=0; i<pursuedCreaturesCoords.length; i++){
            if (pursuedCreaturesCoords[i].x == oldTargetX && pursuedCreaturesCoords[i].y == oldTargetY){
               pursuedCreaturesCoords[i].x = newTargetX;
               pursuedCreaturesCoords[i].y = newTargetY;
            }
            console.log('[PL_ACTIONS] Okey update pursuedCreaturesCoords');
         }

         // Outside update
         for (var i=0; i<pursuersGameLoopUnits.length; i++){
            if (pursuersGameLoopUnits[i].targetX == oldTargetX && pursuersGameLoopUnits[i].targetY == oldTargetY){
               pursuersGameLoopUnits[i].targetX = newTargetX;
               pursuersGameLoopUnits[i].targetY = newTargetY;
               console.log('[PL_ACTIONS] Okey update pursuersGameLoopUnits');
            }
         }
         return pursuersGameLoopUnits
      },
      pursuerCoords: function(oldX, oldY, newX, newY){
         // Inside update
         for (var i=0; i<pursuers.length; i++){
            if (pursuers[i].x == oldX && pursuers[i].y == oldY){
               pursuers[i].x = newX;
               pursuers[i].y = newY;
               console.log('[PL_ACTIONS] Okey update pursuers');
               return
            }
         }
         return
      }
   },

   get: {
      pursuers: function(){

         return pursuers
      },
      pursuedBuildings: function(){

         return pursuedBuildingsCoords
      },
      pursuedCreatures: function(){

         return pursuedCreaturesCoords
      }
   }
}