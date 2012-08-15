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
      shipid: 1234,
      shiptypename: 'ShipName',
      constellationid: 5678,
      constellationname: 'ConstName'
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
