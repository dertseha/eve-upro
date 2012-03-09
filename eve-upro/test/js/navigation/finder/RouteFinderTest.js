var TestRouteFinder = Class.create(upro.nav.finder.RouteFinder,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      this.startCalled = 0;
      this.continue1Called = 0;

      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);
   },

   internalStart: function()
   {
      this.startCalled++;

      return this.continue1;
   },

   continue1: function()
   {
      this.continue1Called++;
   }
});

RouteFinderTest = TestCase("RouteFinderTest");

RouteFinderTest.prototype.setUp = function()
{
   Fixture = {};
};

RouteFinderTest.prototype.givenATestRouteFinder = function()
{
   Fixture.finder = new TestRouteFinder();
};

RouteFinderTest.prototype.whenCallingContinueSearchUntilReturnsTrue = function()
{
   var abort = false;

   while (!abort)
   {
      abort = Fixture.finder.continueSearch();
   }
};

RouteFinderTest.prototype.thenStartShouldHaveBeenCalled = function(times)
{
   assertEquals(times, Fixture.finder.startCalled);
};

RouteFinderTest.prototype.thenContinue1ShouldHaveBeenCalled = function(times)
{
   assertEquals(times, Fixture.finder.continue1Called);
};

RouteFinderTest.prototype.testSearchStart = function()
{
   this.givenATestRouteFinder();

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenStartShouldHaveBeenCalled(1);
};

RouteFinderTest.prototype.testSearchContinue = function()
{
   this.givenATestRouteFinder();

   this.whenCallingContinueSearchUntilReturnsTrue();

   this.thenContinue1ShouldHaveBeenCalled(1);
};
