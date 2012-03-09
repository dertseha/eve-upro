NameInputTest = TestCase("NameInputTest");

NameInputTest.prototype.testAlphaAtBeginOk = function()
{
   var result = upro.eve.Util.isValidNameInput("T");

   assertTrue(result);
};

NameInputTest.prototype.testDotAtBeginNotOk = function()
{
   var result = upro.eve.Util.isValidNameInput(".");

   assertFalse(result);
};

NameInputTest.prototype.testDotAtEndOk = function()
{
   var result = upro.eve.Util.isValidNameInput("T.");

   assertTrue(result);
};

NameInputTest.prototype.testDoubleDotNotOk = function()
{
   var result = upro.eve.Util.isValidNameInput("T..");

   assertFalse(result);
};

NameInputTest.prototype.testAlternatingOk = function()
{
   var result = upro.eve.Util.isValidNameInput("T.e.s.t");

   assertTrue(result);
};
