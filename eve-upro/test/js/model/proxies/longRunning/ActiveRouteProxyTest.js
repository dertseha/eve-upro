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
   Fixture.proxy.notify = Prototype.emptyFunction;
   Fixture.proxy.setRoutingCapabilities([ new upro.nav.finder.PathFinderCapabilityJumpGates() ]);
   Fixture.proxy.setRoutingRules([ new upro.nav.finder.PathFinderCostRuleJumps() ]);
};

ActiveRouteProxyTest.prototype.whenTheProxyIsEmpty = function()
{
   Fixture.proxy.routeEntries = [];
};

ActiveRouteProxyTest.prototype.whenAddingACheckpoint = function(systemName)
{
   this.addEntry(systemName, upro.nav.SystemRouteEntry.EntryType.Checkpoint);
};

ActiveRouteProxyTest.prototype.whenAddingAWaypoint = function(systemName)
{
   this.addEntry(systemName, upro.nav.SystemRouteEntry.EntryType.Waypoint);
};

ActiveRouteProxyTest.prototype.addEntry = function(systemName, entryType)
{
   var solarSystem = Fixture.universe.findSolarSystem(systemName);

   assertTrue("Sanity: Can not add " + systemName + " as " + entryType + " although test expects it", Fixture.proxy
         .canEntryBeAdded(solarSystem, entryType));
   Fixture.proxy.addEntry(solarSystem, entryType);
};

ActiveRouteProxyTest.prototype.whenRemovingAnEntry = function(systemName)
{
   Fixture.proxy.removeEntry(Fixture.universe.findSolarSystem(systemName));
};

ActiveRouteProxyTest.prototype.whenRunningOptimizersOneCycle = function()
{
   Fixture.proxy.runOptimizers();
};

ActiveRouteProxyTest.prototype.whenRunningOptimizersUntilCompleted = function()
{
   while (!Fixture.proxy.runOptimizers())
   {

   }
};

ActiveRouteProxyTest.prototype.thenCanEntryBeAddedShouldReturnForACheckpoint = function(systemName, expected)
{
   this.verifyCanEntryBeAdded(systemName, upro.nav.SystemRouteEntry.EntryType.Checkpoint, expected);
};

ActiveRouteProxyTest.prototype.thenCanEntryBeAddedShouldReturnForAWaypoint = function(systemName, expected)
{
   this.verifyCanEntryBeAdded(systemName, upro.nav.SystemRouteEntry.EntryType.Waypoint, expected);
};

ActiveRouteProxyTest.prototype.thenCanEntryBeAddedShouldReturnForATransit = function(systemName, expected)
{
   this.verifyCanEntryBeAdded(systemName, upro.nav.SystemRouteEntry.EntryType.Transit, expected);
};

ActiveRouteProxyTest.prototype.verifyCanEntryBeAdded = function(systemName, type, expected)
{
   var result = Fixture.proxy.canEntryBeAdded(Fixture.universe.findSolarSystem(systemName), type);

   assertEquals(expected, result);
};

ActiveRouteProxyTest.prototype.thenTheRouteEntriesShouldBe = function(systemList)
{
   var expectedString = "";
   var presentString = "";

   systemList.each(function(name)
   {
      if (expectedString.length > 0)
      {
         expectedString += ", ";
      }
      expectedString += name;
   });
   Fixture.proxy.routeEntries.each(function(routeEntry)
   {
      if (presentString.length > 0)
      {
         presentString += ", ";
      }
      presentString += routeEntry.systemEntry.getSolarSystem().name;
   });

   assertEquals(expectedString, presentString);
};

ActiveRouteProxyTest.prototype.thenTheCompleteRouteShouldBe = function(routeList)
{
   var expectedString = "";
   var presentString = "";

   routeList.each(function(name)
   {
      if (expectedString.length > 0)
      {
         expectedString += ", ";
      }
      expectedString += name;
   });
   Fixture.proxy.routeEntries.each(function(routeEntry)
   {
      if (presentString.length > 0)
      {
         presentString += ", ";
      }
      presentString += routeEntry.systemEntry.getEntryType();
      presentString += "(" + routeEntry.systemEntry.getSolarSystem().name + ")";
      for ( var i = 0; i < routeEntry.transits.length; i++)
      {
         var transit = routeEntry.transits[i];

         presentString += ", ";
         presentString += transit.getEntryType();
         presentString += "(" + transit.getSolarSystem().name + ")";
      }
   });

   assertEquals(expectedString, presentString);
};

ActiveRouteProxyTest.prototype.thenTheSegmentShouldBeAt = function(index, expectedStart, expectedEnd)
{
   var end = Fixture.proxy.findSegmentEnd(index);
   var start = Fixture.proxy.findSegmentStart(end);

   assertEquals("" + expectedStart + "-" + expectedEnd, "" + start + "-" + end);
};

ActiveRouteProxyTest.prototype.testAllowsCheckpointAtStart = function()
{
   this.givenAnActiveRouteProxy();

   this.whenTheProxyIsEmpty();

   this.thenCanEntryBeAddedShouldReturnForACheckpoint("Rens", true);
};

ActiveRouteProxyTest.prototype.testDoesntAllowWaypointAtStart = function()
{
   this.givenAnActiveRouteProxy();

   this.whenTheProxyIsEmpty();

   this.thenCanEntryBeAddedShouldReturnForAWaypoint("Rens", false);
};

ActiveRouteProxyTest.prototype.testDoesntAllowTransitAtStart = function()
{
   this.givenAnActiveRouteProxy();

   this.whenTheProxyIsEmpty();

   this.thenCanEntryBeAddedShouldReturnForATransit("Rens", false);
};

