TextUtilTest = TestCase("TextUtilTest");

TextUtilTest.prototype.setUp = function()
{
   Fixture = {};
};

TextUtilTest.prototype.testSimple = function()
{
   var result = upro.res.text.Util.format("No Parameter!");

   assertEquals("No Parameter!", result);
};

TextUtilTest.prototype.testEmptyBracketsIgnored = function()
{
   var result = upro.res.text.Util.format("Empty: {}");

   assertEquals("Empty: {}", result);
};

TextUtilTest.prototype.testReplaceOne = function()
{
   var result = upro.res.text.Util.format("Got [{0}] this", 1);

   assertEquals("Got [1] this", result);
};

TextUtilTest.prototype.testReplaceTwo = function()
{
   var result = upro.res.text.Util.format("Got [{0}] this and [{1}]", 1, 2);

   assertEquals("Got [1] this and [2]", result);
};

TextUtilTest.prototype.testReplaceMissing = function()
{
   var result = upro.res.text.Util.format("Got [{0}] this and [{1}]");

   assertEquals("Got [undefined] this and [undefined]", result);
};

TextUtilTest.prototype.testReplaceMoreThan9 = function()
{
   var result = upro.res.text.Util.format("{0}{1}{2}{3}{4}{5}{6}{7}{8}{9}{10}{11}", 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
         12);

   assertEquals("123456789101112", result);
};

TextUtilTest.prototype.testReplaceNonDigitIgnored = function()
{
   var result = upro.res.text.Util.format("Got [{test}] this", 1);

   assertEquals("Got [{test}] this", result);
};

TextUtilTest.prototype.testReplaceNegativeValueIgnored = function()
{
   var result = upro.res.text.Util.format("Got [{-1}] this", 1);

   assertEquals("Got [{-1}] this", result);
};

TextUtilTest.prototype.testReplaceNegativeValueIgnored2 = function()
{
   var result = upro.res.text.Util.format("Got [{-2}] this", 1);

   assertEquals("Got [{-2}] this", result);
};
