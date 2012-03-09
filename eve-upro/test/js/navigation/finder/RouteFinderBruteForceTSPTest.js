RouteFinderBruteForceTSPTest = TestCase("RouteFinderBruteForceTSPTest");

RouteFinderBruteForceTSPTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new TestUniverse();
   Fixture.capabilities = [];
   Fixture.rules = [];
   Fixture.filters = [];
};

RouteFinderBruteForceTSPTest.prototype.givenNewEden = function()
{
   Fixture.universe.givenNewEden();
};

RouteFinderBruteForceTSPTest.prototype.givenACapability = function(capability)
{
   Fixture.capabilities.push(capability);
};

RouteFinderBruteForceTSPTest.prototype.givenARule = function(rule)
{
   Fixture.rules.push(rule);
};

RouteFinderBruteForceTSPTest.prototype.givenAFilter = function(filter)
{
   Fixture.filters.push(filter);
};

RouteFinderBruteForceTSPTest.prototype.givenARouteFinder = function(sourceName, waypointNames, destinationName)
{
   var sourceSystem = Fixture.universe.findSolarSystem(sourceName);
   var destinationSystem = destinationName ? Fixture.universe.findSolarSystem(destinationName) : null;
   var waypoints = [];

   for ( var i = 0; i < waypointNames.length; i++)
   {
      waypoints.push(Fixture.universe.findSolarSystem(waypointNames[i]));
   }

   Fixture.finder = new upro.nav.finder.RouteFinderBruteForceTSP(Fixture.capabilities, Fixture.rules, Fixture.filters,
         sourceSystem, waypoints, destinationSystem);
};

RouteFinderBruteForceTSPTest.prototype.whenCallingContinueSearchUntilReturnsTrue = function()
{
   var abort = false;

   while (!abort)
   {
      abort = Fixture.finder.continueSearch();
   }
   Fixture.result = Fixture.finder.route;
};

RouteFinderBruteForceTSPTest.prototype.thenTheTransitRouteShouldBeInNames = function(route)
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

RouteFinderBruteForceTSPTest.prototype.arrayToString = function(temp)
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

RouteFinderBruteForceTSPTest.prototype.testSearchOnlySource = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [], null);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)" ]);
};

RouteFinderBruteForceTSPTest.prototype.testSearchOnlySourceAndDest = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [], "Gyng");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)" ]);
};

RouteFinderBruteForceTSPTest.prototype.testSearchOnlySourceAndOneWaypoint = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Gyng" ], null);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)" ]);
};

// Disabled as this is not supported by this finder. (having waypoints and no fixed destination)
RouteFinderBruteForceTSPTest.prototype.testSearchOnlySourceAndTwoWaypoints = function()
{
   // this.givenNewEden();
   // this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   // this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   // this.givenARouteFinder("Rens", [ "Gyng", "Lustrevik" ], null);
   //
   // this.whenCallingContinueSearchUntilReturnsTrue();
   //
   // this.thenTheTransitRouteShouldBeInNames([ "Rens", "Frarn", "Gyng", "Onga", "Lustrevik" ]);
};

RouteFinderBruteForceTSPTest.prototype.testSearchFull = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Lustrevik", "Gyng" ], "Hek");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)", "Transit(Onga)",
         "Waypoint(Lustrevik)", "Transit(Eystur)" ]);
};

RouteFinderBruteForceTSPTest.prototype.testSearchFailure = function()
{
   this.givenNewEden();
   this.givenARouteFinder("Rens", [ "Onga" ], "Hek");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([]);
};
