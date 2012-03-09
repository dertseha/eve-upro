SolarSystemTest = TestCase("SolarSystemTest");

SolarSystemTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new upro.nav.Universe();
   Fixture.galaxy = upro.nav.Galaxy.create(0, "TestGalaxy", 0, 0, 0);
   Fixture.universe.galaxies.add(Fixture.galaxy);
};

SolarSystemTest.prototype.givenASolarSystem = function(id, name, x, y, z, security, regionId, constellationId)
{
   Fixture.system = upro.nav.SolarSystem.create(id, name, x, y, z, security, regionId, constellationId);
   Fixture.galaxy.solarSystems.add(Fixture.system);
};

SolarSystemTest.prototype.thenToStringShouldReturn = function(value)
{
   var result = Fixture.system.toString();

   assertEquals(value, result);
};

SolarSystemTest.prototype.testCreateSolarSystem = function()
{
   this.givenASolarSystem(1, "Test", 10, 20, 30, 1.0, 10, 20);

   this.thenToStringShouldReturn('SolarSystem [Test]');
};
