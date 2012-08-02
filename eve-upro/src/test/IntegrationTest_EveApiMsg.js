var util = require('util');

var ServiceControl = require('../components/ServiceControl.js');
var ComponentBuilder = require('../components/ComponentBuilder.js');

var AmqpComponentBuilder = require('../components/AmqpComponentBuilder.js');
var MongoDbComponentBuilder = require('../components/MongoDbComponentBuilder.js');

var EveApiMsgComponentBuilder = require('../eveapi-msg-component/EveApiMsgComponentBuilder.js');
var EveApiComponentBuilder = require('../eveapi-component/EveApiComponentBuilder.js');

var RemoteApi = require('../eveapi/lib/RemoteApi.js');

var TestClientComponentBuilder = require('./TestSupport/TestClientComponentBuilder.js');

function Fixture()
{
   this.serviceControl = new ServiceControl();

   this.remoteApi = new RemoteApi();
   this.remoteApi.get = function(uri, parameters, callback)
   {
      process.nextTick(function()
      {
         callback('Not Implemented');
      });
   };

   this.expectingReplyToBe = function(test, expectedCorrelationId, expectedMessage)
   {
      var client = this.serviceControl.getService('test-client');

      client.on('reply', function(message, correlationId)
      {
         test.equal(correlationId, expectedCorrelationId, 'Wrong correlation Id: ' + correlationId);
         test.deepEqual(message, expectedMessage);
         test.done();
      });
   };

   this.whenRequestingFunction = function(apiFunctionName, parameters, correlationId)
   {
      var msg = this.serviceControl.getService('eveapi-msg');
      var client = this.serviceControl.getService('test-client');

      msg.request(apiFunctionName, parameters, client.getResponseQueueName(), correlationId);
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   { // amqp
      var builder = new AmqpComponentBuilder();
      var options =
      {
         host: 'localhost'
      };

      builder.setOptions(options);
      this.fixture.serviceControl.setBuilder(builder);
   }
   { // mongodb
      var builder = new MongoDbComponentBuilder();
      var options =
      {
         db: 'eve-upro_test_eveapimsg'
      };

      builder.setOptions(options);
      this.fixture.serviceControl.setBuilder(builder);
   }
   { // eveapi-msg
      var builder = new EveApiMsgComponentBuilder();

      this.fixture.serviceControl.setBuilder(builder);
   }
   { // eveapi
      var builder = new EveApiComponentBuilder();
      var options =
      {
         apiHostName: 'apitest.eveonline.com'
      };

      builder.remoteApi = this.fixture.remoteApi;
      builder.setOptions(options);
      this.fixture.serviceControl.setBuilder(builder);
   }
   { // test client
      var builder = new TestClientComponentBuilder();

      this.fixture.serviceControl.setBuilder(builder);
   }

   this.fixture.serviceControl.on('started', function()
   {
      callback();
   });
   this.fixture.serviceControl.start();
};

exports.tearDown = function(callback)
{
   this.fixture.serviceControl.tearDown();

   callback();
};

exports.testResultShouldBeAnError_WhenQueryingUnknownFunction = function(test)
{
   var functionName = 'NonExistingFunction';
   var correlationId = 1234;

   this.fixture.expectingReplyToBe(test, correlationId,
   {
      response:
      {
         err:
         {
            causes: [
            {
               code: 404,
               message: 'Unknown API function [' + functionName + ']'
            } ]
         }
      }
   });

   test.expect(2);
   this.fixture.whenRequestingFunction(functionName,
   {
      parameter1: 'abcd'
   }, correlationId);
};

exports.testResultShouldBeAnError_WhenRemoteApiReturnsError = function(test)
{
   var functionName = 'AccountApiKeyInfo';
   var correlationId = 1234;

   this.fixture.expectingReplyToBe(test, correlationId,
   {
      response:
      {
         err:
         {
            causes: [
            {
               code: 500,
               message: 'Server Error'
            } ]
         }
      }
   });

   test.expect(2);
   this.fixture.whenRequestingFunction(functionName,
   {
      parameter1: 'abcd'
   }, correlationId);
};
