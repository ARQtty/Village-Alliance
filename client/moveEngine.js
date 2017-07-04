/**
Viewport moving functions. Associated with the control arrows on the screen
@module moveViewport
*/

$(function() {
window.app.moveViewport = {


   /**
   @method moveUp
   */   
   moveUp: function() {
      var y1 = app.graphics.y1;
      if (y1 - Math.ceil(app.graphics.cellsInColumn / 2) > 0){
         app.graphics.y1 = y1 - Math.ceil(app.graphics.cellsInColumn / 2);
         app.graphics.y2 = app.graphics.y2 - Math.ceil(app.graphics.cellsInColumn / 2);
      }else{
         console.log('Can\'t move up')
         app.graphics.y1 = 0;
         app.graphics.y2 = app.graphics.cellsInColumn;
      }
      app.graphics.viewportCells = app.graphics.getViewport();
      app.graphics.fillMap();
      app.moveViewport.drawMinimapViewport();
   },

   /**
   @method moveRight
   */
   moveRight: function() {
      var x2 = app.graphics.x2;
      if (x2 + Math.ceil(app.graphics.cellsInRow / 2) < app.environment.map.sizeX){
         app.graphics.x1 = app.graphics.x1 + Math.ceil(app.graphics.cellsInRow / 2);
         app.graphics.x2 = x2 + Math.ceil(app.graphics.cellsInRow / 2);
      }else{
         app.graphics.x1 = app.environment.map.sizeX - app.graphics.cellsInRow;
         app.graphics.x2 = app.environment.map.sizeX;
         console.log('Can\'t move right');
      }
      app.graphics.viewportCells = app.graphics.getViewport();
      app.graphics.fillMap();
      app.moveViewport.drawMinimapViewport();
   },

   /**
   Calculates translated coordinates after pressing Down arrow on game
   screen. Calls fillMap and drawMinimapViewport functions
   @class
   @method moveDown
   */
   moveDown: function() {
      var y2 = app.graphics.y2;
      if (y2 + Math.ceil(app.graphics.cellsInColumn / 2) < app.environment.map.sizeY){
         app.graphics.y2 = y2 + Math.ceil(app.graphics.cellsInColumn / 2);
         app.graphics.y1 = app.graphics.y1 + Math.ceil(app.graphics.cellsInColumn / 2);
      }else{
         app.graphics.y2 = app.environment.map.sizeY;
         app.graphics.y1 = app.environment.map.sizeY - app.graphics.cellsInColumn;
         console.log('Can\'t move down')
      }
      app.graphics.viewportCells = app.graphics.getViewport();
      app.graphics.fillMap();
      app.moveViewport.drawMinimapViewport();
   },

   /**
   @method moveLeft
   */
   moveLeft: function() {
      var x1 = app.graphics.x1;
      if (x1 - Math.ceil(app.graphics.cellsInRow / 2) > 0){
         app.graphics.x1 = x1 - Math.ceil(app.graphics.cellsInRow / 2);
         app.graphics.x2 = app.graphics.x2 - Math.ceil(app.graphics.cellsInRow /2);
      }else{
         app.graphics.x1 = 0;
         app.graphics.x2 = app.graphics.cellsInRow;
         console.log('Can\'t move left');
      }
      app.graphics.viewportCells = app.graphics.getViewport();
      app.graphics.fillMap();
      app.moveViewport.drawMinimapViewport();
   },

   /**
   Draws a red rectangle on minimap. It shows viewport area.

   @method drawMinimapViewport
   */
   drawMinimapViewport: function() {
      var mapX = document.getElementById('minimap').offsetWidth;
      var mapY = document.getElementById('minimap').offsetHeight;
      var viewX = mapX / app.environment.map.sizeX;
      var viewY = mapY / app.environment.map.sizeY;

      var viewportDiv = document.getElementById('viewpot');
      viewport.style.width = viewX * (app.graphics.x2 - app.graphics.x1) + 'px';
      viewport.style.height = viewY * (app.graphics.y2 - app.graphics.y1) + 'px';

      viewport.style.left = viewX * app.graphics.x1 + 'px';
      viewport.style.top = viewY * app.graphics.y1 + 'px';
   },

   /**
   Shows minimap div if its display property is "none". Else set property to "none".

   @method displayMap
   */
   displayMap: function() {
      var map = document.getElementById('mapDecorator');
      map.style.display = (map.style.display == 'none') ? 'block' : 'none';

   }
}})