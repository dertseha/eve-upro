var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var UuidFactory = require('../util/UuidFactory.js');
var busMessages = require('../model/BusMessages.js');

var AbstractSharingComponent = require('../abstract-sharing-component/AbstractSharingComponent.js');

var ActiveDataState = require('../abstract-sharing-component/ActiveDataState.js');

var JumpCorridorDataObject = require('./JumpCorridorDataObject.js');

function JumpCorridorServiceComponent(services)
{
   JumpCorridorServiceComponent.super_.call(this, services, JumpCorridorDataObject, 'JumpCorridor');

   this.amqp = services['amqp'];

   var superStart = this.start;

   /** {@inheritDoc} */
   this.start = function()
   {
      superStart.call(this);

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestCreateJumpCorridor.name);

      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestUpdateJumpCorridor.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestDestroyJumpCorridor.name);
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestCreateJumpCorridor = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character)
      {
         var id = UuidFactory.v4();
         var initData =
         {
            jumpCorridor: body.data
         };
         var state = new ActiveDataState(this, new JumpCorridorDataObject(id, initData));
         var interest =
         {
            scope: 'Character',
            id: character.getCharacterId()
         };

         logger.info('Character ' + character.toString() + ' creating jump corridor');
         state.activate();
         state.addOwner(interest);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestUpdateJumpCorridor = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character) && dataObject.updateData(body.data))
      {
         dataObject.saveToStorage(this.getStorage());
         this.getBroadcaster().broadcastDataInfo(dataObject, dataObject.getDataInterest());
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestDestroyJumpCorridor = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.destroy();
      }
   };
}
util.inherits(JumpCorridorServiceComponent, AbstractSharingComponent);

module.exports = JumpCorridorServiceComponent;
