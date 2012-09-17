ActiveRouteProxyTest = TestCase("ActiveRouteProxyTest");

ActiveRouteProxyTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new TestUniverse();

   Fixture.universe.givenNewEden();
};

ActiveRouteProxyTest.prototype.givenAnActiveRouteProxy = function()
{
   Fixture.proxy = new upro.model.proxies.ActiveRouteProxy();
   Fixture.proxy.notify = function()
   {
      Fixture.notifyCalled = true;
   };
};

ActiveRouteProxyTest.prototype.whenAddingACheckpoint = function(systemName)
{
   var solarSystem = Fixture.universe.findSolarSystem(systemName);

   Fixture.proxy.addCheckpoint(solarSystem);
};

ActiveRouteProxyTest.prototype.whenAddingAWaypoint = function(systemName)
{
   var solarSystem = Fixture.universe.findSolarSystem(systemName);
   var entryType = upro.nav.SystemRouteEntry.EntryType.Waypoint;

   assertTrue("Sanity: Can not add " + systemName + " as " + entryType + " although test expects it", Fixture.proxy
         .canEntryBeAdded(solarSystem, entryType));
   Fixture.proxy.addWaypoint(solarSystem);
};

ActiveRouteProxyTest.prototype.whenRemovingAnEntry = function(systemName)
{
   Fixture.proxy.removeEntry(Fixture.universe.findSolarSystem(systemName));
};

ActiveRouteProxyTest.prototype.thenCanEntryBeAddedShouldReturnForACheckpoint = function(systemName, expected)
{
   this.verifyCanEntryBeAdded(systemName, upro.nav.SystemRouteEntry.EntryType.Checkpoint, expected);
};

ActiveRouteProxyTest.prototype.thenCanEntryBeAddedShouldReturnForAWaypoint = function(systemName, expected)
{
   this.verifyCanEntryBeAdded(systemName, upro.nav.SystemRouteEntry.EntryType.Waypoint, expected);
};

ActiveRouteProxyTest.prototype.verifyCanEntryBeAdded = function(systemName, type, expected)
{
   var result = Fixture.proxy.canEntryBeAdded(Fixture.universe.findSolarSystem(systemName), type);

   assertEquals(expected, result);
};

ActiveRouteProxyTest.prototype.thenTheRouteShouldBe = function(systemList)
{
   var expectedString = "";
   var presentString = "";
   var route = Fixture.proxy.getRoute();

   systemList.forEach(function(name)
   {
      if (expectedString.length > 0)
      {
         expectedString += ", ";
      }
      expectedString += name;
   });
   route.forEach(function(routeEntry)
   {
      if (presentString.length > 0)
      {
         presentString += ", ";
      }
      presentString += routeEntry.getEntryType() + "(" + routeEntry.getSolarSystem().name + ")";
   });

   assertEquals(expectedString, presentString);
};

ActiveRouteProxyTest.prototype.testAllowsCheckpointAtStart = function()
{
   this.givenAnActiveRouteProxy();

   this.thenCanEntryBeAddedShouldReturnForACheckpoint("Rens", true);
};

ActiveRouteProxyTest.prototype.testDoesntAllowWaypointAtStart = function()
{
   this.givenAnActiveRouteProxy();

   this.thenCanEntryBeAddedShouldReturnForAWaypoint("Rens", false);
};

ActiveRouteProxyTest.prototype.testDoesntAllowDoubleWaypointNext = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Hek");

   this.thenCanEntryBeAddedShouldReturnForAWaypoint("Hek", false);
};

ActiveRouteProxyTest.prototype.testDoesntAllowDoubleWaypointInSegment = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingAWaypoint("Hek");

   this.thenCanEntryBeAddedShouldReturnForAWaypoint("Frarn", false);
};

ActiveRouteProxyTest.prototype.testSameCheckpoints = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingACheckpoint("Rens");

   this.thenTheRouteShouldBe([ "Checkpoint(Rens)", "Checkpoint(Rens)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveWaypointEnd = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenRemovingAnEntry("Frarn");

   this.thenTheRouteShouldBe([ "Checkpoint(Rens)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveWaypointBetween = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");

   this.whenRemovingAnEntry("Frarn");

   this.thenTheRouteShouldBe([ "Checkpoint(Rens), Checkpoint(Hek)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveCheckpointEnd = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");

   this.whenRemovingAnEntry("Hek");

   this.thenTheRouteShouldBe([ "Checkpoint(Rens), Waypoint(Frarn)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveCheckpointStart = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");

   this.whenRemovingAnEntry("Rens");

   this.thenTheRouteShouldBe([ "Checkpoint(Frarn), Checkpoint(Hek)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveCheckpointDuplicateWaypoint = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Balginia");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Rens");

   this.whenRemovingAnEntry("Balginia");

   this.thenTheRouteShouldBe([ "Checkpoint(Rens), Waypoint(Frarn), Checkpoint(Frarn), Checkpoint(Rens)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveCheckpointMultiple = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Rens");

   this.whenRemovingAnEntry("Rens");

   this.thenTheRouteShouldBe([ "Checkpoint(Frarn), Checkpoint(Frarn)" ]);
};
