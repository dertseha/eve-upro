var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var busMessages = require('../model/BusMessages.js');

var LocationStatusGroupState = require('./LocationStatusGroupState.js');
var NullLocationStatusGroupState = require('./NullLocationStatusGroupState.js');

function ActiveLocationStatusGroupState(service, character, group)
{
   this.service = service;
   this.character = character;
   this.group = group;

   /** {@inheritDoc} */
   this.activate = function()
   {
      this.service.setGroupState(this.character, this.groupId, this);

      this.broadcastCharacterLocationStatusGroupSettings();
      if (this.group.isSendLocationEnabled())
      {
         this.service.broadcastLocationStatus(this.character, this.getGroupInterest());
      }
   };

   /** {@inheritDoc} */
   this.onCharacterGroupSyncFinished = function()
   {
      logger.error('Unexpected: Handling GroupSyncFinished in ActiveLocationStatusGroupState');
   };

   /** {@inheritDoc} */
   this.onCharacterSessionAdded = function(interest, responseQueue)
   {
      this.broadcastCharacterLocationStatusGroupSettings(interest, responseQueue);
   };

   /** {@inheritDoc} */
   this.onCharacterGroupMemberRemoved = function(groupId)
   {
      var nextState = new NullLocationStatusGroupState(this.service, this.character, this.group);

      nextState.activate();
      if (this.group.isSendLocationEnabled())
      {
         this.service.broadcastLocationStatusUndefined(this.character, this.getGroupInterest());
      }
   };

   /** {@inheritDoc} */
   this.processBroadcast = function(header, body)
   {
      var handler = this['onBroadcast' + header.type];

      if (handler)
      {
         handler.call(this, body);
      }
      else
      {
         logger.error('Unhandled broadcast [' + header.type + '] in ActiveLocationStatusGroupState');
      }
   };

   /** {@inheritDoc} */
   this.addInterest = function(interestList)
   {
      if (this.group.isSendLocationEnabled())
      {
         interestList = interestList.concat(this.getGroupInterest());
      }

      return interestList;
   };

   this.getGroupInterest = function()
   {
      var interest = [
      {
         scope: 'Group',
         id: this.group.getGroupId()
      } ];

      return interest;
   };

   this.getCharacterInterest = function()
   {
      var interest = [
      {
         scope: 'Character',
         id: this.character.getCharacterId()
      } ];

      return interest;
   };

   /**
    * Broadcast the settings
    * 
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastCharacterLocationStatusGroupSettings = function(interest, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts.CharacterLocationStatusGroupSettings.name,
         interest: interest || this.getCharacterInterest()
      };
      var body = this.group.getSettingsBody();

      this.service.amqp.broadcast(header, body, queueName);
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestModifyCharacterLocationStatusGroup = function(body)
   {
      var changed = false;

      if (body.hasOwnProperty('sendLocation') && this.group.updateSendLocation(body.sendLocation))
      {
         if (this.group.isSendLocationEnabled())
         {
            this.service.broadcastLocationStatus(this.character, this.getGroupInterest());
         }
         else
         {
            this.service.broadcastLocationStatusUndefined(this.character, this.getGroupInterest());
         }
         changed = true;
      }
      if (body.hasOwnProperty('displayLocation') && this.group.updateDisplayLocation(body.displayLocation))
      {
         changed = true;
      }
      if (changed)
      {
         this.broadcastCharacterLocationStatusGroupSettings();
      }
   };
}
util.inherits(ActiveLocationStatusGroupState, LocationStatusGroupState);

module.exports = ActiveLocationStatusGroupState;
