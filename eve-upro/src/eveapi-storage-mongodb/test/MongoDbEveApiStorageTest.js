var MongoDbEveApiStorage = require('../lib/index.js');

function Fixture()
{
   this.callback = function()
   {
   };

}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   callback();
};

exports.testCreationDependencyIsOk = function(test)
{
   var storage = new MongoDbEveApiStorage();

   test.ok(storage);
   test.done();
};

exports.testCorrectedTimestampIsInSecondsUtcRoundedUp = function(test)
{
   var storage = new MongoDbEveApiStorage();

   storage.getCurrentDate = function()
   {
      function TestDate()
      {
         // CST is -5 from UTC and -6 during winter
         this.toUTCString = function()
         {
            return '31 Dec 1999 18:00:00.001 CST';
         };
      }

      var tempDate = new TestDate();

      return tempDate;
   };

   test.equal(storage.getCorrectedTimestamp(), 946684800 + 1);
   test.done();
};
