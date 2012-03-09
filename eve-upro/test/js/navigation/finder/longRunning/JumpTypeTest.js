JumpTypeTest = TestCase("JumpTypeTest");

JumpTypeTest.prototype.givenNewEden = function()
{
   Fixture.universe.givenNewEden();
};

JumpTypeTest.prototype.givenACapability = function(capability)
{
   Fixture.capabilities.push(capability);
};

JumpTypeTest.prototype.givenARule = function(rule)
{
   Fixture.rules.push(rule);
};

JumpTypeTest.prototype.givenAFilter = function(filter)
{
   Fixture.filters.push(filter);
};

JumpTypeTest.prototype.givenARouteFinder = function(sourceName, waypointNames, destinationName)
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

JumpTypeTest.prototype.whenCallingContinueSearchUntilReturnsTrue = function()
{
   var abort = false;

   while (!abort)
   {
      abort = Fixture.finder.continueSearch();
   }
   Fixture.result = Fixture.finder.route;
};

JumpTypeTest.prototype.thenTheSearchWasCompletedByFitness = function()
{
   assertTrue("The search took the hard limit", Fixture.finder.uncontestet >= Fixture.finder.uncontestetLimit);
};

JumpTypeTest.prototype.thenTheTransitRouteHasALengthLessThan = function(expected)
{
   var value = Fixture.result.length;

   assertTrue("Route is equal or longer than " + expected + ": " + value, value < expected);
};

JumpTypeTest.prototype.getTransitRouteInNames = function()
{
   var foundRoute = "[";

   for ( var i = 0; i < Fixture.result.length; i++)
   {
      var entry = Fixture.result[i];

      foundRoute += entry.getJumpType();
      foundRoute += "(" + entry.getSolarSystem().name + ")";
      if ((i + 1) < Fixture.result.length)
      {
         foundRoute += ", ";
      }
   }
   foundRoute += "]";

   return foundRoute;
};

JumpTypeTest.prototype.thenTheTransitRouteShouldBeInNames = function(route)
{
   var foundRoute = this.getTransitRouteInNames();

   assertEquals(this.arrayToString(route), foundRoute);
};

JumpTypeTest.prototype.thenTheTransitRouteShouldBeInNamesAnyOf = function(routes)
{
   var foundRoute = this.getTransitRouteInNames();
   var found = false;

   for ( var i = 0; !found && (i < routes.length); i++)
   {
      var expected = this.arrayToString(routes[i]);

      found = expected == foundRoute;
   }

   assertTrue("Route not expected: " + foundRoute, found);
};

JumpTypeTest.prototype.arrayToString = function(temp)
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

JumpTypeTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new TestUniverse();
   Fixture.capabilities = [];
   Fixture.rules = [];
   Fixture.filters = [];
};

JumpTypeTest.prototype.testSimple = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Rens", [ "Lustrevik", "Gyng" ], "Hek");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "JumpGate(Rens)", "JumpGate(Frarn)", "JumpGate(Gyng)", "JumpGate(Onga)",
         "JumpGate(Lustrevik)", "JumpGate(Eystur)" ]);
};

JumpTypeTest.prototype.testGateAndDriveForward = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpDrive(10));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumpFuel());
   this.givenARouteFinder("Abudban", [ "Osoggur", "Amamake" ], "Lantorn");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "JumpGate(Abudban)", "JumpGate(Osoggur)", "JumpDrive(Amamake)" ]);
};

JumpTypeTest.prototype.testGateAndDriveReverse = function()
{
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpDrive(10));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumpFuel());
   this.givenARouteFinder("Lantorn", [ "Amamake", "Osoggur" ], "Abudban");

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNames([ "JumpDrive(Lantorn)", "JumpGate(Amamake)", "JumpGate(Osoggur)" ]);
};

JumpTypeTest.prototype.testReverseEdgeDoesntAllowJumpDriveIntoHighSec = function()
{ // Optimizing dual use of edges is nice and all, but if there's an uni-directional corridor involved, that might not
   // work
   this.givenNewEden();
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpDrive(10));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenARouteFinder("Gerek", [ "Eddar", "Ingunn" ]);

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenTheTransitRouteShouldBeInNamesAnyOf([
         ([ "JumpDrive(Gerek)", "JumpDrive(Ingunn)", "JumpGate(Auren)", "None(Eddar)" ]),
         ([ "JumpDrive(Gerek)", "JumpGate(Auren)", "JumpDrive(Eddar)", "None(Ingunn)" ]) ]);
};
