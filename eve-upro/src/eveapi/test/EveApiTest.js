// https://github.com/caolan/nodeunit
var fs = require('fs');
var util = require('util');
var eveapi = require('../lib/index.js');
var ApiFunction = require('../lib/ApiFunction.js');

function DummyApiFunction(err, cacheTime, data, storageKey)
{
   DummyApiFunction.super_.call(this);

   this.err = err;
   this.cacheTime = cacheTime;
   this.data = data;
   this.storageKey = storageKey;

   this.getStorageKey = function()
   {
      return this.storageKey;
   };

   this.parseXml = function(xmlString)
   {
      var result =
      {
         err: this.err,
         cacheTime: this.cacheTime,
         data: this.data
      };

      return result;
   };
}
util.inherits(DummyApiFunction, ApiFunction);

function Fixture()
{
   this.storage = new eveapi.EveApiStorage();
   this.remoteApi = new eveapi.RemoteApi();

   this.options = {};
   this.result = {};
   this.callback = function()
   {
   };

   this.givenAnApiInstance = function()
   {
      this.api = eveapi.create(this.options, this.storage, this.remoteApi);
   };

   this.givenStorageReturnsForGetOnce = function(test, err, data)
   {
      var count = 0;

      this.storage.get = function(collectionName, key, callback)
      {
         count++;
         test.equal(1, count, 'Unexpected call');
         process.nextTick(function()
         {
            callback(err, data);
         });
      };
   };

   this.givenStorageReturnsForGetImmediately = function(test, err, data)
   {
      this.storage.get = function(collectionName, key, callback)
      {
         callback(err, data);
      };
   };

   this.expectingStorageGetToBeCalled = function(test, expectedName, expectedKey)
   {
      this.storage.get = function(collectionName, key, callback)
      {
         test.equal(collectionName, expectedName, 'Wrong collection: ' + collectionName);
         test.equal(key, expectedKey, 'Wrong key: ' + key);
         test.ok(callback, 'No callback');
         test.done();
      };
   };

   this.expectingStorageSetToBeCalled = function(test, expectedName, expectedKey, expectedTtl, expectedData)
   {
      this.storage.set = function(collectionName, key, ttl, data, callback)
      {
         test.equal(collectionName, expectedName, 'Wrong collection: ' + collectionName);
         test.equal(key, expectedKey, 'Wrong key: ' + key);
         test.deepEqual(data, expectedData, 'Wrong data: ' + JSON.stringify(data));
         test.equal(ttl, expectedTtl, 'Wrong TTL: ' + ttl);
         test.ok(callback, 'No callback');
         test.done();
      };
   };

   this.givenRemoteApiReturnsForGetOnce = function(test, err, data)
   {
      var count = 0;

      this.remoteApi.get = function(uri, parameters, callback)
      {
         count++;
         test.equal(1, count, 'Unexpected call');
         process.nextTick(function()
         {
            callback(err, data);
         });
      };
   };

   this.expectingRemoteApiGetToBeCalled = function(test, expectedUri, expectedParameters)
   {
      this.remoteApi.get = function(uri, parameters, callback)
      {
         test.equal(uri, expectedUri, 'Wrong URI: ' + uri);
         test.deepEqual(parameters, expectedParameters, 'Wrong parameters: ' + JSON.stringify(parameters));
         test.ok(callback, 'No callback');
         test.done();
      };
   };

   this.expectingCallbackToBeCalled = function(test, expectedErr, expectedData)
   {
      this.callback = function(err, data)
      {
         test.equal(err, expectedErr, "Error wrong: " + JSON.stringify(err));
         test.equal(data, expectedData, "Data wrong: " + JSON.stringify(data));
         test.done();
      };
   };

   this.givenARequestForApiKeyInfoIsActive = function(apiKey)
   {
      this.api.request(eveapi.ApiFunctions.AccountApiKeyInfo, apiKey, function()
      {
      });
   };

   this.whenRequestingApiKeyInfo = function(apiKey)
   {
      this.api.request(eveapi.ApiFunctions.AccountApiKeyInfo, apiKey, this.callback);
   };

   this.whenRequestingDummyFunction = function(err, cacheTime, data, storageKey)
   {
      var parameters = {};

      this.api.request(new DummyApiFunction(err, cacheTime, data, storageKey), parameters, this.callback);
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   callback();
};

exports.testStorageIsQueried_WhenCalledForANewRequest = function(test)
{
   var apiKey =
   {
      'keyID': 'theKeyId',
      'vCode': 'theVCode'
   };

   this.fixture.givenAnApiInstance();

   this.fixture.expectingStorageGetToBeCalled(test, 'ApiKeys', '2350698963dd23d9df0f0fb6');

   test.expect(3);
   this.fixture.whenRequestingApiKeyInfo(apiKey);
};

exports.testCallbackReceivesData_WhenProvidedByStorage = function(test)
{
   var apiKey =
   {
      'keyID': 'theKeyId',
      'vCode': 'theVCode'
   };
   var data = '1234';

   this.fixture.givenAnApiInstance();
   this.fixture.givenStorageReturnsForGetOnce(test, null, data);

   this.fixture.expectingCallbackToBeCalled(test, null, data);

   test.expect(3);
   this.fixture.whenRequestingApiKeyInfo(apiKey);
};

exports.testStorageIsQueriedOnlyOnce_WhenCalledTwiceForSameKey = function(test)
{
   var apiKey =
   {
      'keyID': 'theKeyId',
      'vCode': 'theVCode'
   };
   var data = '1234';

   this.fixture.givenAnApiInstance();
   this.fixture.givenStorageReturnsForGetOnce(test, null, data);
   this.fixture.givenARequestForApiKeyInfoIsActive(apiKey);

   test.expect(1);
   this.fixture.whenRequestingApiKeyInfo(apiKey);
   test.done();
};

exports.testAllCallbacksInformed_WhenCalledTwiceForSameKey = function(test)
{
   var apiKey =
   {
      'keyID': 'theKeyId',
      'vCode': 'theVCode'
   };
   var data = '1234';

   this.fixture.givenAnApiInstance();
   this.fixture.givenStorageReturnsForGetOnce(test, null, data);
   this.fixture.givenARequestForApiKeyInfoIsActive(apiKey);

   this.fixture.expectingCallbackToBeCalled(test, null, data);

   test.expect(3);
   this.fixture.whenRequestingApiKeyInfo(apiKey);
};

exports.testCallbackCalled_WhenRequestedAfterOneFinished = function(test)
{
   var apiKey =
   {
      'keyID': 'theKeyId',
      'vCode': 'theVCode'
   };
   var data = '1234';

   this.fixture.givenAnApiInstance();
   this.fixture.givenStorageReturnsForGetImmediately(test, null, data);
   this.fixture.givenARequestForApiKeyInfoIsActive(apiKey);

   this.fixture.expectingCallbackToBeCalled(test, null, data);

   test.expect(2);
   this.fixture.whenRequestingApiKeyInfo(apiKey);
};

exports.testRemoteApiCalled_WhenStorageReturnsError = function(test)
{
   var apiKey =
   {
      'keyID': 'theKeyId',
      'vCode': 'theVCode'
   };

   this.fixture.givenAnApiInstance();

   this.fixture.expectingRemoteApiGetToBeCalled(test, '/account/APIKeyInfo.xml.aspx', apiKey);

   test.expect(3);
   this.fixture.whenRequestingApiKeyInfo(apiKey);
};

exports.testCallbackReceivesData_WhenProvidedByRemoteApi = function(test)
{
   var data = '1234';

   this.fixture.givenAnApiInstance();
   this.fixture.givenRemoteApiReturnsForGetOnce(test, null, 'result 1');

   this.fixture.expectingCallbackToBeCalled(test, null, data);

   test.expect(3);
   this.fixture.whenRequestingDummyFunction(null, 0, data, 'some key');
};

exports.testCallbackReceivesError_WhenProvidedByRemoteApi = function(test)
{
   var apiKey =
   {
      'keyID': 'theKeyId',
      'vCode': 'theVCode'
   };
   var error = 'Not working';

   this.fixture.givenAnApiInstance();
   this.fixture.givenRemoteApiReturnsForGetOnce(test, error, null);

   this.fixture.expectingCallbackToBeCalled(test, error, null);

   test.expect(3);
   this.fixture.whenRequestingApiKeyInfo(apiKey);
};

exports.testCallbackReceivesErrorAsData_WhenErrorProvidedByRemoteApi = function(test)
{
   var error =
   {
      code: 404,
      message: 'welp'
   };
   var data =
   {
      err: error
   };

   this.fixture.givenAnApiInstance();
   this.fixture.givenRemoteApiReturnsForGetOnce(test, null, 'result 2');

   this.fixture.expectingCallbackToBeCalled(test, null, data);

   test.expect(3);
   this.fixture.whenRequestingDummyFunction(null, 0, data, 'some key');
};

exports.testStorageCalledToSet_WhenRemoteApiReturnsData = function(test)
{
   var data = '1234';
   var storageKey = 'da key';

   this.fixture.givenAnApiInstance();
   this.fixture.givenRemoteApiReturnsForGetOnce(test, null, 'result 3');

   this.fixture.expectingStorageSetToBeCalled(test, 'Unknown', storageKey, 60, data);

   test.expect(6);
   this.fixture.whenRequestingDummyFunction(null, 60, data, storageKey);
};
