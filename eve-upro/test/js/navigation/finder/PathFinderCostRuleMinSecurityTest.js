PathFinderCostRuleMinSecurityTest = TestCase("PathFinderCostRuleMinSecurityTest");

PathFinderCostRuleMinSecurityTest.prototype.givenCostAOf = function(minSecurity)
{
   Fixture.costA.minSecurity = minSecurity;
};

PathFinderCostRuleMinSecurityTest.prototype.givenCostBOf = function(minSecurity)
{
   Fixture.costB.minSecurity = minSecurity;
};

PathFinderCostRuleMinSecurityTest.prototype.whenCallingComparator = function()
{
   Fixture.compareResult = Fixture.rule.comparator(Fixture.costA, Fixture.costB);
};

PathFinderCostRuleMinSecurityTest.prototype.thenTheComparisonResultIs = function(expected)
{
   var result = (Fixture.compareResult < 0) ? -1 : ((Fixture.compareResult > 0) ? 1 : 0);

   assertEquals(expected, result);
};

PathFinderCostRuleMinSecurityTest.prototype.verifyComparison = function(costA, costB, result)
{
   this.givenCostAOf(costA);
   this.givenCostBOf(costB);

   this.whenCallingComparator();

   this.thenTheComparisonResultIs(result);
};

PathFinderCostRuleMinSecurityTest.prototype.setUp = function()
{
   Fixture = {};
   Fixture.rule = new upro.nav.finder.PathFinderCostRuleMinSecurity(0.5);
   Fixture.costA = {};
   Fixture.costB = {};
};

PathFinderCostRuleMinSecurityTest.prototype.testBothOnePointZeroEquals0 = function()
{
   this.verifyComparison(1.0, 1.0, 0);
};

PathFinderCostRuleMinSecurityTest.prototype.testBothAboveSecondHigherIs0 = function()
{
   this.verifyComparison(0.6, 0.7, 0);
};

PathFinderCostRuleMinSecurityTest.prototype.testBothAboveFirstHigherIs0 = function()
{
   this.verifyComparison(0.7, 0.6, 0);
};

PathFinderCostRuleMinSecurityTest.prototype.testBothZeroPointZeroEquals0 = function()
{
   this.verifyComparison(0.0, 0.0, 0);
};

PathFinderCostRuleMinSecurityTest.prototype.testBothBelowFirstHigherIsNegative = function()
{
   this.verifyComparison(0.3, 0.2, -1);
};

PathFinderCostRuleMinSecurityTest.prototype.testBothBelowSecondHigherIsPositive = function()
{
   this.verifyComparison(0.2, 0.3, 1);
};

PathFinderCostRuleMinSecurityTest.prototype.testFirstBelowIsPositive = function()
{
   this.verifyComparison(0.0, 1.0, 1);
};

PathFinderCostRuleMinSecurityTest.prototype.testSecondBelowIsNegative = function()
{
   this.verifyComparison(1.0, 0.0, -1);
};

PathFinderCostRuleMinSecurityTest.prototype.testUndefinedIsAlwaysBetterForFirst = function()
{
   this.verifyComparison(undefined, 1.0, -1);
};

PathFinderCostRuleMinSecurityTest.prototype.testUndefinedIsAlwaysBetterForSecond = function()
{
   this.verifyComparison(1.0, undefined, 1);
};
