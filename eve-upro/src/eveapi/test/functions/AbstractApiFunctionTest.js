fs = require('fs');

ApiFunction = require('../../lib/functions/AbstractApiFunction.js');

function Fixture()
{
   this.apiFunction = new ApiFunction();
   this.apiFunction.extractData = function(result, doc)
   {
      result.data = 'Data from function';

      return result;
   };

   this.givenAnXmlString = function(xmlString)
   {
      this.xmlString = xmlString;
   };

   this.whenParsingTheData = function()
   {
      this.result = this.apiFunction.parseXml(this.xmlString);
   };

   this.thenErrorIsSet = function(test)
   {
      test.notEqual(this.result.err, null, "No error set");
      test.done();
   };

   this.thenErrorShouldBe = function(test, expected)
   {
      test.deepEqual(this.result.err, expected, "Error not valid: " + JSON.stringify(this.result.err));
      test.done();
   };

   this.thenDataShouldBe = function(test, expected)
   {
      test.deepEqual(this.result.data, expected, "Data not valid: " + JSON.stringify(this.result.data));
      test.done();
   };

   this.thenCacheTimeShouldBe = function(test, expected)
   {
      test.equal(this.result.cacheTime, expected, "Invalid cache time: " + this.result.cacheTime + ", Error: "
            + this.result.error);
      test.done();
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   callback();
};

exports.testCacheTimeIsSet_WhenValidXml = function(test)
{
   var xmlString = fs.readFileSync('../resources/AccountApiKeyInfoData_ValidXml1.xml', 'utf8');

   this.fixture.givenAnXmlString(xmlString);

   this.fixture.whenParsingTheData();

   test.expect(1);
   this.fixture.thenCacheTimeShouldBe(test, 60 * 5);
};

exports.testErrorIsSet_WhenCacheDatesInvalid = function(test)
{
   var xmlString = fs.readFileSync('../resources/AccountApiKeyInfoData_InvalidDates1.xml', 'utf8');

   this.fixture.givenAnXmlString(xmlString);

   this.fixture.whenParsingTheData();

   test.expect(1);
   this.fixture.thenErrorIsSet(test);
};

exports.testErrorIsSet_WhenBogusXml = function(test)
{
   var xmlString = "<?xml version='1.0' encoding='UTF-8'?><missing></missin";

   this.fixture.givenAnXmlString(xmlString);

   this.fixture.whenParsingTheData();

   test.expect(1);
   this.fixture.thenErrorIsSet(test);
};

exports.testDataIsSetToError_WhenErrorMessageInXml = function(test)
{
   var xmlString = fs.readFileSync('../resources/ApiFunctionResult_AuthenticationFailure.xml', 'utf8');

   this.fixture.givenAnXmlString(xmlString);

   this.fixture.whenParsingTheData();

   test.expect(1);
   this.fixture.thenDataShouldBe(test,
   {
      err:
      {
         causes: [
         {
            code: 203,
            arr: 'Authentication failure.'
         } ]
      }
   });
};

exports.testCacheTimeIsSet_WhenError = function(test)
{
   var xmlString = fs.readFileSync('../resources/ApiFunctionResult_AuthenticationFailure.xml', 'utf8');
   var secondsPerDay = 60 * 60 * 24;

   this.fixture.givenAnXmlString(xmlString);

   this.fixture.whenParsingTheData();

   test.expect(1);
   this.fixture.thenCacheTimeShouldBe(test, secondsPerDay);
};
