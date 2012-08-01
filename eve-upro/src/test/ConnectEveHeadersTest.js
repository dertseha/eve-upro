var eveHeaders = require('../util/connect-eveheaders.js');

exports.testEveHeaderParserShouldSetData = function(test)
{
   var input =
   {
      non_eve_header: 'test',

      eve_shipid: 1234,
      eve_shiptypename: 'ShipName',
      eve_constellationid: 5678,
      eve_constellationname: 'ConstName'
   };
   var expected =
   {
      shipId: 1234,
      shiptypeName: 'ShipName',
      constellationId: 5678,
      constellationName: 'ConstName'
   };
   var req =
   {
      headers: input
   };

   eveHeaders(req, {}, function()
   {
   });

   test.deepEqual(req.eveHeaders, expected);
   test.done();
};
