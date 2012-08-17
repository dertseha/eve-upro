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

   this.givenRoutingCapabilityJumpDrive = function(capability)
   {
      this.serviceData.rawData.routingCapabilities.jumpDrive = capability;
   };

   this.whenProcessingCharacterSetRoutingCapabilityJumpDrive = function(inUse, range)
   {
      var header = {};
      var body =
      {
         inUse: inUse,
         range: range
      };

      return this.serviceData.processClientRequestSetRoutingCapabilityJumpDrive(header, body);
   };

   this.thenRoutingCapabilityJumpDriveShouldBe = function(test, expected)
   {
      test.deepEqual(this.serviceData.rawData.routingCapabilities.jumpDrive, expected);
   };

   this.thenProcessCharacterSetRoutingCapabilityJumpDriveShouldReturn = function(test, inUse, range, expectedResult)
   {
      var result = this.whenProcessingCharacterSetRoutingCapabilityJumpDrive(inUse, range);

      test.deepEqual(result, expectedResult);
   };

   this.givenEmptyRoutingRules = function()
   {
      this.serviceData.rawData.routingRules = {};
   };

   this.givenRoutingRule = function(name, rule)
   {
      this.serviceData.rawData.routingRules[name] = rule;
   };

   this.whenProcessingClientRequestSetRoutingRuleData = function(name, inUse, parameter)
   {
      var header = {};
      var body =
      {
         name: name,
         inUse: inUse,
         parameter: parameter
      };

      return this.serviceData.processClientRequestSetRoutingRuleData(header, body);
   };

   this.whenProcessingClientRequestSetRoutingRuleIndex = function(name, index)
   {
      var header = {};
      var body =
      {
         name: name,
         index: index
      };

      return this.serviceData.processClientRequestSetRoutingRuleIndex(header, body);
   };

   this.thenRoutingRuleShouldBe = function(test, name, expected)
   {
      test.deepEqual(this.serviceData.rawData.routingRules[name], expected);
   };

   this.thenRoutingRuleIndexShouldBe = function(test, name, expected)
   {
      test.equal(this.serviceData.rawData.routingRules[name].index, expected);
   };

   this.thenProcessClientRequestSetRoutingRuleDataShouldReturn = function(test, name, inUse, parameter, expectedResult)
   {
      var result = this.whenProcessingClientRequestSetRoutingRuleData(name, inUse, parameter);

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
      inUse: true
   });

   this.fixture.thenProcessCharacterSetRoutingCapabilityJumpGatesShouldReturn(test, false,
         [ 'CharacterRoutingCapabilities' ]);

   test.done();
};

exports.testRoutingCapabilityJumpDriveChanged_WhenAppliedFromData = function(test)
{
   var newValue =
   {
      inUse: false,
      range: 10.0
   };

   this.fixture.givenRoutingCapabilityJumpDrive(
   {
      inUse: true,
      range: 5.0
   });

   this.fixture.whenCharacterDataWasApplied(
   {
      routingCapabilities:
      {
         jumpDrive: newValue
      }
   });

   this.fixture.thenRoutingCapabilityJumpDriveShouldBe(test, newValue);

   test.done();
};

exports.testRoutingCapabilityJumpDriveChanged_WhenProcessedDifferent = function(test)
{
   var newValue =
   {
      inUse: false,
      range: 7.0
   };

   this.fixture.givenRoutingCapabilityJumpDrive(
   {
      inUse: true,
      range: 3.0
   });

   this.fixture.whenProcessingCharacterSetRoutingCapabilityJumpDrive(newValue.inUse, newValue.range);

   this.fixture.thenRoutingCapabilityJumpDriveShouldBe(test, newValue);

   test.done();
};

