var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var LogInRequestStateKeyInfo = require('./LogInRequestStateKeyInfo.js');

function LogInRequest(owner, id, done)
{
   var state = new LogInRequestStateKeyInfo(this, done);
   var isDone = false;

   this.getId = function()
   {
      return id;
   };

   this.getOwner = function()
   {
      return owner;
   };

   /**
    * Handles the response from an EVE API request.
    * 
    * @returns true if the request is completed and can be removed
    */
   this.onEveApiMessage = function(struct)
   {
      state.onEveApiMessage(struct);

      return isDone;
   };

   this.setState = function(newState)
   {
      state = newState;
   };

   this.done = function(err, user)
   {
      isDone = true;
      done(err, user);
   };
}

module.exports = LogInRequest;
