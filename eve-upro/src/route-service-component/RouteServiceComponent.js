var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var UuidFactory = require('../util/UuidFactory.js');
var busMessages = require('../model/BusMessages.js');

var AbstractSharingComponent = require('../abstract-sharing-component/AbstractSharingComponent.js');

var ActiveDataState = require('../abstract-sharing-component/ActiveDataState.js');

var RouteDataObject = require('./RouteDataObject.js');

function RouteServiceComponent(services)
{
   RouteServiceComponent.super_.call(this, services, RouteDataObject, 'Route');

   this.amqp = services['amqp'];

   var superStart = this.start;

   /** {@inheritDoc} */
   this.start = function()
   {
      superStart.call(this);

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestCreateRoute.name);

      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestUpdateRoute.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestDestroyRoute.name);

      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestAddRouteOwner.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestRemoveRouteOwner.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestAddRouteShares.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestRemoveRouteShares.name);
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestCreateRoute = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character)
      {
         var id = UuidFactory.v4();
         var initData =
         {
            route: body.data
         };
         var state = new ActiveDataState(this, new RouteDataObject(id, initData));
         var interest = [
         {
            scope: 'Character',
            id: character.getCharacterId()
         } ];

         logger.info('Character ' + character.toString() + ' creating route');
         state.activate();
         state.addOwner(interest);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestUpdateRoute = function(dataObject, characterId, body)
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
   this.processClientRequestDestroyRoute = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.destroy();
      }
   };

   this.processClientRequestAddRouteOwner = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];
         var interest = this.filterInterestByCharacter(body.interest, character);

         state.addOwner(interest);
      }
   };

   this.processClientRequestRemoveRouteOwner = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.removeOwner(body.interest);
      }
   };

   this.processClientRequestAddRouteShares = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];
         var interest = this.filterInterestByCharacter(body.interest, character);

         state.addShares(interest);
      }
   };

   this.processClientRequestRemoveRouteShares = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.removeShares(body.interest);
      }
   };
}
util.inherits(RouteServiceComponent, AbstractSharingComponent);

module.exports = RouteServiceComponent;
