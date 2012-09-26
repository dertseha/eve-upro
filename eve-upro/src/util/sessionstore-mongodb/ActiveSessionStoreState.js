var getSessionStoreStateInterface = require('./SessionStoreStateInterface.js');

/**
 * Calculates the current timestamp in UTC seconds since epoch, rounded up
 * 
 * @returns the next full second since UTC epoch
 */
var getCorrectedTimestamp = function(timeGiver)
{
   var nowUtcString = timeGiver().toUTCString();
   var nowNextSecond = (new Date(nowUtcString).getTime() + 999) / 1000;

   return nowNextSecond | 0;
};

/**
 * @returns the current system time as a Date object
 */
var getCurrentDate = function()
{
   return new Date();
};

module.exports = function(options, collection)
{
   var that = Object.create(getSessionStoreStateInterface());
   var timeGiver = options.timeGiver || getCurrentDate;
   var oneDaySec = 60 * 60 * 24;
   var defaultTtlSec = options.ttlSec || oneDaySec;
   var clearTimer = null;

   var clearOld = function()
   {
      var curTick = getCorrectedTimestamp(timeGiver);

      collection.remove(
      {
         ttlLimit:
         {
            '$lte': curTick
         }
      }, function()
      {
      });
   };

   /**
    * Activates the state for given owner
    */
   that.activate = function(owner)
   {
      owner.setState(this);

      options.db.on('close', function()
      {
         clearInterval(clearTimer);
         clearTimer = null;
      });
      clearTimer = setInterval(clearOld, 1000);
   };

   /** {@inheritDoc} */
   that.get = function(sid, callback)
   {
      collection.findOne(
      {
         _id: sid
      }, function(err, data)
      {
         if (data)
         {
            callback(null, data.session);
         }
         else
         {
            callback(err);
         }
      });
   };

   /** {@inheritDoc} */
   that.set = function(sid, session, callback)
   {
      var maxAge = session.cookie.maxAge;
      var ttl = (typeof maxAge == 'number') ? ((maxAge / 1000) | 0) : defaultTtlSec;
      var document =
      {
         _id: sid,
         ttlLimit: getCorrectedTimestamp(timeGiver) + ttl,
         session: session
      };

      collection.save(document,
      {
         safe: 1
      }, function(err, updated)
      {
         callback(err);
      });
   };

   /** {@inheritDoc} */
   that.destroy = function(sid, callback)
   {
      collection.remove(
      {
         _id: sid
      }, callback);
   };

   /** {@inheritDoc} */
   that.length = function(callback)
   {
      collection.count({}, callback);
   };

   return that;
};
