module.exports = function()
{
   var that = Object.create({});

   that.get = function(sid, callback)
   {
      callback('Not Implemented (get)');
   };

   that.set = function(sid, session, callback)
   {
      callback('Not Implemented (set)');
   };

   that.destroy = function(sid, callback)
   {
      callback('Not Implemented (destroy)');
   };

   that.length = function(callback)
   {
      callback('Not Implemented (length)');
   };

   that.clear = function(callback)
   {
      callback('Not Implemented (clear)');
   };

   return that;
};
