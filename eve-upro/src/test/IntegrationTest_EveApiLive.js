var util = require('util');

var mongodb = require('mongodb');

var eveapi = require('../eveapi/lib/index.js');
var MongoDbStorage = require('../eveapi-storage-mongodb/lib/index.js');

function Fixture(db, storage)
{
   this.db = db;
   this.storage = storage;

   this.options =
   {
      apiHostName: 'api.eveonline.com'
   };
   this.remoteApi = null;

   this.givenAnApiInstance = function()
   {
      this.api = eveapi.create(this.options, this.storage, this.remoteApi);
   };

   this.thenRequestShouldResultInErrorInData = function(test, apiFunction, parameters, expectedErr, expectedData)
   {
      var callback = function(err, data)
      {
         test.equal(err, null, 'Unexpected Error: ' + JSON.stringify(err));
         test.ok(data.err, 'No Error');
         test.done();
      };

      this.api.request(apiFunction, parameters, callback);
   };

}

exports.setUp = function(callback)
{
   var serverOptions =
   {
      auto_reconnect: true
   };
   var mongoserver = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT, serverOptions);
   var dbOptions = {};
   var dbConnector = new mongodb.Db('eve-upro_test_eveapi', mongoserver, dbOptions);
   var self = this;

   dbConnector.open(function(err, db)
   {
      db.dropDatabase();
      db.close();

      process.nextTick(function()
      {
         dbConnector.open(function(err, db)
         {
            var storage = new MongoDbStorage(db);

            eveapi.initStorage(storage, function(err)
            {
               self.fixture = new Fixture(db, storage);
               callback();
            });
         });
      });
   });
};

exports.tearDown = function(callback)
{
   this.fixture.db.close();

   callback();
};

exports.testResultIsAnError_WhenProvidedWithWrongKey = function(test)
{
   var parameters =
   {
      keyID: '0',
      vCode: 'Invalid unit test key'
   };

   this.fixture.givenAnApiInstance();

   test.expect(2);
   this.fixture.thenRequestShouldResultInErrorInData(test, eveapi.ApiFunctions.AccountApiKeyInfo, parameters);
};
