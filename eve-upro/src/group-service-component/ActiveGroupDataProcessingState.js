var util = require('util');

var GroupDataProcessingState = require('./GroupDataProcessingState.js');

function ActiveGroupDataProcessingState(service, group)
{
   this.service = service;
   this.group = group;

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, interest, responseQueue)
   {
      if (this.group.isCharacterInvited(character))
      {
         this.service.broadcastGroupAdvertisements(this.group, true, interest, responseQueue);
      }
      if (this.group.hasMember(character.getCharacterId()))
      {
         this.service.broadcastGroupMembersAdded(this.group, this.group.getMembers(), interest, responseQueue);
      }
   };

   /** {@inheritDoc} */
   this.processBroadcast = function(characterId, header, body)
   {
      var handler = this.service['process' + header.type];

      handler.call(this.service, this.group, characterId, body);
   };

};
util.inherits(ActiveGroupDataProcessingState, GroupDataProcessingState);

module.exports = ActiveGroupDataProcessingState;
