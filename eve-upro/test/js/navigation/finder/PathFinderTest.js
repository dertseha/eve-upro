PathFinderTest = TestCase("PathFinderTest");

PathFinderTest.prototype.givenNewEden = function()
{
   Fixture.universe.givenNewEden();
};

PathFinderTest.prototype.givenAGalaxy = function(id, name)
{
   var galaxy = upro.nav.Galaxy.create(id, name);

   Fixture.universe.galaxy = galaxy;
   Fixture.universe.universe.galaxies.add(galaxy);
};

PathFinderTest.prototype.givenASolarSystem = function(id, name, x, y, z, security, regionId, constellationId)
{
   var system = upro.nav.SolarSystem.create(id, name, x, y, z, security, regionId, constellationId);

   Fixture.universe.galaxy.solarSystems.add(system);
};

PathFinderTest.prototype.givenASimpleStaticJumpCorridor = function(systemId1, systemId2)
{
   Fixture.universe.galaxy.addStaticJumpCorridor(systemId1, systemId2, upro.nav.JumpType.JumpGate);
};

PathFinderTest.prototype.givenASpecificStaticJumpCorridor = function(systemId1, systemId2, jumpType)
{
   Fixture.universe.galaxy.addStaticJumpCorridor(systemId1, systemId2, jumpType);
};

PathFinderTest.prototype.givenAGraph = function(graph)
{
   for ( var i = 0; i < graph.length; i++)
   {
      var jump = graph[i];

      if (Fixture.universe.galaxy.solarSystems.get(jump[0]) == undefined)
      {
         this.givenASolarSystem(jump[0], "Test" + jump[0]);
      }
      if (Fixture.universe.galaxy.solarSystems.get(jump[1]) == undefined)
      {
         this.givenASolarSystem(jump[1], "Test" + jump[1]);
      }
      this.givenASimpleStaticJumpCorridor(jump[0], jump[1]);
   }
};

PathFinderTest.prototype.givenACapability = function(capability)
{
   Fixture.capabilities.push(capability);
};

PathFinderTest.prototype.givenARule = function(rule)
{
   Fixture.rules.push(rule);
};

PathFinderTest.prototype.givenAFilter = function(filter)
{
   Fixture.filters.push(filter);
};

PathFinderTest.prototype.givenAPathFinderForSystems = function(systemId1, systemId2)
{
   Fixture.pathFinder = new upro.nav.finder.PathFinder(Fixture.universe.findSolarSystem(systemId1), Fixture.universe
         .findSolarSystem(systemId2), Fixture.capabilities, Fixture.rules, Fixture.filters);
};

PathFinderTest.prototype.whenPerformingASearch = function()
{
   Fixture.pathFinder.performSearch();
};

PathFinderTest.prototype.thenTheFoundRouteShouldBe = function(route)
{
   var waypoint = Fixture.pathFinder.cheapestPath;
   var foundRoute = [];

   while (waypoint != null)
   {
      foundRoute.push(waypoint.system.id);
      waypoint = waypoint.previousWaypoint;
   }
   assertEquals(this.arrayToString(route), this.arrayToString(foundRoute.reverse()));
};

PathFinderTest.prototype.thenTheFoundRouteShouldHaveALengthOf = function(length)
{
   var value = 0;

   if (Fixture.pathFinder.cheapestPath != null)
   {
      var waypoint = Fixture.pathFinder.cheapestPath.previousWaypoint;
      var lastSystem = Fixture.pathFinder.cheapestPath.system;

      while (waypoint != null)
      {
         var route = Fixture.waypointMap[waypoint.system.id][lastSystem.id];
         value += this.getLengthOfRoute(route);
         lastSystem = waypoint.system;

         waypoint = waypoint.previousWaypoint;
      }
   }

   assertEquals(length, value);
};

PathFinderTest.prototype.getLengthOfRoute = function(route)
{
   var value = 0;
   var waypoint = route;

   while ((waypoint != null) && (waypoint.previousWaypoint != null))
   {
      waypoint = waypoint.previousWaypoint;
      value++;
   }

   return value;
};

PathFinderTest.prototype.thenTheFoundRouteShouldBeInNames = function(route)
{
   var foundRoute = "[]";

   if (Fixture.pathFinder.cheapestPath != null)
   {
      foundRoute = Fixture.pathFinder.cheapestPath.getPathInNames();
   }

   assertEquals(this.arrayToString(route), foundRoute);
};

PathFinderTest.prototype.arrayToString = function(temp)
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

PathFinderTest.prototype.thenNoRouteShouldBeFound = function()
{
   assertNull(Fixture.pathFinder.cheapestPath);
};

PathFinderTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.universe = new TestUniverse();
   Fixture.capabilities = [];
   Fixture.rules = [];
   Fixture.filters = [];
};

PathFinderTest.prototype.testSearchLinearPath = function()
{
   this.givenAGalaxy(1, "Test");
   this.givenAGraph([ [ 1, 2 ], [ 2, 3 ], [ 3, 4 ] ]);
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems(1, 4);

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBe([ 1, 2, 3, 4 ]);
};

