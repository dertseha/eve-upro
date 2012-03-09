JumpCorridorTest = TestCase("JumpCorridorTest");

JumpCorridorTest.prototype.givenAGalaxy = function(id, name, x, y, z)
{
   Fixture.galaxy = upro.nav.Galaxy.create(id, name, x, y, z);

   Fixture.universe.galaxies.add(Fixture.galaxy);
};

JumpCorridorTest.prototype.whenAddingATestSolarSystem = function(id, regionId, constellationId)
{
   var system = upro.nav.SolarSystem.create(id, "TestSystem" + id, 0, 0, 0, 0.0, regionId, constellationId);

   Fixture.galaxy.solarSystems.add(system);
};

JumpCorridorTest.prototype.whenAddingAJumpCorridor = function(galaxyId1, systemId1, galaxyId2, systemId2)
{
   var galaxy1 = Fixture.universe.galaxies.get(galaxyId1);
   var galaxy2 = Fixture.universe.galaxies.get(galaxyId2);

   Fixture.jumpCorridor = new upro.nav.JumpCorridor(galaxy1, systemId1, galaxy2, systemId2);
};

JumpCorridorTest.prototype.whenRemovingTheJumpCorridor = function()
{
   Fixture.jumpCorridor.dispose();
   Fixture.jumpCorridor = undefined;
};

JumpCorridorTest.prototype.thenToStringShouldReturn = function(value)
{
   var result = Fixture.jumpCorridor.toString();

   assertEquals(value, result);
};

JumpCorridorTest.prototype.thenSystemShouldHaveAJumpTo = function(systemId1, systemId2)
{
   var system1 = Fixture.galaxy.solarSystems.get(systemId1);

   assertSame(systemId2, system1.jumpPortals.get(systemId2).id);
};

JumpCorridorTest.prototype.thenSystemShouldHaveNoJumpTo = function(systemId1, systemId2)
{
   var system1 = Fixture.galaxy.solarSystems.get(systemId1);

   assertUndefined(system1.jumpPortals.get(systemId2));
};

JumpCorridorTest.prototype.thenNothingShouldWaitForSystem = function(systemId)
{
   assertUndefined(Fixture.galaxy.solarSystems.waiters[systemId]);
};

JumpCorridorTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new upro.nav.Universe();
};

JumpCorridorTest.prototype.testCreateJumpCorridor = function()
{
   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingAJumpCorridor(1, 10, 1, 20);

   this.thenToStringShouldReturn('JumpCorridor [1.10-1.20]');
};

JumpCorridorTest.prototype.testOrderedIdByGalaxy = function()
{
   this.givenAGalaxy(1, "Test", 10, 20, 30);
   this.givenAGalaxy(2, "Test", 10, 20, 30);

   this.whenAddingAJumpCorridor(2, 20, 1, 10);

   this.thenToStringShouldReturn('JumpCorridor [1.10-2.20]');
};

JumpCorridorTest.prototype.testOrderedIdBySystem = function()
{
   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingAJumpCorridor(1, 20, 1, 10);

   this.thenToStringShouldReturn('JumpCorridor [1.10-1.20]');
};

JumpCorridorTest.prototype.testSolarSystemJumpAfterSystems = function()
{
   var systemId1 = 10;
   var systemId2 = 20;

   this.givenAGalaxy(1, "test", 10, 20, 30);

   this.whenAddingATestSolarSystem(systemId1);
   this.whenAddingATestSolarSystem(systemId2);
   this.whenAddingAJumpCorridor(1, systemId1, 1, systemId2);

   this.thenSystemShouldHaveAJumpTo(systemId1, systemId2);
   this.thenSystemShouldHaveAJumpTo(systemId2, systemId1);
};

JumpCorridorTest.prototype.testSolarSystemJumpBeforeSystems = function()
{
   var systemId1 = 10;
   var systemId2 = 20;

   this.givenAGalaxy(1, "test", 10, 20, 30);

   this.whenAddingAJumpCorridor(1, systemId1, 1, systemId2);
   this.whenAddingATestSolarSystem(systemId1);
   this.whenAddingATestSolarSystem(systemId2);

   this.thenSystemShouldHaveAJumpTo(systemId1, systemId2);
   this.thenSystemShouldHaveAJumpTo(systemId2, systemId1);
};

JumpCorridorTest.prototype.testSolarSystemJumpBetweenSystems = function()
{
   var systemId1 = 10;
   var systemId2 = 20;

   this.givenAGalaxy(1, "test", 10, 20, 30);

   this.whenAddingATestSolarSystem(systemId1);
   this.whenAddingAJumpCorridor(1, systemId1, 1, systemId2);
   this.whenAddingATestSolarSystem(systemId2);

   this.thenSystemShouldHaveAJumpTo(systemId1, systemId2);
   this.thenSystemShouldHaveAJumpTo(systemId2, systemId1);
};

JumpCorridorTest.prototype.testRemovedSolarSystemJumpNormal = function()
{
   var systemId1 = 10;
   var systemId2 = 20;

   this.givenAGalaxy(1, "test", 10, 20, 30);

   this.whenAddingATestSolarSystem(systemId1);
   this.whenAddingATestSolarSystem(systemId2);
   this.whenAddingAJumpCorridor(1, systemId1, 1, systemId2);
   this.whenRemovingTheJumpCorridor();

   this.thenSystemShouldHaveNoJumpTo(systemId1, systemId2);
   this.thenSystemShouldHaveNoJumpTo(systemId2, systemId1);
};

JumpCorridorTest.prototype.testRemovedSolarSystemJumpBeforeSystem = function()
{
   var systemId1 = 10;
   var systemId2 = 20;

   this.givenAGalaxy(1, "test", 10, 20, 30);

   this.whenAddingAJumpCorridor(1, systemId1, 1, systemId2);
   this.whenRemovingTheJumpCorridor();

   this.thenNothingShouldWaitForSystem(systemId1);
   this.thenNothingShouldWaitForSystem(systemId2);
};
