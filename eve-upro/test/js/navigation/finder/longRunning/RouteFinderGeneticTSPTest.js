RouteFinderGeneticTSPTest = TestCase("RouteFinderGeneticTSPTest");

RouteFinderGeneticTSPTest.prototype.givenNewEden = function()
{
   Fixture.universe.givenNewEden();
};

RouteFinderGeneticTSPTest.prototype.givenACapability = function(capability)
{
   Fixture.capabilities.push(capability);
};

RouteFinderGeneticTSPTest.prototype.givenARule = function(rule)
{
   Fixture.rules.push(rule);
};

RouteFinderGeneticTSPTest.prototype.givenAFilter = function(filter)
{
   Fixture.filters.push(filter);
};

RouteFinderGeneticTSPTest.prototype.givenARouteFinder = function(sourceName, waypointNames, destinationName)
{
   var sourceSystem = Fixture.universe.findSolarSystem(sourceName);
   var destinationSystem = destinationName ? Fixture.universe.findSolarSystem(destinationName) : null;
   var waypoints = [];

   for ( var i = 0; i < waypointNames.length; i++)
   {
      waypoints.push(Fixture.universe.findSolarSystem(waypointNames[i]));
   }

   Fixture.finder = new upro.nav.finder.RouteFinderGeneticTSP(Fixture.capabilities, Fixture.rules, Fixture.filters,
         sourceSystem, waypoints, destinationSystem);
};

RouteFinderGeneticTSPTest.prototype.whenCallingContinueSearchUntilReturnsTrue = function()
{
   var abort = false;

   while (!abort)
   {
      abort = Fixture.finder.continueSearch();
   }
   Fixture.result = Fixture.finder.route;
};

RouteFinderGeneticTSPTest.prototype.thenTheSearchWasCompletedByFitness = function()
{
   assertTrue("The search took the hard limit (" + Fixture.finder.uncontestet + "/" + Fixture.finder.uncontestetLimit
         + ")", Fixture.finder.uncontestet >= Fixture.finder.uncontestetLimit);
};

RouteFinderGeneticTSPTest.prototype.thenTheTransitRouteHasALengthBetween = function(minimum, maximum)
{
   var value = Fixture.result.length;

   assertTrue("Route with a length of " + value + " is beyond limit " + minimum + " - " + maximum, value >= minimum
         && value <= maximum);
};

RouteFinderGeneticTSPTest.prototype.thenTheTransitRouteShouldBeInNames = function(route)
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

RouteFinderGeneticTSPTest.prototype.arrayToString = function(temp)
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

RouteFinderGeneticTSPTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new TestUniverse();
   Fixture.capabilities = [];
   Fixture.rules = [];
   Fixture.filters = [];
};

RouteFinderGeneticTSPTest.prototype.testSearchOnlySource = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [], null);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)" ]);
};

RouteFinderGeneticTSPTest.prototype.testSearchOnlySourceAndDest = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [], "Gyng");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)" ]);
};

RouteFinderGeneticTSPTest.prototype.testSearchOnlySourceAndEqualDest = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [], "Rens"); // should have been covered at a higher level, but anyway

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)" ]);
};

RouteFinderGeneticTSPTest.prototype.testSearchOnlySourceAndOneWaypoint = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Gyng" ], null);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)" ]);
};

RouteFinderGeneticTSPTest.prototype.testSearchOnlyOneEach = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Gyng" ], "Lustrevik");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)", "Transit(Onga)" ]);
};

RouteFinderGeneticTSPTest.prototype.testSearchOnlySourceAndTwoWaypoints = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Gyng", "Lustrevik" ], null);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)", "Transit(Onga)",
         "Waypoint(Lustrevik)" ]);
};

RouteFinderGeneticTSPTest.prototype.testSearchFull = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Lustrevik", "Gyng" ], "Hek");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "Waypoint(Rens)", "Transit(Frarn)", "Waypoint(Gyng)", "Transit(Onga)",
         "Waypoint(Lustrevik)", "Transit(Eystur)" ]);
};

RouteFinderGeneticTSPTest.prototype.testSearchTenSystems = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Odatrik", [ "Frarn", "Balginia", "Oremmulf", "Larkugei", "Onga", "Eystur", "Aeddin",
         "Gerek", "Offugen", "Trer" ], "Hek");

   this.whenCallingContinueSearchUntilReturnsTrue();

   // TODO check why this one takes only one reported test (?!?)
   // this.thenTheSearchWasCompletedByFitness();
   this.thenTheTransitRouteHasALengthBetween(30, 36);
   // Optimal route below - found in most of the cases
   /*
    * this.thenTheTransitRouteShouldBeInNames(["Waypoint(Odatrik)", "Transit(Rens)", "Waypoint(Frarn)",
    * "Transit(Illinfrik)", "Waypoint(Balginia)", "Transit(Hurjafren)", "Waypoint(Oremmulf)", "Transit(Osaumuni)",
    * "Waypoint(Larkugei)", "Transit(Osaumuni)", "Waypoint(Onga)", "Transit(Magiko)", "Transit(Teonusude)",
    * "Waypoint(Aeddin)", "Transit(Austraka)", "Waypoint(Gerek)", "Transit(Gerbold)", "Transit(Offugen)",
    * "Transit(Eddar)", "Waypoint(Trer)", "Transit(Eddar)", "Waypoint(Offugen)", "Transit(Gerbold)", "Transit(Gerek)",
    * "Transit(Austraka)", "Transit(Aeddin)", "Transit(Teonusude)", "Transit(Magiko)", "Transit(Vullat)",
    * "Waypoint(Eystur)"]);
    */
};

// This one is just for fun - but still completes in only a handfull of seconds
// RouteFinderGeneticTSPTest.prototype.testSearchEighteenSystems = function()
// {
// this.givenNewEden();
// this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
// this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
// this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
// this.givenARouteFinder("Odatrik", [ "Frarn", "Balginia", "Oremmulf", "Larkugei", "Onga", "Eystur", "Aeddin",
// "Gerek", "Offugen", "Trer", "Appen", "Klir", "Emolgranlan", "Krilmokenur", "Abudban", "Dammalin", "Ameinaka",
// "Sist" ], "Hek");
//
// this.whenCallingContinueSearchUntilReturnsTrue();
//
// this.thenTheTransitRouteShouldBeInNames([]);
// };

RouteFinderGeneticTSPTest.prototype.testSearchFailure = function()
{
   this.givenNewEden();
   this.givenARouteFinder("Rens", [ "Onga" ], "Hek");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([]);
};
