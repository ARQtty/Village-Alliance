/**
The logic of construction of objects on the game space   
@module building
*/

$(function() {
window.app.building = {
   /* Part for building structures on game field */
   buildings:    [],
   buildingsMap: [],
   cancelButton: document.getElementById('cancel'),
   buildingStructure: null,
   buildingKey:       null,
   buildingModel:     null,


   init: function(){
      for (var i=0; i<app.environment.map.sizeX; i++){
         app.building.buildingsMap.push([]);
         for (var j=0; j<app.environment.map.sizeY; j++){
            app.building.buildingsMap[i].push(0);
         }
      }

      var b_Data = app.building.buildings;
      for (var i=0; i<b_Data.length; i++){
         let x = b_Data[i].x,
             y = b_Data[i].y,
             avatar, reward, name;

          if (b_Data[i].code == 3){ 
            avatar = 'house.png'; 
            reward = 100; 
            name = 'House'
          }else if (b_Data[i].code == 4){
            avatar = 'house3.png'; 
            reward = 110; 
            name = 'Enemy house'
          }

         app.building.buildingsMap[x][y] = {x: x, 
                                            y: y, 
                                            textureCode: b_Data[i].code,
                                            characts: {HP:  b_Data[i].characts.HP,
                                                       XP:  b_Data[i].characts.XP,
                                                       Reward: reward
                                                       },
                                            reward: b_Data[i].reward,
                                            owner:  b_Data[i].owner,
                                            info: {avatar: avatar
                                                   }
                                            }
      }
   },


   buildingWithCoords: function(x, y){
      console.log('Try to find building at '+x, y, '-->', app.building.buildingsMap[x][y]);
      if (app.building.buildingsMap[x][y] != 0){
            return app.building.buildingsMap[x][y].textureCode;
      }
      return false
   },


   deleteBuildingWithCoords: function(x, y) {
      console.log('Deleting building ['+x+', '+y+']');
      console.log(app.building.buildingsMap[x][y]);
      app.building.buildingsMap[x][y] = 0;
   },


   /**
   Starts listening to canvas for a click to build structure. 
   Structure will be placed on the ground or bulding wiil be aborted
   by pressing the cancel button.
   @method prepare2Build
   @todo Set the cursor image as a selected texture
   */
   prepare2Build: function() {
      app.graphics.canvas.addEventListener('mouseup', app.building.verifyBuild, false);
      // Build process will be aborted
      app.building.cancelButton.addEventListener('mousedown', app.building.abortBuild, false);
   },


   /**
   Unset eventListeners, cursor texture, update buildPanel
   @method abortBuild
   */
   abortBuild: function() {
      app.building.cancelButton.removeEventListener('mousedown', this);
      app.graphics.canvas.removeEventListener('mouseup', app.building.verifyBuild);
      document.getElementById(app.building.buildingModel+'ButtonImg').classList.remove("buildDivChecked");
      document.getElementById(app.building.buildingModel+'ButtonTxt').classList.remove("buildDivChecked");
   },



   /**
   Connects the UI and module. Specifies the building ID for the building. 
   Change the color of the choosen model build-button
   @method chooseStruct
   @param model {String} Choosen from UI build buttons
   */
   chooseStruct: function(model) {
      app.building.buildingModel = model;
      app.building.prepare2Build();
      // Allot button with color
      document.getElementById(model+'ButtonImg').classList.add("buildDivChecked");
      document.getElementById(model+'ButtonTxt').classList.add("buildDivChecked");

      switch (model) {
         case 'house':
            app.building.buildingKey = 3;
            break;

         case 'road':
            app.building.buildingKey = 1;
            break;

         case 'water':
            app.building.buildingKey = 2;
            break;

         case 'knight':
            app.building.buildingKey = 27;
      }
   },


   /**
   Gets the coordinates of the place of the line, calls the procedure 
   for rendering the constructed building, if this can be constructed.
   @method build
   @param event {Event} A mouse event
   */
   verifyBuild: function(event){
      // Unset after click
      app.graphics.canvas.removeEventListener('mouseup', app.building.build);
      document.getElementById(app.building.buildingModel+'ButtonImg').classList.remove("buildDivChecked");
      document.getElementById(app.building.buildingModel+'ButtonTxt').classList.remove("buildDivChecked");
      
      var cellValue = app.environment.getCellByPosition(event.layerX, event.layerY);
      var cellUnderCursor = app.environment.getCellCoords(event.layerX, event.layerY);
      var cellX = cellUnderCursor[0];
      var cellY = cellUnderCursor[1];
      
      if (app.building.buildingKey == cellValue) {
         console.warn('Такое здание уже стоит на этом месте');
      }else if (app.building.buildingKey > 25){
         console.log('Хочу создать юнита на '+cellX+', '+cellY);
         app.network.socket.emit('verifyUnit',  {x: cellX,
                                                 y: cellY,
                                                 owner: app.player.name,
                                                 unitID: app.building.buildingKey});
      }else{
         console.log('Хочу строить на '+cellX+', '+cellY);
         app.network.socket.emit('verifyBuild', {x: cellX, 
                                                 y: cellY,
                                                 owner: app.player.name,
                                                 structureID: app.building.buildingKey});
      }
   },


   placeStructure: function(x, y, structureCode){
      // Placing object on the map
      console.log('Someone calls me!');
      app.building.buildingsMap[x][y] = 'не хватает данных для заполнения'
      app.graphics.fillCellWithTexture(y, x, structureCode);
   }

}})