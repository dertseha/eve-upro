fs = require('fs');

ApiFunction = require('../../lib/functions/CorpCorporationSheet.js');

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

exports.testDataIsSet_WhenSimpleValidXml = function(test)
{
   var xmlString = fs.readFileSync('../resources/CorpCorporationSheet_Simple_ValidXml1.xml', 'utf8');

   this.fixture.givenAnXmlString(xmlString);

   this.fixture.whenParsingTheData();

   test.expect(2);
   this.fixture.thenDataShouldBe(test,
   {
      corporation:
      {
         corporationId: 264653893,
         corporationName: 'Blame The Bunny',
         ceoId: 149226614,
         ceoName: 'Liu Ellens',
         allianceId: 99000290,
         allianceName: 'The Dark Nation'
      }
   });
};

exports.testDataIsSet_WhenSimpleValidXml_NoAlliance = function(test)
{
   var xmlString = fs.readFileSync('../resources/CorpCorporationSheet_SimpleNoAlliance_ValidXml1.xml', 'utf8');

   this.fixture.givenAnXmlString(xmlString);

   this.fixture.whenParsingTheData();

   test.expect(2);
   this.fixture.thenDataShouldBe(test,
   {
      corporation:
      {
         corporationId: 1000046,
         corporationName: 'Sebiestor Tribe',
         ceoId: 3004477,
         ceoName: 'Karin Midular'
      }
   });
};
