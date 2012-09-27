var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var UuidFactory = require('../util/UuidFactory.js');

var LocationStatusGroupState = require('./LocationStatusGroupState.js');

function NullLocationStatusGroupState(service, character, group)
{
   this.service = service;
   this.character = character;
   this.group = group;

   /** {@inheritDoc} */
   this.activate = function()
   {
      this.service.setGroupState(this.character, this.group.getGroupId(), null);

      this.group.deleteFromStorage(this.service.mongodb);

      return this;
   };

   /** {@inheritDoc} */
   this.onCharacterGroupSyncFinished = function()
   {

   };

   /** {@inheritDoc} */
   this.onCharacterSessionAdded = function(interest, responseQueue)
   {
      // ignored, nothing to send here
   };

   /** {@inheritDoc} */
   this.processBroadcast = function(header, body)
   {
      // deliberately ignored
   };

   /** {@inheritDoc} */
   this.addInterest = function(interestList)
   {
      return interestList;
   };

}
util.inherits(NullLocationStatusGroupState, LocationStatusGroupState);

module.exports = NullLocationStatusGroupState;
