/**
Visual effects for drawing in canvas placed here
@module visualEffects
*/

var e = Math.exp, 
    cos = Math.cos, 
    pow = Math.pow;

$(function() {
window.app.visualEffects = {

   hurt: function(ctx, x, y, duration, texture){
      let xBiasKoef = 0.7;
      let yBiasKoef = 0.4;

      let bias = cos(duration/2) * e(0.08*duration);

      ctx.drawImage(texture, 
                    x + bias*xBiasKoef, 
                    y + bias*yBiasKoef, 
                    32, 32);

   }
}})