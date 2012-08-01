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
