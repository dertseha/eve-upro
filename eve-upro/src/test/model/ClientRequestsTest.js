var schema = require('js-schema');

var clientRequests = require('../../model/ClientRequests').clientRequests;

module.exports.setUp = function(callback)
{
   callback();
};

module.exports.testAllSchemasAreValid = function(test)
{
   var errors = [];

   for ( var requestName in clientRequests)
   {
      var request = clientRequests[requestName];

      request.header.isValid = schema(request.header.schema);
      if (!request.header.isValid)
      {
         errors.push(requestName + '.header');
      }

      request.body.isValid = schema(request.body.schema);
      if (!request.body.isValid)
      {
         errors.push(requestName + '.body');
      }
   }
   Array.of({});

   test.deepEqual(errors, []);
   test.done();
};
