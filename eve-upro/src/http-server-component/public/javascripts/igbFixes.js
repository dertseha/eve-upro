/*
 * A fix to simulate the Object.create function
 * Based on http://javascript.crockford.com/prototypal.html 
 */
if (typeof Object.create !== 'function')
{
   Object.create = function(baseClass)
   {
      function Result()
      {
      }
      Result.prototype = baseClass;

      return new Result();
   };
}
