// https://github.com/caolan/nodeunit
var fs = require('fs');
var util = require("util");
var WebRemoteApi = require('../lib/WebRemoteApi.js');

function Fixture()
{
   this.callback = function()
   {
   };

   this.givenAnApiInstance = function(hostname)
   {
      this.api = new WebRemoteApi(hostname);
   };

   this.expectingCallbackToBeCalledWithError = function(test)
   {
      this.callback = function(err, data)
      {
         test.ok(err, "No error");
         test.equal(data, null, "Unexpected data:\n" + data);
         test.done();
      };
   };

   this.expectingCallbackToBeCalledWithData = function(test)
   {
      this.callback = function(err, data)
      {
         test.equal(err, null, "Unexpected error:\n" + JSON.stringify(err));
         test.ok(data);
         test.done();
      };
   };

   this.whenGettingData = function(uri, parameters)
   {
      this.api.get(uri, parameters, this.callback);
   };

}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   callback();
};

// exports.testDataIsReturned_WhenCalledWithValidInformation = function(test)
// {
// var parameters =
// {
// 'keyID': '', // TODO add proper data
// 'vCode': ''
// }
//
// this.fixture.givenAnApiInstance('api.eveonline.com');
//
// this.fixture.expectingCallbackToBeCalledWithData(test);
//
// test.expect(2);
// this.fixture.whenGettingData('/account/APIKeyInfo.xml.aspx', parameters);
// }

// exports.testDataIsReturned_WhenCalledWithValidInformation_CorpCorporationSheet = function(test)
// {
// var parameters =
// {
// 'corporationID': 1000046
// };
//
// this.fixture.givenAnApiInstance('api.eveonline.com');
//
// this.fixture.expectingCallbackToBeCalledWithData(test);
//
// test.expect(2);
// this.fixture.whenGettingData('/corp/CorporationSheet.xml.aspx', parameters);
// };

// exports.testErrorIsReturned_WhenCalledWithInvalidUri = function(test)
// {
// var parameters =
// {
// 'keyID': '0',
// 'vCode': 'invalid vCode for unit test'
// }
//
// this.fixture.givenAnApiInstance('api.eveonline.com');
//
// this.fixture.expectingCallbackToBeCalledWithError(test);
//
// test.expect(2);
// this.fixture.whenGettingData('/unitTest/UnitTestUri.xml.aspx', parameters);
// }

exports.testErrorIsReturned_WhenCalledWithInvalidHostName = function(test)
{
   var parameters =
   {
      'keyID': '0',
      'vCode': 'invalid vCode for unit test'
   };

   this.fixture.givenAnApiInstance('notExisting.nowhere');

   this.fixture.expectingCallbackToBeCalledWithError(test);

   test.expect(2);
   this.fixture.whenGettingData('/unitTest/UnitTestUri.xml.aspx', parameters);
};
