/**
 * Request for a frame animation.
 * See http://paulirish.com/2011/requestanimationframe-for-smart-animating/  et al.
 */
window.requestAnimFrame = (function()
{
   return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element)
      {
         return window.setTimeout(callback, 1000 / 60);
      };
})();

/**
 * Stops an animation loop
 */
window.cancelRequestAnimFrame = (function()
{
   return window.cancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.oCancelRequestAnimationFrame ||
      window.msCancelRequestAnimationFrame ||
      window.clearTimeout;
})();
