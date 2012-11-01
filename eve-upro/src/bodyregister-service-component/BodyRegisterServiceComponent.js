var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var busMessages = require('../model/BusMessages.js');

var Component = require('../components/Component.js');

function BodyRegisterServiceComponent(services)
{
   BodyRegisterServiceComponent.super_.call(this);

   this.msgBus = services['msgBus'];
   this.mongodb = services['mongodb'];

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientConnected.name);
      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestFindBodiesByName.name);
      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestGetNameOfBody.name);

      BodyRegisterServiceComponent.SupportedBodies.forEach(function(bodyName)
      {
         self['collectionCreated' + bodyName] = false;
         self.mongodb.defineCollection(BodyRegisterServiceComponent['CollectionName' + bodyName], [], function()
         {
            self['collectionCreated' + bodyName] = true;
            self.onStartProgress();
         });
      });
   };

   this.registerBroadcastHandler = function(broadcastName)
   {
      var self = this;
      var handler = this['onBroadcast' + broadcastName];

      this.msgBus.on('broadcast:' + broadcastName, function(header, body)
      {
         handler.call(self, header, body);
      });
   };

   this.onStartProgress = function()
   {
      var done = true;
      var self = this;

      BodyRegisterServiceComponent.SupportedBodies.forEach(function(bodyName)
      {
         if (!self['collectionCreated' + bodyName])
         {
            done = false;
         }
      });
      if (done)
      {
         this.onStarted();
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientConnected = function(header, body)
   {
      var characterData =
      {
         name: body.user.characterName
      };
      var corporationData =
      {
         name: body.user.corporationName
      };
      var allianceData =
      {
         name: body.user.allianceName
      };

      this.mongodb.setData(BodyRegisterServiceComponent.CollectionNameCharacter, body.user.characterId, characterData,
            function()
            {
            });
      this.mongodb.setData(BodyRegisterServiceComponent.CollectionNameCorporation, body.user.corporationId,
            corporationData, function()
            {
            });
      if (body.user.allianceId)
      {
         this.mongodb.setData(BodyRegisterServiceComponent.CollectionNameAlliance, body.user.allianceId, allianceData,
               function()
               {
               });
      }
   };

   this.bodyResultHandler = function(id, data, destArray, finishCallback)
   {
      if (data)
      {
         var body =
         {
            id: id,
            name: data.name
         };

         destArray.push(body);
      }
      else
      {
         finishCallback();
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestFindBodiesByName = function(header, body)
   {
      var self = this;
      var filter =
      {
         'data.name': new RegExp(body.searchText, 'i')
      };
      var options =
      {
         limit: 50
      };
      var result = {};
      var results = 0;

      var searchCompleted = function()
      {
         results++;
         if (results == BodyRegisterServiceComponent.SupportedBodies.length)
         {
            self.broadcastFindBodiesByNameResult(body.searchText, result, header.sessionId);
         }
      };

      BodyRegisterServiceComponent.SupportedBodies.forEach(function(bodyName)
      {
         result['list' + bodyName] = [];
         self.mongodb.getData(BodyRegisterServiceComponent['CollectionName' + bodyName], filter,
               function(err, id, data)
               {
                  self.bodyResultHandler(id, data, result['list' + bodyName], searchCompleted);
               }, null, options);
      });
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestGetNameOfBody = function(header, body)
   {
      var self = this;
      var filter = {};
      var result = {};
      var results = 0;

      filter['Character'] =
      {
         _id:
         {
            '$in': body.characters
         }
      };
      filter['Corporation'] =
      {
         _id:
         {
            '$in': body.corporations
         }
      };
      filter['Alliance'] =
      {
         _id:
         {
            '$in': body.alliances
         }
      };

      var searchCompleted = function()
      {
         results++;
         if (results == BodyRegisterServiceComponent.SupportedBodies.length)
         {
            self.broadcastGetNameOfBodyReply(result, header.sessionId);
         }
      };

      BodyRegisterServiceComponent.SupportedBodies.forEach(function(bodyName)
      {
         result['list' + bodyName] = [];
         self.mongodb.getData(BodyRegisterServiceComponent['CollectionName' + bodyName], filter[bodyName], function(
               err, id, data)
         {
            self.bodyResultHandler(id, data, result['list' + bodyName], searchCompleted);
         });
      });
   };

   /**
    * Broadcasts a find body result
    */
   this.broadcastFindBodiesByNameResult = function(searchText, result, sessionId)
   {
      var header =
      {
         type: busMessages.Broadcasts.FindBodyResult.name,
         interest: [
         {
            scope: 'Session',
            id: sessionId
         } ]
      };
      var body =
      {
         query:
         {
            searchText: searchText
         },
         characters: result.listCharacter,
         corporations: result.listCorporation,
         alliances: result.listAlliance
      };

      this.msgBus.broadcast(header, body);
   };

   /**
    * Broadcasts a find body result
    */
   this.broadcastGetNameOfBodyReply = function(result, sessionId)
   {
      var header =
      {
         type: busMessages.Broadcasts.GetNameOfBodyReply.name,
         interest: [
         {
            scope: 'Session',
            id: sessionId
         } ]
      };
      var body =
      {
         characters: result.listCharacter,
         corporations: result.listCorporation,
         alliances: result.listAlliance
      };

      this.msgBus.broadcast(header, body);
   };
}
util.inherits(BodyRegisterServiceComponent, Component);

BodyRegisterServiceComponent.SupportedBodies = [ 'Character', 'Corporation', 'Alliance' ];
BodyRegisterServiceComponent.SupportedBodies.forEach(function(bodyName)
{
   BodyRegisterServiceComponent['CollectionName' + bodyName] = 'BodyRegister' + bodyName;
});

module.exports = BodyRegisterServiceComponent;
