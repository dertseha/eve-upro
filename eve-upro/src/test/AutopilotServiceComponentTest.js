var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../util/UuidFactory.js");
var busMessages = require('../model/BusMessages.js');
var CharacterAgentComponent = require('../character-agent-component/CharacterAgentComponent.js');
var AutopilotServiceComponent = require('../autopilot-service-component/AutopilotServiceComponent.js');

var AbstractServiceComponentFixture = require('./TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

   this.autopilotService = new AutopilotServiceComponent(
   {
      amqp: this.amqp,
      mongodb: this.mongodb,
      'character-agent': this.characterAgent
   });

   this.initCharacterServiceData = function(character)
   {
      this.autopilotService.onCharacterOnline(character);
   };

   this.givenCharacterHasAutopilotRoute = function(charId, route)
   {
      var character = this.characterAgent.getCharacterById(charId);
      var serviceData = character.serviceData['autopilot-service'];

      serviceData.rawData.route = route;
      serviceData.rawData.nextRouteIndex = 0;
   };

   this.givenCharacterIsAtIndex = function(charId, index)
   {
      var character = this.characterAgent.getCharacterById(charId);
      var serviceData = character.serviceData['autopilot-service'];

      serviceData.rawData.nextRouteIndex = index + 1;
   };

   this.givenCharacterIsAtLocation = function(charId, solarSystemId)
   {
      var character = this.characterAgent.getCharacterById(charId);
      var serviceData = character.serviceData['autopilot-service'];

      serviceData.currentLocation = solarSystemId;
   };

   this.expectingCharacterAutopilotRoute = function(test, charId, route, interest)
   {
      this.amqp.on('broadcast:' + busMessages.Broadcasts.CharacterAutopilotRoute, function(header, body)
      {
         test.deepEqual(body.route, route);
         if (interest)
         {
            test.deepEqual(header.interest, interest);
         }
      });
   };

   this.expectingCharacterAutopilotRouteIndex = function(test, charId, nextRouteIndex, interest)
   {
      this.amqp.on('broadcast:' + busMessages.Broadcasts.CharacterAutopilotRouteIndex, function(header, body)
      {
         test.equal(body.nextRouteIndex, nextRouteIndex);
         if (interest)
         {
            test.deepEqual(header.interest, interest);
         }
      });
   };

   this.whenBroadcastCharacterLocationReceived = function(charId, solarSystemId)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.CharacterLocationStatus, null,
      {
         solarSystemId: solarSystemId
      },
      {
         characterId: charId
      });
   };
}
util.inherits(Fixture, AbstractServiceComponentFixture);

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   this.fixture.characterAgent.once('started', function()
   {
      fixture.autopilotService.once('started', callback);
      fixture.autopilotService.start();
   });
   this.fixture.characterAgent.start();
};

exports.testCharacterAutopilotRouteEmitted_WhenAutopilotRouteRequested = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var route = [ this.fixture.autopilotService.createRouteEntry('Checkpoint', 2, null) ];

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.expectingCharacterAutopilotRoute(test, charId, route);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetAutopilotRoute, sessionId,
   {
      route: route
   });

   test.expect(1);
   test.done();
};

exports.testCharacterAutopilotRouteIndexResetEmitted_WhenAutopilotRouteRequested = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var route = [ this.fixture.autopilotService.createRouteEntry('Checkpoint', 2, null) ];

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasAutopilotRoute(charId, [ this.fixture.autopilotService.createRouteEntry('Checkpoint',
         4, 2, null) ]);

   this.fixture.expectingCharacterAutopilotRouteIndex(test, charId, 0);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetAutopilotRoute, sessionId,
   {
      route: route
   });

   test.expect(1);
   test.done();
};

