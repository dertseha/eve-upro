if (!Array.prototype.filter)
{
   /**
    * Extends the array type with a fold method, signature: function(func, seed) { return result; }
    * 
    * The passed function has a signature of function(entry, result) { return result; }. entry is coming from the array
    * and result the accumulated value, starting with seed.
    * 
    * Folding is started at the head.
    * 
    * @param func the function to call for each entry
    * @param seed the initial value for the fold function
    * @returns the result
    */
   Array.prototype.foldLeft = function(func, seed)
   {
      var result = seed;

      this.forEach(function(entry)
      {
         result = func(entry, result);
      });

      return result;
   };

   /**
    * Extends the array type with a filter method, signature: function(func) { return array; }
    * 
    * The passed function has a signature of function(entry) { return boolean; }. entry is coming from the array
    * 
    * @param func the function to call for each entry
    * @returns {Array} a reduced array that contains members func returned true for.
    */
   Array.prototype.filter = function(func)
   {
      var result = [];

      this.forEach(function(entry)
      {
         if (func(entry))
         {
            result.push(entry);
         }
      });

      return result;
   };

   /**
    * Extends the array type with a map method, signature: function(func) { return result; }
    * 
    * The passed function has a signature of function(entry) { return result; }. entry is coming from the array
    * 
    * @param func the function to call for each entry
    * @returns {Array} an array of the same size as this, containing the results of each computation
    */
   Array.prototype.map = function(func)
   {
      var result = [];

      this.forEach(function(entry)
      {
         result.push(func(entry));
      });

      return result;
   };
}
