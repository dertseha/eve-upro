GalaxyTest = TestCase("GalaxyTest");

GalaxyTest.prototype.givenAGalaxy = function(id, name, x, y, z)
{
   Fixture.galaxy = upro.nav.Galaxy.create(id, name, x, y, z);
   Fixture.universe.galaxies.add(Fixture.galaxy);
};

GalaxyTest.prototype.whenAddingATestSolarSystem = function(id, regionId, constellationId)
{
   var system = upro.nav.SolarSystem.create(id, "TestSystem" + id, 0, 0, 0, 0.0, regionId, constellationId);

   Fixture.galaxy.solarSystems.add(system);
};

GalaxyTest.prototype.whenAddingATestConstellation = function(id, regionId)
{
   var constellation = upro.nav.Constellation.create(id, "TestConstellation", 0, 0, 0, regionId);

   Fixture.galaxy.constellations.add(constellation);
};

GalaxyTest.prototype.whenAddingATestRegion = function(id)
{
   var region = upro.nav.Region.create(id, "TestRegion", 0, 0, 0);

   Fixture.galaxy.regions.add(region);
};

GalaxyTest.prototype.whenAddingAStaticJumpCorridor = function(systemId1, systemId2)
{
   Fixture.galaxy.addStaticJumpCorridor(systemId1, systemId2);
};

GalaxyTest.prototype.thenToStringShouldReturn = function(value)
{
   var result = Fixture.galaxy.toString();

   assertEquals(value, result);
};

GalaxyTest.prototype.thenTheRegionHasGalaxySet = function(id)
{
   var region = Fixture.galaxy.regions.get(id);

   assertSame(Fixture.galaxy, region.galaxy);
};

GalaxyTest.prototype.thenTheSolarSystemHasGalaxySet = function(id)
{
   var system = Fixture.galaxy.solarSystems.get(id);

   assertSame(Fixture.galaxy, system.galaxy);
};

GalaxyTest.prototype.thenTheSolarSystemHasRegionSet = function(id, regionId)
{
   var system = Fixture.galaxy.solarSystems.get(id);

   assertSame(Fixture.galaxy.regions.get(regionId), system.region);
};

GalaxyTest.prototype.thenAllReferencesAreSet = function(regionId, constellationId, solarSystemId)
{
   var system = Fixture.galaxy.solarSystems.get(solarSystemId);
   var constellation = Fixture.galaxy.constellations.get(constellationId);
   var region = Fixture.galaxy.regions.get(regionId);

   // test solar system references
   assertSame(Fixture.galaxy, system.galaxy);
   assertSame(region, system.region);
   assertSame(constellation, system.constellation);
   // test whether solar system is registered in all maps
   // assertSame(system, system);
   assertSame(system, region.solarSystems.get(solarSystemId));
   assertSame(system, constellation.solarSystems.get(solarSystemId));
   // test constellation references
   assertSame(Fixture.galaxy, constellation.galaxy);
   assertSame(region, constellation.region);
   // test whether constellation is registered in all maps
   // assertSame(constellation, constellation);
   assertSame(constellation, region.constellations.get(constellationId));
   // test region references
   assertSame(Fixture.galaxy, region.galaxy);
};

GalaxyTest.prototype.thenSystemShouldHaveAJumpTo = function(systemId1, systemId2)
{
   var system1 = Fixture.galaxy.solarSystems.get(systemId1);
   var found = false;

   system1.jumpPortals.forEachObject(function(jumpPortal)
   {
      if (jumpPortal.system.id == systemId2)
      {
         found = true;
      }
   });

   assertTrue(found);
};

GalaxyTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new upro.nav.Universe();
};

GalaxyTest.prototype.testCreateGalaxy = function()
{
   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.thenToStringShouldReturn('Galaxy [Test]');
};

GalaxyTest.prototype.testAddRegion = function()
{
   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestRegion(10);

   this.thenTheRegionHasGalaxySet(10);
};

