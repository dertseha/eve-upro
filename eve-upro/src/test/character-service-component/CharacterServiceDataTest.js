var Character = require('../../character-agent-component/Character.js');
var CharacterServiceData = require('../../character-service-component/CharacterServiceData.js');

function Fixture()
{
   this.character = new Character();
   this.serviceData = new CharacterServiceData(this, this.character);

   this.whenCharacterDataWasApplied = function(data)
   {
      this.serviceData.applyCharacterData(data);
   };

   this.givenActiveGalaxyId = function(galaxyId)
   {
      this.serviceData.rawData.activeGalaxyId = galaxyId;
   };

   this.whenProcessingCharacterSetActiveGalaxy = function(galaxyId)
   {
      var header = {};
      var body =
      {
         galaxyId: galaxyId
      };

      return this.serviceData.processClientRequestSetActiveGalaxy(header, body);
   };

   this.thenActiveGalaxyShouldBe = function(test, expected)
   {
      test.equal(this.serviceData.rawData.activeGalaxyId, expected);
   };

   this.thenProcessCharacterSetActiveGalaxyShouldReturn = function(test, galaxyId, expectedResult)
   {
      var result = this.whenProcessingCharacterSetActiveGalaxy(galaxyId);

      test.deepEqual(result, expectedResult);
   };

   this.givenIgnoredSolarSystems = function(ignoredSolarSystems)
   {
      this.serviceData.rawData.ignoredSolarSystems = ignoredSolarSystems;
   };

   this.whenProcessingCharacterSetIgnoredSolarSystem = function(solarSystemId, ignore)
   {
      var header = {};
      var body =
      {
         solarSystemId: solarSystemId,
         ignore: ignore
      };

      return this.serviceData.processClientRequestSetIgnoredSolarSystem(header, body);
   };

   this.thenIgnoredSolarSystemsShouldBe = function(test, expected)
   {
      test.deepEqual(this.serviceData.rawData.ignoredSolarSystems, expected);
   };

   this.thenProcessCharacterSetIgnoredSolarSystemShouldReturn = function(test, solarSystem, ignore, expectedResult)
   {
      var result = this.whenProcessingCharacterSetIgnoredSolarSystem(solarSystem, ignore);

      test.deepEqual(result, expectedResult);
   };

   this.givenRoutingCapabilityJumpGates = function(capability)
   {
      this.serviceData.rawData.routingCapabilities.jumpGates = capability;
   };

   this.whenProcessingCharacterSetRoutingCapabilityJumpGates = function(inUse)
   {
      var header = {};
      var body =
      {
         inUse: inUse
      };

      return this.serviceData.processClientRequestSetRoutingCapabilityJumpGates(header, body);
   };

   this.thenRoutingCapabilityJumpGatesShouldBe = function(test, expected)
   {
      test.deepEqual(this.serviceData.rawData.routingCapabilities.jumpGates, expected);
   };

   this.thenProcessCharacterSetRoutingCapabilityJumpGatesShouldReturn = function(test, inUse, expectedResult)
   {
      var result = this.whenProcessingCharacterSetRoutingCapabilityJumpGates(inUse);

      test.deepEqual(result, expectedResult);
   };
}

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   callback();
};

exports.testActiveGalaxyChanged_WhenAppliedFromData = function(test)
{
   var newValue = 20;

   this.fixture.givenActiveGalaxyId(7);

   this.fixture.whenCharacterDataWasApplied(
   {
      activeGalaxyId: newValue
   });

   this.fixture.thenActiveGalaxyShouldBe(test, newValue);

   test.done();
};

exports.testActiveGalaxyChanged_WhenProcessedDifferent = function(test)
{
   var newValue = 11;

   this.fixture.givenActiveGalaxyId(5);

   this.fixture.whenProcessingCharacterSetActiveGalaxy(newValue);

   this.fixture.thenActiveGalaxyShouldBe(test, newValue);

   test.done();
};

exports.testProcessSetActiveGalaxyShouldReturnEmptyArray_WhenUnchanged = function(test)
{
   this.fixture.givenActiveGalaxyId(10);

   this.fixture.thenProcessCharacterSetActiveGalaxyShouldReturn(test, 10, []);

   test.done();
};