exports.testRoutingCapabilityJumpDriveStaysVald_WhenValuesSkipped = function(test)
{
   var newValue =
   {
      inUse: false,
      range: 3.0
   };

   this.fixture.givenRoutingCapabilityJumpDrive(
   {
      inUse: true,
      range: 3.0
   });

   this.fixture.whenProcessingCharacterSetRoutingCapabilityJumpDrive(newValue.inUse, null);

   this.fixture.thenRoutingCapabilityJumpDriveShouldBe(test, newValue);

   test.done();
};

exports.testProcessSetRoutingCapabilityJumpDriveShouldReturnEmptyArray_WhenUnchanged = function(test)
{
   var value =
   {
      inUse: true,
      range: 3.0
   };

   this.fixture.givenRoutingCapabilityJumpDrive(value);

   this.fixture.thenProcessCharacterSetRoutingCapabilityJumpDriveShouldReturn(test, value.inUse, value.range, []);

   test.done();
};

exports.testProcessSetRoutingCapabilityJumpDriveShouldReturnNotifier_WhenChanged = function(test)
{
   this.fixture.givenRoutingCapabilityJumpDrive(
   {
      inUse: false,
      range: 11.0
   });

   this.fixture.thenProcessCharacterSetRoutingCapabilityJumpDriveShouldReturn(test, true, 11.0,
         [ 'CharacterRoutingCapabilities' ]);

   test.done();
};

exports.testRoutingRuleChanged_WhenAppliedFromData = function(test)
{
   var newValue =
   {
      index: 3,
      inUse: false,
      parameter: 3
   };

   this.fixture.givenRoutingRule('minSecurity',
   {
      index: 0,
      inUse: true,
      parameter: 5
   });

   this.fixture.whenCharacterDataWasApplied(
   {
      routingRules:
      {
         minSecurity: newValue
      }
   });

   this.fixture.thenRoutingRuleShouldBe(test, 'minSecurity', newValue);

   test.done();
};

exports.testRoutingRuleChanged_WhenProcessedDifferent = function(test)
{
   var newValue =
   {
      index: 1,
      inUse: false,
      parameter: 3
   };

   this.fixture.givenRoutingRule('jumpFuel',
   {
      index: 1,
      inUse: true,
      parameter: 4
   });

   this.fixture.whenProcessingClientRequestSetRoutingRuleData('jumpFuel', newValue.inUse, newValue.parameter);

   this.fixture.thenRoutingRuleShouldBe(test, 'jumpFuel', newValue);

   test.done();
};

exports.testProcessSetRoutingRuleShouldReturnEmptyArray_WhenUnchanged = function(test)
{
   var value =
   {
      index: 1,
      inUse: true,
      parameter: 4
   };

   this.fixture.givenRoutingRule('jumps', value);

   this.fixture.thenProcessClientRequestSetRoutingRuleDataShouldReturn(test, 'jumps', value.inUse, value.parameter, []);

   test.done();
};

exports.testProcessSetRoutingRuleShouldReturnNotifier_WhenChanged = function(test)
{
   var value =
   {
      index: 1,
      inUse: true,
      parameter: 4
   };

   this.fixture.givenRoutingRule('maxSecurity', value);

   this.fixture.thenProcessClientRequestSetRoutingRuleDataShouldReturn(test, 'maxSecurity', false, value.parameter,
         [ 'CharacterRoutingRules' ]);

   test.done();
};

exports.testRoutingRuleChanged_WhenIndexChanged = function(test)
{
   var newValue = 1;

   this.fixture.givenEmptyRoutingRules();
   this.fixture.givenRoutingRule('jumpFuel',
   {
      index: 0,
      inUse: true,
      parameter: 4
   });
   this.fixture.givenRoutingRule('minSecurity',
   {
      index: 1,
      inUse: true,
      parameter: 4
   });

   this.fixture.whenProcessingClientRequestSetRoutingRuleIndex('jumpFuel', newValue);

   this.fixture.thenRoutingRuleIndexShouldBe(test, 'jumpFuel', newValue);
   this.fixture.thenRoutingRuleIndexShouldBe(test, 'minSecurity', 0);

   test.done();
};
