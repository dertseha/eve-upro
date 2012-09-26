var log4js = require('log4js');
var logger = log4js.getLogger();

var getSessionStoreStateInterface = require('./SessionStoreStateInterface.js');
var getActiveSessionStoreState = require('./ActiveSessionStoreState.js');

/**
 * Supported options:
 * <ul>
 * <li>db: Database reference</li>
 * <li>collectionName: The name of the collection to store the data in. Default: 'sessions'</li>
 * <li>ttlSec: The amount of seconds to hold the data if no expiry is set. Default: one day</li>
 * <li>timeGiver: A parameterless function returning a date object for the current time. Default: new Date()</li>
 * </ul>
 * 
 * @param options an object containing parameters
 */
module.exports = function(options)
{
   var that = Object.create(getSessionStoreStateInterface());

   that.activate = function(owner, callback)
   {
      var collectionOptions = {};
      var collectionName = options.collectionName || 'sessions';

      owner.setState(this);

      options.db.collection(collectionName, collectionOptions, function(err, collection)
      {
         if (err)
         {
            callback(err);
         }
         else
         {
            var newState = getActiveSessionStoreState(options, collection);

            logger.info('Defined collection [' + collectionName + ']');

            newState.activate(owner);
            callback();
         }
      });
   };

   return that;
};