GalaxyTest.prototype.testAddSolarSystem = function()
{
   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestSolarSystem(10);

   this.thenTheSolarSystemHasGalaxySet(10);
};

GalaxyTest.prototype.testReferenceLateSolarSystemToRegion = function()
{
   var regionId = 10;
   var systemId = 20;

   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestRegion(regionId);
   this.whenAddingATestSolarSystem(systemId, regionId);

   this.thenTheSolarSystemHasRegionSet(systemId, regionId);
};

GalaxyTest.prototype.testReferenceLateRegionToSolarSystem = function()
{
   var regionId = 10;
   var systemId = 20;

   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestSolarSystem(systemId, regionId);
   this.whenAddingATestRegion(regionId);

   this.thenTheSolarSystemHasRegionSet(systemId, regionId);
};

GalaxyTest.prototype.testAllReferencesRegionConstellationSolarSystem = function()
{
   var regionId = 10;
   var constellationId = 20;
   var systemId = 30;

   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestRegion(regionId);
   this.whenAddingATestConstellation(constellationId, regionId);
   this.whenAddingATestSolarSystem(systemId, regionId, constellationId);

   this.thenAllReferencesAreSet(regionId, constellationId, systemId);
};

GalaxyTest.prototype.testAllReferencesConstellationRegionSolarSystem = function()
{
   var regionId = 10;
   var constellationId = 20;
   var systemId = 30;

   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestConstellation(constellationId, regionId);
   this.whenAddingATestRegion(regionId);
   this.whenAddingATestSolarSystem(systemId, regionId, constellationId);

   this.thenAllReferencesAreSet(regionId, constellationId, systemId);
};

GalaxyTest.prototype.testAllReferencesConstellationSolarSystemRegion = function()
{
   var regionId = 10;
   var constellationId = 20;
   var systemId = 30;

   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestConstellation(constellationId, regionId);
   this.whenAddingATestSolarSystem(systemId, regionId, constellationId);
   this.whenAddingATestRegion(regionId);

   this.thenAllReferencesAreSet(regionId, constellationId, systemId);
};

GalaxyTest.prototype.testAllReferencesSolarSystemConstellationRegion = function()
{
   var regionId = 10;
   var constellationId = 20;
   var systemId = 30;

   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestSolarSystem(systemId, regionId, constellationId);
   this.whenAddingATestConstellation(constellationId, regionId);
   this.whenAddingATestRegion(regionId);

   this.thenAllReferencesAreSet(regionId, constellationId, systemId);
};

GalaxyTest.prototype.testAllReferencesSolarSystemRegionConstellation = function()
{
   var regionId = 10;
   var constellationId = 20;
   var systemId = 30;

   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestSolarSystem(systemId, regionId, constellationId);
   this.whenAddingATestRegion(regionId);
   this.whenAddingATestConstellation(constellationId, regionId);

   this.thenAllReferencesAreSet(regionId, constellationId, systemId);
};

GalaxyTest.prototype.testAllReferencesRegionSolarSystemConstellation = function()
{
   var regionId = 10;
   var constellationId = 20;
   var systemId = 30;

   this.givenAGalaxy(1, "Test", 10, 20, 30);

   this.whenAddingATestRegion(regionId);
   this.whenAddingATestSolarSystem(systemId, regionId, constellationId);
   this.whenAddingATestConstellation(constellationId, regionId);

   this.thenAllReferencesAreSet(regionId, constellationId, systemId);
};

GalaxyTest.prototype.testAddStaticJumpCorridor = function()
{
   var systemId1 = 10;
   var systemId2 = 20;

   this.givenAGalaxy(1, "test", 10, 20, 30);

   this.whenAddingATestSolarSystem(systemId1);
   this.whenAddingATestSolarSystem(systemId2);
   this.whenAddingAStaticJumpCorridor(systemId1, systemId2);

   this.thenSystemShouldHaveAJumpTo(systemId1, systemId2);
   this.thenSystemShouldHaveAJumpTo(systemId2, systemId1);
};
