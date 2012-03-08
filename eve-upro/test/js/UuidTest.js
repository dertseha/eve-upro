UuidTest = TestCase("UuidTest");

UuidTest.prototype.testCreateV4HasProperLength = function()
{
   var value = upro.Uuid.newV4();

   assertEquals(36, value.length);
};

UuidTest.prototype.testCreateV4IsUniqueAcrossSeveralTries = function()
{
   var values = {};

   for ( var i = 0; i < 1000; i++)
   {
      var value = upro.Uuid.newV4();

      assertUndefined("Value is duplicate! [" + value + "]", values[value]);
      values[value] = true;
   }
};
