uuid = require('../util/UuidFactory.js');

exports.testEmptyShouldReturnEmptyUuid = function(test)
{
   test.equal(Array(33).join('0'), uuid.empty());
   test.done();
};

exports.testV4ShouldReturnStringOfLength32 = function(test)
{
   test.equal(uuid.v4().length, 32);
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