PathFinderTest.prototype.testSearchLinearPathEqualFork = function()
{
   this.givenAGalaxy(1, "Test");
   this.givenAGraph([ [ 1, 2 ], [ 1, 3 ], [ 2, 4 ], [ 3, 4 ] ]);
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems(1, 4);

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBe([ 1, 2, 4 ]);
};

PathFinderTest.prototype.testSearchLinearPathLongerForkShorterPathFirst = function()
{
   this.givenAGalaxy(1, "Test");
   this.givenAGraph([ [ 1, 4 ], [ 1, 2 ], [ 2, 3 ], [ 3, 4 ] ]);
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems(1, 4);

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBe([ 1, 4 ]);
};

PathFinderTest.prototype.testSearchLinearPathLongerForkLongerPathFirst = function()
{
   this.givenAGalaxy(1, "Test");
   this.givenAGraph([ [ 1, 2 ], [ 2, 3 ], [ 3, 4 ], [ 1, 4 ] ]);
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems(1, 4);

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBe([ 1, 4 ]);
};

PathFinderTest.prototype.testSearchDeadEnds = function()
{
   this.givenAGalaxy(1, "Test");
   this.givenAGraph([ [ 1, 2 ], [ 1, 3 ], [ 3, 4 ] ]);
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems(1, 4);

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBe([ 1, 3, 4 ]);
};

PathFinderTest.prototype.testSearchNoWay = function()
{
   this.givenAGalaxy(1, "Test");
   this.givenAGraph([ [ 1, 2 ], [ 3, 4 ] ]);
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems(1, 4);

   this.whenPerformingASearch();

   this.thenNoRouteShouldBeFound();
};

PathFinderTest.prototype.testSearchWithCentralPoint = function()
{
   this.givenAGalaxy(1, "Test");
   this.givenAGraph([ [ 1, 2 ], [ 1, 3 ], [ 2, 4 ], [ 3, 5 ], [ 4, 6 ], [ 5, 6 ], [ 6, 7 ] ]);
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems(1, 7);

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBe([ 1, 2, 4, 6, 7 ]);
};

PathFinderTest.prototype.testNewEdenRensToHek = function()
{
   this.givenNewEden();
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems("Rens", "Hek");

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBeInNames([ "Rens", "Frarn", "Gyng", "Onga", "Pator", "Eystur", "Hek" ]);
};

PathFinderTest.prototype.testNewEdenDammalinToOsoggurThroughLowSec = function()
{
   this.givenNewEden();
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMaxSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems("Dammalin", "Osoggur");

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBeInNames([ "Dammalin", "Bosboger", "Gulmorogod", "Amamake", "Osoggur" ]);
};

PathFinderTest.prototype.testNewEdenLirerimToFinanarThroughHighSec = function()
{
   this.givenNewEden();
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems("Lirerim", "Finanar");

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBeInNames([ "Lirerim", "Yrmori", "Eram", "Aldagolf", "Earwik", "Finanar" ]);
};

PathFinderTest.prototype.testNewEdenRensToJitaThroughHighSec = function()
{
   this.givenNewEden();
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems("Rens", "Jita");

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBeInNames([ "Rens", "Frarn", "Gyng", "Onga", "Pator", "Eystur", "Hek", "Uttindar",
         "Bei", "Colelie", "Deltole", "Aufay", "Balle", "Du Annes", "Renyn", "Algogille", "Kassigainen", "Hatakani",
         "Sivala", "Uedama", "Haatomo", "Suroken", "Kusomonmon", "Urlen", "Perimeter", "Jita" ]);
};

PathFinderTest.prototype.testNewEdenAmarrToJitaThroughHighSec = function()
{
   this.givenNewEden();
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems("Amarr", "Jita");

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBeInNames([ "Amarr", "Ashab", "Madirmilire", "Niarja", "Kaaputenen", "Inaro",
         "Sirppala", "Urlen", "Perimeter", "Jita" ]);
};

// deactivated for taking way longer than the rest (20 seconds on my machine) -- pending JumpDrive optimization
//
// PathFinderTest.prototype.test3QYVEToMVUOFThroughJumpDrive = function()
// {
// this.givenNewEden();
// this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
// this.givenARule(new upro.nav.finder.PathFinderCostRuleJumpFuel());
// this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpDrive(11.25));
// this.givenAPathFinderForSystems("3-QYVE", "MVUO-F");
//
// this.whenPerformingASearch();
// // This route is a little shorter in terms of ly this.when compared to competition - but it might be that there
// // are either rounding issues with the system positions or competition does calculation of fuel consumption,
// // which might have more rounding.
// // This route comes down to a bit more than 105ly, competition: 106.5ly
// this.thenTheFoundRouteShouldBeInNames([ "3-QYVE", "C-HCGU", "O-TVTD", "Daras", "Rakapas", "Adirain", "Zatamaka",
// "Ashmarir", "Z-UZZN", "L-YMYU", "MVUO-F" ]);
// };
//
// PathFinderTest.prototype.testJitaToHalmahThroughCheapJumpDrive = function()
// {
// this.givenNewEden();
// this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
// this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
// this.givenARule(new upro.nav.finder.PathFinderCostRuleJumpFuel());
// this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
// this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpDrive(11.25));
// this.givenAPathFinderForSystems("Jita", "Halmah");
//
// this.whenPerformingASearch();
//
// this.thenTheFoundRouteShouldBeInNames([ "Jita", "Perimeter", "Urlen", "Sirppala", "Inaro", "Kaaputenen", "Niarja",
// "Halmah" ]);
// };
//
// PathFinderTest.prototype.testJitaToHalmahThroughCheapJumpDriveWithJumpsVariant = function()
// {
// this.givenNewEden();
// this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
// this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps(2));
// this.givenARule(new upro.nav.finder.PathFinderCostRuleJumpFuel());
// this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
// this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpDrive(11.25));
// this.givenAPathFinderForSystems("Jita", "Halmah");
//
// this.whenPerformingASearch();
//
// this.thenTheFoundRouteShouldBeInNames([ "Jita", "Perimeter", "Urlen", "Sirppala", "Inaro", "Kaaputenen", "Niarja",
// "Bahromab", "Kudi", "Halmah" ]);
// };

