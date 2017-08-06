window.onload = function() {

   var s_avatar = document.getElementById('s_avatar');
   var s_name = document.getElementById('s_name');
   var s_description = document.getElementById('s_description');
   var s_HP = document.getElementById('s_HP');
   var s_XP = document.getElementById('s_XP');
   var s_Gold = document.getElementById('s_Gold');
   var selectPanel = document.getElementById('selectPanel');


   function getTextureDescription(event) {
      var cellValue = app.environment.getCellByPosition(event.layerX, event.layerY);
      var informative = (cellValue == 0) ? false : true; // grass is not informative
      
      if (!getSpriteDescription(event)){
         if (!getBuildingDescription(event)){
            app.unitsControl.removeSelect();
            if (cellValue <= 4) {
               if (informative) {
                  showTextureDescr(app.graphics.textures.descriptors.terrain[cellValue]);
               }else{
                  selectPanel.style.display = 'none';
               }
            }
         }
      }
   };

   function getBuildingDescription(event){
      var coords = app.environment.getCellCoords(event.layerX, event.layerY);
      // Get absolute values
      coords[0] += app.graphics.x1;
      coords[1] += app.graphics.y1;
      if (app.building.buildingsMap[coords[0]][coords[1]] == 0) return false;

      var building = app.building.buildingsMap[coords[0]][coords[1]];
      showBuildingDescr(building);
      return true
   };

   function getSpriteDescription(event) {
      var coords = app.environment.getCellCoords(event.layerX, event.layerY);
      // Get absolute values
      coords[0] += app.graphics.x1;
      coords[1] += app.graphics.y1;
      var sprites = app.sprites.coords;
      for (var i=0; i<sprites.length; i++){
         if (sprites[i].abs_x == coords[0] && sprites[i].abs_y== coords[1]){

            // Player can select only his units
            if (sprites[i].owner == app.player.name) app.unitsControl.selectUnit(sprites[i]);
            else app.unitsControl.removeSelect();

            showSpriteDescr(sprites[i]);
            // Bool for getTextureDescription. If true, is wouldn't start
            return true
         }
      }
      return false
   };

   function showBuildingDescr(building){
      selectPanel.style.display = 'block';
      s_avatar.innerHTML = '<img src="/media/textures/'+building['info']['avatar']+'" style="width: 5vw;"/>';
      s_name.innerHTML = '<b>Name</b>: '+building['owner'];
      s_description.innerHTML = '<b>It is</b> '+building['info']['description'];
      s_HP.innerHTML = '<b>HP</b>: '+building['characts']['HP'];
      s_XP.innerHTML = '<b>XP</b>: '+building['characts']['XP'];
      s_Gold.innerHTML = '<b>Gold for destroy</b>: '+building['characts']['Reward']
   };

   function showSpriteDescr(sprite) {
      selectPanel.style.display = 'block';
      s_avatar.innerHTML = '<img src="/media/textures/'+sprite['info']['avatar']+'" style="width: 5vw;"/>';
      s_name.innerHTML = '<b>Name</b>: '+sprite['owner'];
      s_description.innerHTML = '<b>It is</b> '+sprite['info']['description'];
      s_HP.innerHTML = '<b>HP</b>: '+sprite['characts']['HP'];
      s_XP.innerHTML = '<b>XP</b>: '+sprite['characts']['XP'];
      s_Gold.innerHTML = '<b>Gold for destroy</b>: '+sprite['characts']['Reward']
   };



   function showTextureDescr(desc) {
      // TODO -> Make a crop from sprites
      //      -> don't show null descriptions
      selectPanel.style.display = 'block';
      s_avatar.innerHTML = '<img src="/media/textures/'+desc['avatar']+'.png" style="width: 5vw;"/>';
      s_name.innerHTML = '<b>Name</b>: '+desc['name'];
      s_description.innerHTML = '<b>It is</b> '+desc['description'];
      s_HP.innerHTML = '<b>HP</b>: '+desc['HP'];
      s_XP.innerHTML = '<b>XP</b>: '+desc['XP'];
      s_Gold.innerHTML = '<b>Gold for destroy</b>: '+desc['Reward']
   };


   function which(event){
      // Change one of 3 buttons of mouse
      switch(event.which){
         case 1:
            getTextureDescription(event);break;
         case 3:
            app.unitsControl.pointClick(event);break;
         default:
            console.log('Middle mouse button pressed?');break
      }
   };


   document.body.addEventListener('mousedown', which, false);
}