ActiveRouteProxyTest.prototype.testSegmentAtStart = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Hek");

   this.thenTheSegmentShouldBeAt(0, 0, 1);
};

ActiveRouteProxyTest.prototype.testSegmentFirstWaypoint = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Hek");

   this.thenTheSegmentShouldBeAt(1, 0, 1);
};

ActiveRouteProxyTest.prototype.testSegmentAtFirstWaypointWithEndCheckpoint = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");

   this.thenTheSegmentShouldBeAt(1, 0, 1);
};

ActiveRouteProxyTest.prototype.testSegmentAtEndWithEndCheckpoint = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");

   this.thenTheSegmentShouldBeAt(2, 2, 2);
};

ActiveRouteProxyTest.prototype.testSecondSegmentWithWaypoint = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");
   this.whenAddingAWaypoint("Bei");

   this.thenTheSegmentShouldBeAt(3, 2, 3);
};

ActiveRouteProxyTest.prototype.testSecondSegmentAtStart = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");
   this.whenAddingAWaypoint("Bei");

   this.thenTheSegmentShouldBeAt(2, 2, 3);
};

ActiveRouteProxyTest.prototype.testDoesntAllowDoubleWaypointNext = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Hek");
   this.whenRunningOptimizersUntilCompleted();

   this.thenCanEntryBeAddedShouldReturnForAWaypoint("Hek", false);
};

ActiveRouteProxyTest.prototype.testDoesntAllowDoubleWaypointInSegment = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingAWaypoint("Hek");
   this.whenRunningOptimizersUntilCompleted();

   this.thenCanEntryBeAddedShouldReturnForAWaypoint("Frarn", false);
};

ActiveRouteProxyTest.prototype.testCheckpointsStayUntouched = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingACheckpoint("Hek");
   this.whenAddingACheckpoint("Frarn");
   this.whenRunningOptimizersUntilCompleted();

   this.thenTheRouteEntriesShouldBe([ "Rens", "Hek", "Frarn" ]);
};

ActiveRouteProxyTest.prototype.testWaypointsGetReordered = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Hek");
   this.whenAddingAWaypoint("Frarn");
   this.whenRunningOptimizersUntilCompleted();

   this.thenTheRouteEntriesShouldBe([ "Rens", "Frarn", "Hek" ]);
};

ActiveRouteProxyTest.prototype.testSameCheckpoints = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingACheckpoint("Rens");
   this.whenRunningOptimizersUntilCompleted();

   this.thenTheRouteEntriesShouldBe([ "Rens", "Rens" ]);
};

ActiveRouteProxyTest.prototype.testCompleteRoute = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Hek");
   this.whenAddingAWaypoint("Frarn");
   this.whenRunningOptimizersUntilCompleted();

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Rens)", "Waypoint(Frarn)", "Transit(Gyng)", "Transit(Onga)",
         "Transit(Pator)", "Transit(Eystur)", "Waypoint(Hek)" ]);
};

ActiveRouteProxyTest.prototype.testRouteCheckpointCheckpoint = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Balginia");
   this.whenRunningOptimizersUntilCompleted();

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Rens)", "Waypoint(Frarn)", "Transit(Illinfrik)",
         "Checkpoint(Balginia)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveWaypointEnd = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenRemovingAnEntry("Frarn");

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Rens)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveWaypointBetween = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");

   this.whenRemovingAnEntry("Frarn");

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Rens), Checkpoint(Hek)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveCheckpointEnd = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");

   this.whenRemovingAnEntry("Hek");

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Rens), Waypoint(Frarn)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveCheckpointStart = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Hek");

   this.whenRemovingAnEntry("Rens");

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Frarn), Checkpoint(Hek)" ]);
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

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Rens), Checkpoint(Frarn), Checkpoint(Rens)" ]);
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

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Frarn), Checkpoint(Frarn)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveWaypointReorder = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Balginia");
   this.whenRunningOptimizersUntilCompleted();

   this.whenRemovingAnEntry("Frarn");
   this.whenRunningOptimizersUntilCompleted();

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Rens), Transit(Frarn), Transit(Illinfrik), Checkpoint(Balginia)" ]);
};

ActiveRouteProxyTest.prototype.testAddCheckpointOfSameWaypointRemovesWaypoint = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Illinfrik");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Illinfrik");
   this.whenRunningOptimizersUntilCompleted();

   this.thenTheCompleteRouteShouldBe([ "Checkpoint(Rens), Waypoint(Frarn), Checkpoint(Illinfrik)" ]);
};

ActiveRouteProxyTest.prototype.testAddCheckpointOfSameCheckpointIsOk = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Illinfrik");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Rens");
   this.whenRunningOptimizersUntilCompleted();

   this
         .thenTheCompleteRouteShouldBe([ "Checkpoint(Rens), Waypoint(Frarn), Waypoint(Illinfrik), Transit(Frarn), Checkpoint(Rens)" ]);
};

ActiveRouteProxyTest.prototype.testRemoveDoesntMessUpPendingOptimizers = function()
{
   this.givenAnActiveRouteProxy();

   this.whenAddingACheckpoint("Rens");
   this.whenAddingAWaypoint("Frarn");
   this.whenAddingACheckpoint("Balginia");
   this.whenAddingAWaypoint("Hurjafren");

   this.whenRemovingAnEntry("Frarn");
   this.whenRunningOptimizersUntilCompleted();

   this
         .thenTheCompleteRouteShouldBe([ "Checkpoint(Rens), Transit(Frarn), Transit(Illinfrik), Checkpoint(Balginia), Waypoint(Hurjafren)" ]);
};
