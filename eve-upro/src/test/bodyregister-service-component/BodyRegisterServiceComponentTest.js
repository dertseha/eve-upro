var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../../util/UuidFactory.js");
var busMessages = require('../../model/BusMessages.js');
var BodyRegisterServiceComponent = require('../../bodyregister-service-component/BodyRegisterServiceComponent.js');

var AbstractServiceComponentFixture = require('../TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

   this.bodyRegisterService = new BodyRegisterServiceComponent(
   {
      amqp: this.amqp,
      mongodb: this.mongodb
   });

}
util.inherits(Fixture, AbstractServiceComponentFixture);

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   fixture.bodyRegisterService.once('started', callback);
   fixture.bodyRegisterService.start();
};

exports.testFindBodyResultEmitted_WhenRequested = function(test)
{
   var sessionId = UuidFactory.v4();
   var searchText = 'est';

   this.fixture.givenStorageReturnsDataDelayed(BodyRegisterServiceComponent.CollectionNameCharacter, [
   {
      _id: 1234,
      data:
      {
         name: 'testChar'
      }
   } ]);
   this.fixture.givenStorageReturnsDataDelayed(BodyRegisterServiceComponent.CollectionNameCorporation, [
   {
      _id: 5678,
      data:
      {
         name: 'testCorp'
      }
   } ]);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestFindBodiesByName.name, sessionId,
   {
      searchText: searchText
   });

   this.fixture.whenStorageReturnsData(BodyRegisterServiceComponent.CollectionNameCorporation);
   this.fixture.whenStorageReturnsData(BodyRegisterServiceComponent.CollectionNameCharacter);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.FindBodyResult.name,
   {
      query:
      {
         searchText: searchText
      },
      characters: [
      {
         id: 1234,
         name: 'testChar'
      } ],
      corporations: [
      {
         id: 5678,
         name: 'testCorp'
      } ]
   }, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   test.expect(2);
   test.done();
};

exports.testGetNameOfBodyReplyEmitted_WhenRequested = function(test)
{
   var sessionId = UuidFactory.v4();
   var searchText = 'est';

   this.fixture.givenStorageReturnsDataDelayed(BodyRegisterServiceComponent.CollectionNameCharacter, [
   {
      _id: 1234,
      data:
      {
         name: 'testChar'
      }
   } ]);
   this.fixture.givenStorageReturnsDataDelayed(BodyRegisterServiceComponent.CollectionNameCorporation, [
   {
      _id: 5678,
      data:
      {
         name: 'testCorp'
      }
   } ]);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestGetNameOfBody.name, sessionId,
   {
      characters: [ 1234 ],
      corporations: [ 5678 ]
   });

   this.fixture.whenStorageReturnsData(BodyRegisterServiceComponent.CollectionNameCorporation);
   this.fixture.whenStorageReturnsData(BodyRegisterServiceComponent.CollectionNameCharacter);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GetNameOfBodyReply.name,
   {
      characters: [
      {
         id: 1234,
         name: 'testChar'
      } ],
      corporations: [
      {
         id: 5678,
         name: 'testCorp'
      } ]
   }, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   test.expect(2);
   test.done();
};
