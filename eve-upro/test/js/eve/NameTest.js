NameTest = TestCase("NameTest");

NameTest.prototype.testSimple = function()
{
   var result = upro.eve.Util.isValidName("Test");

   assertTrue(result);
};

NameTest.prototype.testTwoWords = function()
{
   var result = upro.eve.Util.isValidName("Test Test");

   assertTrue(result);
};

NameTest.prototype.testSeveralWords = function()
{
   var result = upro.eve.Util.isValidName("Test Test Test Test");

   assertTrue(result);
};

NameTest.prototype.testQuoteOk = function()
{
   var result = upro.eve.Util.isValidName("That's me");

   assertTrue(result);
};

NameTest.prototype.testNoSpaceAtStart = function()
{
   var result = upro.eve.Util.isValidName(" Test");

   assertFalse(result);
};

NameTest.prototype.testQuotAtStart = function()
{
   var result = upro.eve.Util.isValidName("'Test");

   assertFalse(result);
};

NameTest.prototype.testNoSpaceAtEnd = function()
{
   var result = upro.eve.Util.isValidName("Test ");

   assertFalse(result);
};

NameTest.prototype.testQuotAtEnd = function()
{
   var result = upro.eve.Util.isValidName("Test'");

   assertFalse(result);
};

NameTest.prototype.testDashAtStart = function()
{
   var result = upro.eve.Util.isValidName("-Test");

   assertFalse(result);
};

NameTest.prototype.testDashAtEnd = function()
{
   var result = upro.eve.Util.isValidName("Test-");

   assertFalse(result);
};

NameTest.prototype.testNoDoubleSpace = function()
{
   var result = upro.eve.Util.isValidName("Test  Test");

   assertFalse(result);
};

NameTest.prototype.testDashInBetween = function()
{
   var result = upro.eve.Util.isValidName("Test-Me");

   assertTrue(result);
};

NameTest.prototype.testDotInBetween = function()
{
   var result = upro.eve.Util.isValidName("Test.Me");

   assertTrue(result);
};

NameTest.prototype.testExistingSolarSystems = function()
{
   var arr = upro.res.eve.MapData[9].solarSystemData;

   for ( var i = 0; i < arr.length; i++)
   {
      var name = arr[i][3];

      assertTrue("Invalid SolarSystem: " + name, upro.eve.Util.isValidName(name));
   }
};
