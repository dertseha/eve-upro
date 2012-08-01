fs = require('fs');

ApiFunction = require('../../lib/functions/AccountApiKeyInfo.js');

function Fixture()
{
   this.apiFunction = new ApiFunction();

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
      test.notEqual(this.result.err, null);
      test.done();
   };

   this.thenDataShouldBe = function(test, expected)
   {
      test.equal(this.result.error, null, "Unexpected error: " + JSON.stringify(this.result.error));
      test.deepEqual(this.result.data, expected);
      test.done();
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   callback();
};

exports.testDataIsSet_WhenValidXml = function(test)
{
   var xmlString = fs.readFileSync('../resources/AccountApiKeyInfoData_ValidXml1.xml', 'utf8');

   this.fixture.givenAnXmlString(xmlString);

   this.fixture.whenParsingTheData();

   test.expect(2);
   this.fixture.thenDataShouldBe(test,
   {
      key:
      {
         accessMask: 0,
         type: 'Character',
         expires: null
      },
      characters: [
      {
         characterID: 149226614,
         characterName: 'Liu Ellens',
         corporationID: 264653893,
         corporationName: 'Blame The Bunny'
      } ]
   });
};
