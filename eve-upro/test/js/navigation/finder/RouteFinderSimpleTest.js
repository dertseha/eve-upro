RouteFinderSimpleTest = TestCase("RouteFinderSimpleTest")

RouteFinderSimpleTest.prototype.givenNewEden = function()
{
   Fixture.universe.givenNewEden();
};

RouteFinderSimpleTest.prototype.givenACapability = function(capability)
{
   Fixture.capabilities.push(capability);
};

RouteFinderSimpleTest.prototype.givenARule = function(rule)
{
   Fixture.rules.push(rule);
};

RouteFinderSimpleTest.prototype.givenAFilter = function(filter)
{
   Fixture.filters.push(filter);
};

RouteFinderSimpleTest.prototype.givenARouteFinder = function(sourceName, waypointNames, destinationName)
{
   var sourceSystem = Fixture.universe.findSolarSystem(sourceName);
   var destinationSystem = destinationName ? Fixture.universe.findSolarSystem(destinationName) : null;
   var waypoints = [];

   for ( var i = 0; i < waypointNames.length; i++)
   {
      waypoints.push(Fixture.universe.findSolarSystem(waypointNames[i]));
   }

   Fixture.finder = new upro.nav.finder.RouteFinderSimple(Fixture.capabilities, Fixture.rules, Fixture.filters,
         sourceSystem, waypoints, destinationSystem);
};

RouteFinderSimpleTest.prototype.whenCallingContinueSearchUntilReturnsTrue = function()
{
   var abort = false;

   while (!abort)
   {
      abort = Fixture.finder.continueSearch();
   }
   Fixture.result = Fixture.finder.getRouteEntries();
};

RouteFinderSimpleTest.prototype.thenTheTransitRouteShouldBeInNames = function(route)
{
   var foundRoute = "[";

   for ( var i = 0; i < Fixture.result.length; i++)
   {
      var entry = Fixture.result[i];

      foundRoute += entry.getEntryType();
      foundRoute += "(" + entry.getSolarSystem().name + ")";
      if ((i + 1) < Fixture.result.length)
      {
         foundRoute += ", ";
      }
   }
   foundRoute += "]";

   assertEquals(this.arrayToString(route), foundRoute);
};

RouteFinderSimpleTest.prototype.arrayToString = function(temp)
{
   var string = '[';

   for ( var i = 0; i < temp.length; i++)
   {
      string += temp[i];
      if ((i + 1) < temp.length)
      {
         string += ', ';
      }
   }
   string += ']';

   return string;
};

RouteFinderSimpleTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new TestUniverse();
   Fixture.capabilities = [];
   Fixture.rules = [];
   Fixture.filters = [];
};

RouteFinderSimpleTest.prototype.testSearchOnlySource = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [], null);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)" ]);
};

RouteFinderSimpleTest.prototype.testSearchOnlySourceAndDest = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [], "Gyng");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)" ]);
};

RouteFinderSimpleTest.prototype.testSearchOnlySourceAndOneWaypoint = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Gyng" ], null);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)" ]);
};

RouteFinderSimpleTest.prototype.testSearchOnlySourceAndTwoWaypoints = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Gyng", "Lustrevik" ], null);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)", "Transit(Onga)",
         "Waypoint(Lustrevik)" ]);
};

RouteFinderSimpleTest.prototype.testSearchFull = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Gyng", "Lustrevik" ], "Hek");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)", "Transit(Onga)",
         "Waypoint(Lustrevik)", "Transit(Eystur)" ]);
};

RouteFinderSimpleTest.prototype.testSearchFailure = function()
{
   this.givenNewEden();
   this.givenARouteFinder("Rens", [ "Onga" ], "Hek");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([]);
};
