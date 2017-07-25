'use strict';
var pursuedCreaturesCoords = [],
    pursuedBuildingsCoords = [],
    pursuers = [];

function dropIndex(array, i){
      return array.slice(0, i)
             .concat(array.slice(i+1, array.length))
}

var pursue = module.exports = {

   // Mark attacked unit as pursued by unit with this id
   startPursue: function(x, y, id, owner, monsters, units, buildings){
      for (let k=0; k<units.length; k++){
         if (x == units[k].x && y == units[k].y){
            units[k].pursuers.push({id: id, pursuerOwner: owner});
            return {monsters: monsters, units: units, buildings: buildings}
         }
      }
      for (let k=0; k<monsters.length; k++){
         if (x == monsters[k].x && y == monsters[k].y){
            monsters[k].pursuers.push({id: id, pursuerOwner: owner});
            return {monsters: monsters, units: units, buildings: buildings}
         }
      }
      for (let k=0; k<buildings.length; k++){
         if (x == buildings[k].x && y == buildings[k].y){ 
            buildings[k].pursuers.push({id: id, pursuerOwner: owner});
            return {monsters: monsters, units: units, buildings: buildings}
         }
      }
      return {monsters: monsters, units: units, buildings: buildings}
   },

   inPursuers: function(creature, id){
      if (creature.pursuers.length){
         for (var q=0; q<creature.pursuers.length; q++){
            if (creature.pursuers[q].id == id) return {instance: true, index: q};
         }
      }
      return {instance: false}
   },

   stopPursue: function(unitID, monsters, units, buildings){
      // Decrement pursued unit pursue counter by deleting
      // his pursue's id from it's pursuers property array
      for (var i=0; i<units.length; i++){
         // in units
         let hasPursuedUnit = pursue.inPursuers(units[i], unitID);
         if (hasPursuedUnit.instance){
            units[i].pursuers = dropIndex(units[i].pursuers, hasPursuedUnit.index);
         }
      }
      for (var i=0; i<monsters.length; i++){
         // in monsters
         let hasPursuedMonster = pursue.inPursuers(monsters[i], unitID);
         if (hasPursuedMonster.instance){
            monsters[i].pursuers = dropIndex(monsters[i].pursuers, hasPursuedMonster.index);
         }
      }
      for (var i=0; i<buildings.length; i++){
         // in monsters
         let hasPursuedBuilding = pursue.inPursuers(buildings[i], unitID);
         if (hasPursuedBuilding.instance){
            buildings[i].pursuers = dropIndex(buildings[i].pursuers, hasPursuedBuilding.index);
         }
      }
      return {monsters: monsters, units: units, buildings: buildings}
   },
   
   instance: {

      pursued: function(creature){
         if (creature.pursuers.length) return true;
         return false
      },

      // Search creature with targetX targetY in all creatures
      pursuer: function(id, monsters, units, buildings){
         for (var i=0; i<monsters.length; i++){
            if (pursue.inPursuers(monsters[i], id).instance) return true
         }
         for (var i=0; i<units.length; i++){
            if (pursue.inPursuers(units[i], id).instance) return true
         }
         for (var i=0; i<buildings.length; i++){
            if (pursue.inPursuers(buildings[i], id).instance) return true
         }
      }
   },

   update: {
      pursuersTarget: function(oldTargetX, oldTargetY, newTargetX, newTargetY, monsters, units){
         console.log('Update target ['+oldTargetX+','+oldTargetY+'] -> ['+newTargetX+','+newTargetY+']');
         for (var i=0; i<monsters.length; i++){
            if (monsters[i].targetX == oldTargetX && monsters[i].targetY == oldTargetY){
               monsters[i].targetX = newTargetX;
               monsters[i].targetY = newTargetY;
            }
         }
         for (var i=0; i<units.length; i++){
            if (units[i].targetX == oldTargetX && units[i].targetY == oldTargetY){
               units[i].targetX = newTargetX;
               units[i].targetY = newTargetY;
            }
         }
         return {monsters: monsters,
                 units: units}
      }
   }
}