exports.testCharacterAutopilotRouteEmitted_WhenSessionEstablished = function(test)
{
   var charId = 1234;
   var sessionIdExisting = UuidFactory.v4();
   var sessionId = UuidFactory.v4();
   var route = [ this.fixture.autopilotService.createRouteEntry('Checkpoint', 2, null) ];

   this.fixture.givenExistingCharacterSession(charId, sessionIdExisting);
   this.fixture.givenCharacterHasAutopilotRoute(charId, route);

   this.fixture.expectingCharacterAutopilotRoute(test, charId, route, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   this.fixture.whenClientConnected(charId, sessionId);

   test.expect(2);
   test.done();
};

exports.testCharacterAutopilotRouteIndexEmitted_WhenLocationIsBroadcast = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasAutopilotRoute(charId, [
         this.fixture.autopilotService.createRouteEntry('Checkpoint', 2, null),
         this.fixture.autopilotService.createRouteEntry('Waypoint', 3, null) ]);

   this.fixture.expectingCharacterAutopilotRouteIndex(test, charId, 1);

   this.fixture.whenBroadcastCharacterLocationReceived(charId, 2);

   test.expect(1);
   test.done();
};

exports.testCharacterAutopilotRouteIndexResetEmitted_WhenDestinationReached = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasAutopilotRoute(charId, [
         this.fixture.autopilotService.createRouteEntry('Checkpoint', 2, null),
         this.fixture.autopilotService.createRouteEntry('Waypoint', 3, null) ]);
   this.fixture.givenCharacterIsAtIndex(charId, 0);

   this.fixture.expectingCharacterAutopilotRouteIndex(test, charId, -1);

   this.fixture.whenBroadcastCharacterLocationReceived(charId, 3);

   test.expect(1);
   test.done();
};

exports.testCharacterAutopilotRouteIndexNextEmitted_WhenAutopilotRouteRequestedWithStartLocation = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var route = [ this.fixture.autopilotService.createRouteEntry('Checkpoint', 2, null),
         this.fixture.autopilotService.createRouteEntry('Waypoint', 3, null) ];

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsAtLocation(charId, 2);

   this.fixture.expectingCharacterAutopilotRouteIndex(test, charId, 1);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetAutopilotRoute, sessionId,
   {
      route: route
   });

   test.expect(1);
   test.done();
};

exports.testCharacterAutopilotRouteReset_WhenAutopilotRouteRequestedWithSingleEntryAtStartLocation = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var route = [ this.fixture.autopilotService.createRouteEntry('Checkpoint', 2, null) ];

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsAtLocation(charId, 2);

   this.fixture.expectingCharacterAutopilotRouteIndex(test, charId, -1);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetAutopilotRoute, sessionId,
   {
      route: route
   });

   test.expect(1);
   test.done();
};

exports.testCharacterAutopilotRouteReset_WhenDataRestoredWithCurrentLocationAtDestination = function(test)
{
   var emitter = new EventEmitter();
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var route = [ this.fixture.autopilotService.createRouteEntry('Checkpoint', 2, null),
         this.fixture.autopilotService.createRouteEntry('Checkpoint', 3, null) ];

   this.fixture.givenStorageReturnsDataDelayed('AutopilotData', [
   {
      id: charId,
      data:
      {
         nextRouteIndex: 1,
         route: route
      }
   } ], emitter);

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsAtLocation(charId, 3);

   this.fixture.expectingCharacterAutopilotRouteIndex(test, charId, -1);

   emitter.emit('event');

   test.expect(1);
   test.done();
};

exports.testCharacterAutopilotRouteIndexJumps_WhenCurrentLocationSkipsTransitSystems = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasAutopilotRoute(charId, [
         this.fixture.autopilotService.createRouteEntry('Checkpoint', 10, null),
         this.fixture.autopilotService.createRouteEntry('Transit', 12, null),
         this.fixture.autopilotService.createRouteEntry('Transit', 13, null),
         this.fixture.autopilotService.createRouteEntry('Waypoint', 14, null),
         this.fixture.autopilotService.createRouteEntry('Waypoint', 15, null) ]);
   this.fixture.givenCharacterIsAtIndex(charId, 1);
   this.fixture.givenCharacterIsAtLocation(charId, 20);

   this.fixture.expectingCharacterAutopilotRouteIndex(test, charId, 4);

   this.fixture.whenBroadcastCharacterLocationReceived(charId, 14);

   test.expect(1);
   test.done();
};