exports.testProcessSetActiveGalaxyShouldReturnNotifier_WhenChanged = function(test)
{
   this.fixture.givenActiveGalaxyId(20);

   this.fixture.thenProcessCharacterSetActiveGalaxyShouldReturn(test, 15, [ 'CharacterActiveGalaxy' ]);

   test.done();
};

exports.testIgnoredSolarSystemsChanged_WhenAppliedFromData = function(test)
{
   var newValue = [ 10, 20, 30 ];

   this.fixture.givenIgnoredSolarSystems([]);

   this.fixture.whenCharacterDataWasApplied(
   {
      ignoredSolarSystems: newValue
   });

   this.fixture.thenIgnoredSolarSystemsShouldBe(test, newValue);

   test.done();
};

exports.testIgnoredSolarSystemsChanged_WhenANewOneGettingIgnored = function(test)
{
   this.fixture.givenIgnoredSolarSystems([]);

   this.fixture.whenProcessingCharacterSetIgnoredSolarSystem(100, true);

   this.fixture.thenIgnoredSolarSystemsShouldBe(test, [ 100 ]);

   test.done();
};

exports.testIgnoredSolarSystemsChanged_WhenAnIgnoredOneGettingAllowed = function(test)
{
   this.fixture.givenIgnoredSolarSystems([ 100, 110 ]);

   this.fixture.whenProcessingCharacterSetIgnoredSolarSystem(100, false);

   this.fixture.thenIgnoredSolarSystemsShouldBe(test, [ 110 ]);

   test.done();
};

exports.testProcessSetIgnoredSolarSystemShouldReturnEmptyArray_WhenUnchanged = function(test)
{
   this.fixture.givenIgnoredSolarSystems([ 100, 110 ]);

   this.fixture.thenProcessCharacterSetIgnoredSolarSystemShouldReturn(test, 110, true, []);

   test.done();
};

exports.testProcessSetIgnoredSolarSystemShouldReturnNotifier_WhenChanged = function(test)
{
   this.fixture.givenIgnoredSolarSystems([ 100, 110 ]);

   this.fixture.thenProcessCharacterSetIgnoredSolarSystemShouldReturn(test, 210, true,
         [ 'CharacterIgnoredSolarSystems' ]);

   test.done();
};

exports.testRoutingCapabilityJumpGatesChanged_WhenAppliedFromData = function(test)
{
   var newValue =
   {
      inUse: false
   };

   this.fixture.givenRoutingCapabilityJumpGates(
   {
      inUse: true
   });

   this.fixture.whenCharacterDataWasApplied(
   {
      routingCapabilities:
      {
         jumpGates: newValue
      }
   });

   this.fixture.thenRoutingCapabilityJumpGatesShouldBe(test, newValue);

   test.done();
};

exports.testRoutingCapabilityJumpGatesChanged_WhenProcessedDifferent = function(test)
{
   var newValue =
   {
      inUse: false
   };

   this.fixture.givenRoutingCapabilityJumpGates(
   {
      inUse: true
   });

   this.fixture.whenProcessingCharacterSetRoutingCapabilityJumpGates(false);

   this.fixture.thenRoutingCapabilityJumpGatesShouldBe(test, newValue);

   test.done();
};

exports.testProcessSetRoutingCapabilityJumpGatesShouldReturnEmptyArray_WhenUnchanged = function(test)
{
   var value =
   {
      inUse: true
   };

   this.fixture.givenRoutingCapabilityJumpGates(value);

   this.fixture.thenProcessCharacterSetRoutingCapabilityJumpGatesShouldReturn(test, value.inUse, []);

   test.done();
};

exports.testProcessSetRoutingCapabilityJumpGatesShouldReturnNotifier_WhenChanged = function(test)
{
   this.fixture.givenRoutingCapabilityJumpGates(
   {
      inUse: false
   });

   this.fixture.thenProcessCharacterSetRoutingCapabilityJumpGatesShouldReturn(test,
   {
      inUse: true
   }, [ 'CharacterRoutingCapabilities' ]);

   test.done();
};