PathFinderTest.prototype.testNewEdenMuvolailenToNewCaldariAvoidingJita = function()
{
   this.givenNewEden();
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAFilter(new upro.nav.finder.PathFinderFilterSystem(Fixture.universe.findSolarSystem("Jita").id));
   this.givenAPathFinderForSystems("Muvolailen", "New Caldari");

   this.whenPerformingASearch();

   // My strategic maps didn't even know about Maurasi - oi!
   this.thenTheFoundRouteShouldBeInNames([ "Muvolailen", "Maurasi", "Perimeter", "Niyabainen", "New Caldari" ]);
};

PathFinderTest.prototype.testNewEdenPerimeterToJitaIsOkWhenAvoidingJita = function()
{
   this.givenNewEden();
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAFilter(new upro.nav.finder.PathFinderFilterSystem(Fixture.universe.findSolarSystem("Jita").id));
   this.givenAPathFinderForSystems("Perimeter", "Jita");

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBeInNames([ "Perimeter", "Jita" ]);
};

PathFinderTest.prototype.givenAWaypointCapability = function(systems, destinationSystem)
{
   var theMap = {};

   for ( var i = 0; i < systems.length; i++)
   {
      var systemA = Fixture.universe.findSolarSystem(systems[i]);

      for ( var j = 0; j < systems.length; j++)
      {
         if (systemA.name != systems[j])
         {
            var systemB = Fixture.universe.findSolarSystem(systems[j]);
            var pathFinder = new upro.nav.finder.PathFinder(systemA, systemB, Fixture.capabilities, Fixture.rules,
                  Fixture.filters);
            var destMap = theMap[systemA.id];

            pathFinder.performSearch();

            if (destMap === undefined)
            {
               theMap[systemA.id] = destMap = {};
            }
            destMap[systemB.id] = pathFinder.cheapestPath;
         }
      }
   }
   Fixture.capabilities = [];
   Fixture.waypointMap = theMap;
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityWaypoints(theMap, destinationSystem));
};

PathFinderTest.prototype.whenConsideringOnlyLastCost = function()
{
   Fixture.pathFinder.onlyConsiderLastCost = true;
};

PathFinderTest.prototype.testFinderOfWaypoints = function()
{
   this.givenNewEden();
   this.givenARule(new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5));
   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());

   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAWaypointCapability([ "Odatrik", "Onga", "Rens", "Balginia", "Frarn", "Osaumuni" ], Fixture.universe
         .findSolarSystem("Rens"));

   this.givenAPathFinderForSystems("Odatrik", "Rens");

   this.whenConsideringOnlyLastCost();
   this.whenPerformingASearch();

   // I think the test is kind of wrong. There exist two solutions, depending on which way you go first
   // but the more pressing issue is why the results would be different - there's no random involved.
   // I suspect floating point comparison mismatch.
   // Chrome: this.thenTheFoundRouteShouldBeInNames(["Odatrik", "Frarn", "Balginia", "Osaumuni", "Onga", "Rens"]);
   // Mozilla: this.thenTheFoundRouteShouldBeInNames(["Odatrik", "Onga", "Osaumuni", "Balginia", "Frarn", "Rens"]);
   this.thenTheFoundRouteShouldHaveALengthOf(10);
};

PathFinderTest.prototype.testJumpGateCapabilityIgnoresNonGates = function()
{
   this.givenNewEden();
   this.givenASpecificStaticJumpCorridor(Fixture.universe.findSolarSystem("Rens").id, Fixture.universe
         .findSolarSystem("Hek").id, upro.nav.JumpType.DynamicWormhole);

   this.givenARule(new upro.nav.finder.PathFinderCostRuleJumps());
   this.givenACapability(new upro.nav.finder.PathFinderCapabilityJumpGates());
   this.givenAPathFinderForSystems("Rens", "Hek");

   this.whenPerformingASearch();

   this.thenTheFoundRouteShouldBeInNames([ "Rens", "Frarn", "Gyng", "Onga", "Pator", "Eystur", "Hek" ]);
};
