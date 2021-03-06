/**
Sprite logic of the app
@module sprites
*/
$(function() {
window.app.sprites = {
   sprCanvas: document.getElementById('monstersGameField'),
   fps: 34,
   spriteSwapDirFreq: 20,


   /**
   Catches socket's event and run appropriate functions
   @method listenActions
   */
   listenActions: function() {
      socket = app.network.socket;
      socket.on('newUnit', function(data){
         data.moving.swapDirVariantCounter = app.sprites.spriteSwapDirFreq;
         app.sprites.coords.push(data);
         app.sprites.drawViewportSprites();
      });

      socket.on('moveUnit', function(data){
         // Define direction
         if (data.dx == -1 && data.dy ==  0) data.newDir = 0;
         if (data.dx ==  0 && data.dy == -1) data.newDir = 2;
         if (data.dx ==  0 && data.dy ==  1) data.newDir = 4;
         if (data.dx ==  1 && data.dy ==  0) data.newDir = 6;
         data.newDirVariant = 0;

         app.sprites.moving.updateCoords(data);
      });
      socket.on('dottedPathLine', function(data){
         // Check existance of this line (since last step) and
         // rewrite. Write out if not exists
         var dtls = app.unitsControl.visual.dottedLines;
         for (var i=0; i<dtls.length; i++){
            if (dtls[i].moveID == data.moveID){
               app.unitsControl.visual.dottedLines[i] = data;
               return
            }
         }
         app.unitsControl.visual.dottedLines.push(data);
      });
      
      socket.on('died_unit', function(msg){
         var arr = app.sprites.coords;
         for (var i=0; i<arr.length; i++){
            if (msg.id == arr[i].id){
               app.sprites.coords = app.sprites.coords.slice(0, i)
                                    .concat(
                                    app.sprites.coords.slice(i+1, app.sprites.coords.length));
            }
         }
      });

      socket.on('died_building', function(msg){
         app.building.buildingsMap[msg.x][msg.y] = {type: "building",
                                                    status: 'dies',
                                                    animCounter: app.sprites.fps*2, 
                                                    coords: {x: msg.x, 
                                                             y: msg.y}
                                                    };

         app.graphics.viewportCells = app.graphics.getViewport();
      });
      
      socket.on('attack', function(data){
         let texture = app.graphics.textures.hurt;

         app.graphics.visEffects[data.x][data.y].push({name: "damage",
                                                       animData: data.damage,
                                                       duration: data.duration,
                                                       animate: app.visualEffects.damage});
         app.graphics.visEffects[data.x][data.y].push({name: "hurt",
                                                       animData: texture,
                                                       duration: data.duration,
                                                       animate: app.visualEffects.hurt});
         app.sprites.lowerUnitHP(data.id, data.damage);
         
         if (data.x >= app.graphics.x1 && data.x <= app.graphics.x2 &&
             data.y >= app.graphics.y1 && data.y <= app.graphics.y2){
            app.graphics.getViewEffects();
         }
      });

      console.info('Okey init listenActions');
   },


   initGameLoop: function() {
      setInterval(app.sprites.moving.gameLoop, app.sprites.fps);
      console.info('Okey init game loop')
   },

   coords: [],

   moving: {


      /**
      Calls at moveUnit, dethUnit and etc. events. Changes unit's coordinate array
      @method updateCoords
      @param message {Array} JSON object with data about happening
      */
      updateCoords: function(message) {
         var arr = app.sprites.coords;
         for (var i=0; i<arr.length; i++){
            
            if (arr[i].id == message.id && message.action == 'move'){
               arr[i].moving.need2Move = true;
               arr[i].abs_x += message.dx;
               arr[i].abs_y += message.dy;
               arr[i].moving.need2MoveX += message.dx;
               arr[i].moving.need2MoveY += message.dy;
               arr[i].moving.direction = message.newDir;
               arr[i].moving.dirVariant = message.newDirVariant;
               break;

            }else{
               // Swap blocks. Improve performance a bit
               if (arr[i].moving.swapDirVariantCounter > 0 && arr[i].moving.need2Move){
                  
                  if (arr[i].moving.swapDirVariantCounter > app.sprites.spriteSwapDirFreq/2) arr[i].moving.dirVariant = 1;
                  else arr[i].moving.dirVariant = 0;
                  
                  arr[i].moving.swapDirVariantCounter -= 1;
               }else{
                  arr[i].moving.swapDirVariantCounter = app.sprites.spriteSwapDirFreq;
               }
            }
         }
         app.sprites.coords = arr;
      },

      gameLoop: function() {
         /* Drawing unit's moves - updating canvas */
         var toMove = app.sprites.coords;
         var fps = app.sprites.fps;

         for (var i=0; i<toMove.length; i++){
            if (toMove[i].moving.need2Move) {
               /* Moves are creating on server side. Server uses
                  Lee Algorithm and sends next move when
                  actual move is finished. */

               // Speed in px/s, x in blocks
               var dS = toMove[i].moving.speed / 1000;
               //console.log(dS);

               // Should we moving sprite?
               if (Math.abs(toMove[i].moving.need2MoveX) > dS ||
                  Math.abs(toMove[i].moving.need2MoveY) > dS){
                  
                  // Moving one axis

                  if (Math.abs(toMove[i].moving.need2MoveX) >= Math.abs(toMove[i].moving.need2MoveY)){

                     if (toMove[i].moving.need2MoveX > 0){
                        toMove[i].moving.need2MoveX -= dS;
                        toMove[i].x += dS;
                     }else{
                        toMove[i].moving.need2MoveX += dS;
                        toMove[i].x -= dS;
                     }

                  }else{

                     if (toMove[i].moving.need2MoveY > 0){
                        toMove[i].moving.need2MoveY -= dS;
                        toMove[i].y += dS;
                     }else{
                        toMove[i].moving.need2MoveY += dS;
                        toMove[i].y -= dS;
                     }
                  }

                  // Finally, check compleating the movement and correct texture biases
                  if (Math.abs(toMove[i].moving.need2MoveX) <= dS &&
                     Math.abs(toMove[i].moving.need2MoveY) <= dS){
                     // Search this sprite in array
                     toMove[i].x = toMove[i].abs_x;
                     toMove[i].y = toMove[i].abs_y;
                     toMove[i].moving.need2Move = false;
                     toMove[i].direction = 4;
                     toMove[i].dirVariant = 0;
                     toMove[i].swapDirVariantCounter = app.sprites.spriteSwapDirFreq;
                  }

               }
            }
         }
         // Redraw gamefield after all movements
         app.sprites.coords = toMove;
         app.graphics.fillMap();
         app.sprites.drawViewportSprites();
         app.graphics.drawVisualEffects();
         app.sprites.moving.updateCoords({action: 'swapDirectionVariant'});
      }
   },


   /**
   Scan mosters array and return monsters which are in viewport
   @method getViewportSprites
   @return sprites {Array} Array of objects - monsters information
   */
   drawViewportSprites: function() {
      context = app.graphics.canvas.getContext('2d');
      var sprites2draw = app.sprites.getViewportSprites();
          cSize = app.graphics.cellSize;
      
      for (var i = 0; i < sprites2draw.length; i++){
         var xSpr = sprites2draw[i].x - app.graphics.x1,
             ySpr = sprites2draw[i].y - app.graphics.y1,
             dir = sprites2draw[i].moving.direction + sprites2draw[i].moving.dirVariant;
         context.drawImage(app.graphics.textures.monsters,
                           dir * cSize,
                           sprites2draw[i].textureType * cSize,
                           cSize,
                           cSize,
                           xSpr * cSize,
                           ySpr * cSize,
                           cSize,
                           cSize);

         // Draw health bars
         // Cell has 32px width and health bar is 32px too. HP bar has two 
         // parts - all HP and current HP
         var allHP = sprites2draw[i].characts.HP;
         var curHP = sprites2draw[i].characts.curHP;
         var greenPart = 32 * (curHP / allHP);
         var red__Part = 32 - greenPart;
         context.beginPath();
         context.lineWidth = 2;
         context.setLineDash([0, 0]);
         // Green part
         context.strokeStyle = "#7BD10E";
         context.moveTo(xSpr*cSize, ySpr*cSize);
         context.lineTo(xSpr*cSize + greenPart, ySpr*cSize);
         context.stroke();
         // Red part
         context.beginPath();
         context.strokeStyle = "red";
         context.moveTo(xSpr*cSize + greenPart, ySpr*cSize);
         context.lineTo(xSpr*cSize + greenPart + red__Part, ySpr*cSize);
         context.stroke();
         

         // Mark units with their player's color
         var owner = sprites2draw[i].owner;
         var ARQcolor = "#05ff00";
         var guestColor = "#929292";
         if (sprites2draw[i].creatureType == "unit"){
            context.beginPath();
            context.lineWidth = 4;
            context.strokeStyle = (owner == "ARQ")? ARQcolor : guestColor;
            context.moveTo(xSpr*cSize + 8, ySpr*cSize + 20);
            context.lineTo(xSpr*cSize + 17,ySpr*cSize + 20);
            context.stroke();
         }
      }
   },


   /**
   Returns array of sprites which are in viewport
   @method getViewportSprites
   @return unitsInViewport {Array} Array of Objects - units representation*/
   getViewportSprites: function() {
      var inViewport  = [];
      var arr = app.sprites.coords;
      for (var i = 0; i < app.sprites.coords.length; i++){
         if (arr[i].x >= app.graphics.x1 &&
             arr[i].x <= app.graphics.x2 &&
             arr[i].y >= app.graphics.y1 &&
             arr[i].y <= app.graphics.y2)
         {
            inViewport.push(arr[i])
         }
      }
      return inViewport
   },


   unitWithCoords: function(x, y){
      var units = app.sprites.coords;
      for (var i=0; i<units.length; i++){
         if (units[i].abs_x == x && units[i].abs_y == y){
            return units[i].owner;
         }
      }
      return null
   },

   lowerUnitHP: function(id, dmg){
      for (var i=0; i<app.sprites.coords.length; i++){
         if (app.sprites.coords[i].id == id){
            app.sprites.coords[i].characts.curHP -= dmg;
            return
         }
      }
   }
}})