var SessionStore = require('express').session.Store;

var SessionStoreStateInterface = require('./sessionstore-mongodb/SessionStoreStateInterface.js')();
var getPendingSessionStoreState = require('./sessionstore-mongodb/PendingSessionStoreState.js');
var getActiveSessionStoreState = require('./sessionstore-mongodb/ActiveSessionStoreState.js');

module.exports = function(options, callback)
{
   var that = Object.create(new SessionStore(options));
   var state = getPendingSessionStoreState(options);

   for ( var name in SessionStoreStateInterface)
   {
      (function(methodName)
      {
         that[methodName] = function()
         {
            state[methodName].apply(state, arguments);
         };
      })(name);
   }
   that.setState = function(newState)
   {
      state = newState;
   };
   state.activate(that, callback);

   return that;
};
