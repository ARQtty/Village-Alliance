/**
General application logic. It is planned to divide into parts
@module engine
*/
$(function() {
window.app = {

   /**
   Gets textures and map from server. Is an entry-point of client-part of the app
   @method downloadWorld
   */
   downloadWorld: function () {
      $.when(
         app.graphics.textures.download(
            '/media/textures/grass.png',
            app.graphics.textures.grass
         ),
         app.graphics.textures.download(
            '/media/textures/terrain.png',
            app.graphics.textures.terrain
         ),
         app.graphics.textures.download(
            '/media/textures/monsters.png',
            app.graphics.textures.monsters
         ),
         app.graphics.textures.download(
            '/media/textures/hurt.png',
            app.graphics.textures.hurt),
         app.environment.downloadMap(),
         app.environment.downloadBuildings(),
         app.environment.downloadData()
      ).done(function() {
         console.info('Okey downloadWorld');
         app.intialize();
      });
   },

   intialize: function() {
      app.building.init();
      app.graphics.initEffectsMap();
      app.graphics.cells = app.graphics.getViewport();
      app.graphics.intialize();
      app.keyBinds.init();
      app.network.connectSocket();
      app.network.bindEvents();
      app.sprites.listenActions();
      app.sprites.initGameLoop();
      app.moveViewport.drawMinimapViewport();
   },


   /**

   @memberof engine
   @module environment
   */
   environment: {

      map: {
         data: []
      },


      /**
      Gets textures descriptors from server
      @method downloadData
      */
      downloadData: function() {
         return $.get('/media/data.json').pipe(function(data) {
            app.graphics.textures.descriptors = data;
            return true;
         });
        },


      downloadBuildings: function() {
         return $.get('/media/buildings.json').pipe(function(data) {
            app.building.buildings = data;
            return true;
         });
      },


      /**
      Gets array-like map from server. Also gets size of map
      @method
      */
      downloadMap: function() {
        return $.get('/media/map.json').pipe(function(data) {
           app.environment.map.sizeX = data.length;
           app.environment.map.sizeY = data[0].length;
              console.info('Map sizes: x='+data.length+' y='+data[0].length);
            app.environment.map.data = data;
            return true;
         })
      },


      /**
      Gets information about texture from it's ID. MAYBE USELESS
      @method getTextureInfo
      @param x {Integer}
      @param y {Integer}
      @return description {Object}
      */
      getTextureInfo: function(x, y) {
         var textureId = width.app.environment.getCellByPosition(x, y);
         console.log(textureId);
         return app.graphics.textures.descriptors[textureId]
      },


      /**
      Gets cell value by click coordinates
      @method getCellByPosition
      @param  top {Integer} Distance from top of window
      @param left {Integer} Distance from left of window
      @return cells[top][left] {Integer} Value of cell in this position 
      */
      getCellByPosition: function(top, left) {
         var topIndex = Math.floor(top / app.graphics.cellSize)
         var leftIndex = Math.floor(left / app.graphics.cellSize)
         
         console.log('cells['+topIndex.toString()+']['+leftIndex.toString()+'] value='+app.graphics.cells[topIndex][leftIndex])

         return app.graphics.cells[topIndex][leftIndex]
      },


      /**
      Gets cells coordinates from mouse click coordinates
      @method getCellCoords
      @param x {Integer} Distance in pixels from left of window
      @param y {Integer} Distance in pixels from top of window
      @return [xIndex, yIndex] {Array} Indexes of cell in world map
      */
      getCellCoords: function(x, y) {
         var xIndex = Math.floor(x / app.graphics.cellSize);
         var yIndex = Math.floor(y / app.graphics.cellSize);
         return [xIndex, yIndex]
      }
   },


   /**

   @module graphics
   */
   graphics: {
      cellSize: 32,
      x1: 0,
      y1: 0,
      x2: Math.ceil(document.body.clientWidth  / 32),
      y2: Math.ceil(document.body.clientHeight / 32),
      viewportCells: [], // Maybe not needed cause of cells variable
      cells: [],
      visEffects: [],
      viewVisEffects: [],
      
      cellsInRow: Math.ceil(document.body.clientWidth  / 32),
      cellsInColumn: Math.ceil(document.body.clientHeight / 32),

      canvas: document.getElementById('game'),

      textures: {
         grass: new Image(),
         terrain: new Image(),
         monsters: new Image(),
         hurt: new Image(),
         descriptors: {
            terrain: null,
            monsters: null
         },

         /**
         Mappings texture data from a server with code objects 
         of theese textures
         @method download
         @param url {String} Path to file on server
         @param texture {Object} Object for write in data from url
         @return Promise {Object} Deferred download object
         */      
         download: function(url, texture) {
            var d = $.Deferred();
            texture.src = url;
            texture.onload = function() { d.resolve(); }
            texture.onerror = function() { d.reject(); }
            return d.promise();
         }
      },


      /**
      Cuts a piece of the world map array that is in the visibility zone on the screen
      @method getViewport
      @return cells {Array} The visible part of world map
      */
      getViewport: function() {
         var viewCells = [];

         for (var x = app.graphics.x1; x<app.graphics.x2; x++){
            viewCells.push([]);
            for (var y=app.graphics.y1; y<app.graphics.y2; y++){
               var cellData;
               if (app.building.buildingsMap[x][y] != 0){
                  cellData = app.building.buildingsMap[x][y];
               }else{
                  cellData = app.environment.map.data[x][y];
               }
               viewCells[viewCells.length - 1].push(cellData);
            }
         }
         app.graphics.cells = viewCells; // Maybe not needed
         app.graphics.getViewEffects(); // Update effectsMap
         return viewCells
      },
      getViewEffects: function() {
         var effMap = [];
         for (var x=app.graphics.x1; x<app.graphics.x2; x++){
            effMap.push([]);
            for (var y=app.graphics.y1; y<app.graphics.y2; y++){
               effMap[effMap.length - 1].push(app.graphics.visEffects[x][y]);
            }
         }
         app.graphics.viewVisEffects = effMap;
      },


      /**
      Covers the game field with surface textures
      @method fillMap
      @todo Need only a pattern for grass and road is needed?
      */
      fillMap: function() {
         /* terrain drawing */
         var context = app.graphics.canvas.getContext('2d');
         
         app.graphics.canvas.width = document.body.clientWidth;
         app.graphics.canvas.height = document.body.clientHeight;
         // Cells representation
         var cells = app.graphics.cells;
         var cSize = app.graphics.cellSize;

         // Most popular patterns
         var grass = context.createPattern(app.graphics.textures.grass, 'repeat');

         for (var x=0; x < cells.length; x++){
            for (var y=0; y < cells[x].length; y++){
               var cellValue = cells[x][y];

               if (cellValue == 0) {
                  // grass pattern
                  context.fillStyle = grass;
                  context.fillRect(x * cSize, y * cSize, cSize, cSize);

               }else if (typeof cellValue == 'object'){  // Is building
                  if (cellValue.status != 'dies'){
                     var texture = app.graphics.textures.terrain;
                     context.drawImage(texture,                      // Image
                                       0,                            // sx
                                       cellValue.textureCode * cSize,// sy
                                       cSize,                        // sWidth
                                       cSize,                        // sHeight
                                       x * cSize,                    // dx
                                       y * cSize,                    // dy
                                       cSize,                        // dWidth
                                       cSize);                       // dHeight                 
                  }else{
                     try{
                        var xd = cellValue.coords.x,
                            yd = cellValue.coords.y;
                        if (cellValue.animCounter == 0){
                              app.building.deleteBuildingWithCoords(xd, yd);
                              app.environment.map.data[xd][yd] = 0;
                              //app.graphics.cells[xd][yd] = 0;
                              app.graphics.cells = app.graphics.getViewport();
                        }else{
                              app.building.buildingsMap[xd][yd].animCounter--;
                              app.graphics.cells[xd][yd].animCounter--;
                              // 5 is a number of skull texture in textureset
                              context.drawImage(app.graphics.textures.terrain, 0, 5*cSize, cSize, cSize, x*cSize, y*cSize, cSize, cSize)
                        }
                     }catch(e){
                        console.log('Err at xd xd -->', xd, yd);
                        console.log('Cell value is', cellValue);
                        console.log('Err is ', e);
                     }
                  }

               }else{
                  var texture = app.graphics.textures.terrain;
                  context.drawImage(texture,          // Image
                                    0,                // sx
                                    cellValue * cSize,// sy
                                    cSize,            // sWidth
                                    cSize,            // sHeight
                                    x * cSize,        // dx
                                    y * cSize,        // dy
                                    cSize,            // dWidth
                                    cSize);           // dHeight
               } 
            }
         }

         
         // Draw goHere crosses
         var crosses = app.unitsControl.visual.crosses;
         for (var i=0; i<crosses.length; i++){
            var x = crosses[i].x, 
                y = crosses[i].y;
            app.unitsControl.visual.drawCross(x, y);
         }

         // Draw select squares
         var squares = app.unitsControl.visual.selectSquares;
         for (var i=0; i<squares.length; i++){
            var x = squares[i].x, 
                y = squares[i].y;
            app.unitsControl.visual.drawGreenSquare(x, y);
         }

         // Draw dotted lines
         var dtl = app.unitsControl.visual.dottedLines;
         for (var l=0; l<dtl.length; l++){
            context.beginPath();
            context.lineWidth = 2;
            context.setLineDash([7, 17]);
            context.strokeStyle = dtl[l].color;
            context.moveTo((dtl[l].points[0][0] - app.graphics.x1) * cSize + cSize/2, 
                          (dtl[l].points[0][1] - app.graphics.y1) * cSize + cSize/2);
            
            for (var i=1; i<dtl[l].points.length; i++){
               context.lineTo((dtl[l].points[i][0] - app.graphics.x1) * cSize + cSize/2, 
                             (dtl[l].points[i][1] - app.graphics.y1) * cSize + cSize/2);
            }
            
            context.stroke();
         }
         

         // Delete finished pathes and crosses of it
         for (var i=0; i<dtl.length; i++){    // MAYBE MOVE TO OTHER MODULE
            if (dtl[i].points.length == 1){
               // Del cross
               for (var j=0; j<crosses.length; j++){
                  var lastInd = dtl[i].points.length - 1;
                  if (crosses[j].x == dtl[i].points[lastInd][0] &&
                     crosses[j].y == dtl[i].points[lastInd][1]){
                     app.unitsControl.visual.crosses = crosses.slice(0, j).concat(crosses.slice(j+1, crosses.length));
                     break;
                  }
               }
               // Del line
               console.log('Short line #'+i);
               app.unitsControl.visual.dottedLines = dtl.slice(0, i).concat(dtl.slice(i+1, dtl.length));
               i--;
               dtl = app.unitsControl.visual.dottedLines;
            }
         }
      },


      drawVisualEffects: function(){
         let effMap = app.graphics.viewVisEffects,
             x1 = app.graphics.x1,
             y1 = app.graphics.y1;

         for (var x=0; x < effMap.length; x++){
            for (var y=0; y < effMap[x].length; y++){
               // Visual effects
               // TODO --> Multiple effects in one cell
               if (effMap[x][y] != 0){
                  let effect = effMap[x][y][0];
                  if (effect.duration == 0){
                     // Destroy effect globally and locally
                     app.graphics.visEffects[x+x1][y+y1][0];
                     app.graphics.viewVisEffects[x][y][0] = 0;
                  }else{
                     effect.animate(context, 
                                    32*x, 32*y, 
                                    effect.duration, 
                                    effect.texture);
                     app.graphics.visEffects[x+x1][y+y1][0].duration--;
                     app.graphics.viewVisEffects[x][y][0].duration--;

                  }
               }
            }
         }
      },


      /**
      Builds structure in cell with coords x, y
      @method fillCellWithTexture
      @param x {Integer} X-index of cell in world map array
      @param y {Integer} Y-index of cell in world map array
      @param textureId {Integer} Code of object which be written to world map
      */
      fillCellWithTexture: function(x, y, textureId) {
         app.environment.map.data[y + app.graphics.x1][x + app.graphics.y1] = textureId;
         app.graphics.cells = app.graphics.getViewport();
         app.graphics.fillMap()
      },

      intialize: function() {
         app.graphics.fillMap();
         console.info('Okey intialize graphics');
      },

      initEffectsMap: function() {
         for (var i=0; i<app.environment.map.sizeX; i++){
            app.graphics.visEffects.push([]);
            for (var j=0; j<app.environment.map.sizeY; j++) app.graphics.visEffects[i].push(0);
         }
         console.info('Ok init effects map');
      }
   },


   /**

   @module chat
   */
   chat: {
      chatPanel: document.getElementById('messagefield'),
      $output: $('#messages'),
        $input: $('#message-input'),


        /**
      Sends text from the chat input line to the server
        @method sendMessage
        */
        sendMessage: function() {
            var message = app.chat.$input.val();
            app.chat.$input.val('');
            app.chat.message('P1', message);
            app.network.send.chat(message);
        },


        /**
        Enter button is controling chatPanel.
      Show if hidden, hide if showing and it hasn't any message. 
      Sending message if there is some text in form
      @method toggle
      */
      toggle: function() {
         if (app.chat.chatPanel.style.display == 'block'){
         
            if (app.chat.$input.val() != ''){ app.chat.sendMessage() }
            else{ app.chat.chatPanel.style.display = 'none' }
         
         }else{ app.chat.chatPanel.style.display = 'block' }
      },


      /**
      Shows message in chat panel. Filter for avoiding XSS attacks
      @method message
      @param who {String} Name of person which sended message
      @param message {String} Text of the message
      */
      message: function(who, message) {
         /* Defence from XSS */
         message = message.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            who = who.replace(/&/g, "&amp;").replace(/>/g, "&gt;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
            app.chat.$output
                .append("<div module='message'><span module='username'>" + who + ": </span><span module='content'>" + message + "</span></div>")
      }
   },


   /**

   @module network
   */
   network: {
      socket: null,
      socketName: null,


      /**
      Creates socket object.
      @method connectSocket
      */
      connectSocket: function() {
         app.network.socket = io.connect(window.document.location.protocol + "//" + window.document.location.host);
      },

      send: {
         chat: function(message) {
            app.network.socket.emit('chat', {
               name: 'Someone happy',
               message: message
            });
         }
      },

      /**
      Bind "chat" socket event for delegating message displaying
      on module:network:connectSocket
      */
      bindEvents: function() {
         var socket = app.network.socket;

         socket.on('chat', function (data) {
            app.chat.message(data.name, data.message);
         });

         socket.on('socketName', function (name) {
            app.network.socketName = name;
         });

         socket.on('newBuild', function(data) {
            console.log('Для newBuild не хватает данных');
            app.building.placeStructure(data.x, 
                                        data.y, 
                                        data.code);
         });
      }
   },

   /**

   @module keyBinds
   */
   keyBinds: {

      init: function() {
         $(document).keydown(app.keyBinds.keyboardHandler);
      },


      /**
      Catches keypress events and run appropriate functions
      @method keyboardHandler
      @param e {Event} Keypress event
      */
      keyboardHandler: function(e) {
         if (e.keyCode == 13){
            /* Enter */
            app.chat.toggle();

         /* Move viewport */
         }else if (e.keyCode == 38){
            app.moveViewport.moveUp();
            e.preventDefault();
         }else if (e.keyCode == 39){
            app.moveViewport.moveRight();
            e.preventDefault();
         }else if (e.keyCode == 40){
            app.moveViewport.moveDown();
            e.preventDefault();
         }else if (e.keyCode == 37){
            app.moveViewport.moveLeft();
            e.preventDefault();

         }else if (e.keyCode == 192 || e.keyCode == 0){
            // ` or ё key
            e.preventDefault();
            app.moveViewport.displayMap()

         }else{
            console.log('Unbinded keyCode "'+e.keyCode+'"')
         }
      }
   }
};
app.downloadWorld();
});
