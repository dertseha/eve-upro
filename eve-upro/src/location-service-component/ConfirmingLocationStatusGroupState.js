var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var UuidFactory = require('../util/UuidFactory.js');

var LocationStatusGroup = require('./LocationStatusGroup.js');
var LocationStatusGroupState = require('./LocationStatusGroupState.js');
var ActiveLocationStatusGroupState = require('./ActiveLocationStatusGroupState.js');
var NullLocationStatusGroupState = require('./NullLocationStatusGroupState.js');

function ConfirmingLocationStatusGroupState(service, character, group)
{
   this.service = service;
   this.character = character;
   this.group = group;

   this.broadcastQueue = [];

   /** {@inheritDoc} */
   this.activate = function()
   {
      var nextState = this;

      this.service.setGroupState(this.character, this.group.getGroupId(), this);
      if (this.character.isGroupSyncFinished())
      {
         nextState = this.handleGroupSyncFinished();
      }

      return nextState;
   };

   /** {@inheritDoc} */
   this.onCharacterGroupSyncFinished = function()
   {
      this.handleGroupSyncFinished();
   };

   /** {@inheritDoc} */
   this.onCharacterSessionAdded = function(interest, responseQueue)
   {
      // ignored, nothing to send here
   };

   /** {@inheritDoc} */
   this.processBroadcast = function(header, body)
   {
      var broadcast =
      {
         header: header,
         body: body
      };

      this.broadcastQueue.push(broadcast);
   };

   /** {@inheritDoc} */
   this.addInterest = function(interestList)
   {
      return interestList;
   };

   this.handleGroupSyncFinished = function()
   {
      var nextState = null;

      if (this.character.hasInterestForGroup(this.group.getGroupId()))
      {
         nextState = this.getNextState();
      }
      else
      {
         logger.info('Character ' + this.character.toString() + ' is not a member of the group '
               + this.group.getGroupId() + ' anymore. Entering null State');
         nextState = new NullLocationStatusGroupState(this.service, this.character, this.group);
      }
      nextState.activate();

      return nextState;
   };

   this.getNextState = function()
   {
      return new ActiveLocationStatusGroupState(this.service, this.character, this.group);
   };
}
util.inherits(ConfirmingLocationStatusGroupState, LocationStatusGroupState);

module.exports = ConfirmingLocationStatusGroupState;
