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

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestSetJumpCorridor.name);
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestSetJumpCorridor = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character)
      {
         var characterId = character.getCharacterId();

         if (body.data.id)
         {
            var state = this.ensureDataState(body.data.id);
            var message =
            {
               characterId: characterId,
               header: header,
               body: body
            };

            state.onBroadcast(message);
         }
         else
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
               id: characterId
            };

            logger.info('Character ' + character.toString() + ' creating jump corridor');
            state.activate();
            state.addOwner(interest);
         }
      }
   };

   this.processClientRequestSetJumpCorridor = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character && this.dataObject.isCharacterOwner(character) && dataObject.updateData(body.data))
      {
         dataObject.saveToStorage(this.getStorage());
         this.getBroadcaster().broadcastDataInfo(dataObject, dataObject.getDataInterest());
      }
   };
}
util.inherits(JumpCorridorServiceComponent, AbstractSharingComponent);

module.exports = JumpCorridorServiceComponent;
