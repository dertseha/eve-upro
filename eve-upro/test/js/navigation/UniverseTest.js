UniverseTest = TestCase("UniverseTest");

UniverseTest.prototype.givenAUniverse = function()
{
   Fixture.universe = new upro.nav.Universe();
};

UniverseTest.prototype.whenAddingAGalaxy = function(id, name, x, y, z)
{
   var galaxy = upro.nav.Galaxy.create(id, name, x, y, z);

   Fixture.universe.galaxies.add(galaxy);
};

UniverseTest.prototype.thenGetGalaxyShouldReturnAnObject = function(id)
{
   var galaxy = Fixture.universe.galaxies.get(id);

   assertNotUndefined(galaxy);
};

UniverseTest.prototype.setUp = function()
{
   Fixture = {};
};

UniverseTest.prototype.testAddGalaxy = function()
{
   this.givenAUniverse();

   this.whenAddingAGalaxy(1, "Test", 10, 20, 30);

   this.thenGetGalaxyShouldReturnAnObject(1);
};
