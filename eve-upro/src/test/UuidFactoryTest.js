uuid = require('../util/UuidFactory.js');

exports.testEmptyShouldReturnEmptyUuid = function(test)
{
   test.equal(Array(33).join('0'), uuid.empty());
   test.done();
};

exports.testV4ShouldReturnStringOfLength32 = function(test)
{
   var value = null;

   for ( var i = 0; i < 1000; i++)
   {
      value = uuid.v4();
      test.equal(value.length, 32, 'err: "' + value + '"');
   }
   test.done();
};

exports.testToBuffer = function(test)
{
   var value = uuid.v4();
   var result = uuid.toBuffer(value);

   test.equal(result.toString('hex'), value);
   test.done();
};

exports.testFromBuffer = function(test)
{
   var value = uuid.v4();
   var buffer = uuid.toBuffer(value);

   test.equal(uuid.fromBuffer(buffer), value);
   test.done();
};

exports.testToMongoId = function(test)
{
   var value = uuid.v4();
   var result = uuid.toMongoId(value);
   var data = result.read(0, result.length());

   test.equal(uuid.fromBuffer(data), value);
   test.done();
};

exports.testFromMongoId = function(test)
{
   var value = uuid.v4();
   var data = uuid.toMongoId(value);
   var result = uuid.fromMongoId(data);

   test.equal(result, value);
   test.done();
};

exports.testV3Empty = function(test)
{
   var result = uuid.v3(uuid.empty(), '');

   test.equal(result, '4ae71336e44b39bfb9d2752e234818a5');
   test.done();
};

exports.testV3 = function(test)
{
   var result = uuid.v3(uuid.empty(), 'Test');

   test.equal(result, '7a8bf5d22e3334ec8af5d3636b55e1fe');
   test.done();
};

exports.testV5 = function(test)
{
   var result = uuid.v5(uuid.empty(), 'Test');

   test.equal(result, '5b23436d8e7c51cf81625cd5fd379ecf');
   test.done();
};

exports.testV5_PredefinedCorporation = function(test)
{
   var result = uuid.v5('6c7599b0e34b4dfab0e8b646164e8c6d', 'Corporation');

   test.equal(result, '48cf12d7dabd5f5e97e43a98258aaa78');
   test.done();
};

exports.testV5_PredefinedAlliance = function(test)
{
   var result = uuid.v5('6c7599b0e34b4dfab0e8b646164e8c6d', 'Alliance');

   test.equal(result, '77662cfa2c345ea39ffcea905332c8be');
   test.done();
};
