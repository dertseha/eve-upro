RegionTest = TestCase("RegionTest");

RegionTest.prototype.givenARegion = function(id, name, x, y, z)
{
   Fixture.region = upro.nav.Region.create(id, name, x, y, z);
   Fixture.galaxy.regions.add(Fixture.region);
};

RegionTest.prototype.whenAddingATestConstellation = function(id)
{
   var constellation = upro.nav.Constellation.create(id, "TestConstellation", 0, 0, 0);

   Fixture.region.constellations.add(constellation);
};

RegionTest.prototype.whenAddingATestSolarSystem = function(id, constellationId)
{
   var system = upro.nav.SolarSystem.create(id, "TestSystem", 0, 0, 0, 0.0, Fixture.region.id, constellationId);

   Fixture.region.solarSystems.add(system);
};

RegionTest.prototype.thenToStringShouldReturn = function(value)
{
   var result = Fixture.region.toString();

   assertEquals(value, result);
};

RegionTest.prototype.thenTheConstellationHasRegionSet = function(id)
{
   var constellation = Fixture.region.constellations.get(id);

   assertSame(Fixture.region, constellation.region);
};

RegionTest.prototype.thenTheSolarSystemHasConstellationSet = function(id, constellationId)
{
   var system = Fixture.region.solarSystems.get(id);

   assertSame(Fixture.region.constellations.get(constellationId), system.constellation);
};

RegionTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new upro.nav.Universe();
   Fixture.galaxy = upro.nav.Galaxy.create(0, "TestGalaxy", 0, 0, 0);
   Fixture.universe.galaxies.add(Fixture.galaxy);
};

RegionTest.prototype.testCreateRegion = function()
{
   this.givenARegion(1, "Test", 10, 20, 30);

   this.thenToStringShouldReturn('Region [Test]');
};

RegionTest.prototype.testAddConstellation = function()
{
   this.givenARegion(1, "Test", 10, 20, 30);

   this.whenAddingATestConstellation(10);

   this.thenTheConstellationHasRegionSet(10);
};

RegionTest.prototype.testReferenceLateSolarSystem = function()
{
   var constellationId = 10;
   var systemId = 20;

   this.givenARegion(1, "Test", 10, 20, 30);

   this.whenAddingATestConstellation(constellationId);
   this.whenAddingATestSolarSystem(systemId, constellationId);

   this.thenTheSolarSystemHasConstellationSet(systemId, constellationId);
};

RegionTest.prototype.testReferenceLateConstellation = function()
{
   var constellationId = 10;
   var systemId = 20;

   this.givenARegion(1, "Test", 10, 20, 30);

   this.whenAddingATestSolarSystem(systemId, constellationId);
   this.whenAddingATestConstellation(constellationId);

   this.thenTheSolarSystemHasConstellationSet(systemId, constellationId);
};
