var util = require('util');

var ServiceControl = require('../components/ServiceControl.js');
var ComponentBuilder = require('../components/ComponentBuilder.js');

var AmqpComponentBuilder = require('../components/AmqpComponentBuilder.js');

function Fixture()
{
   this.controls = [];
   this.started = 0;

   this.createAmqpServiceControl = function()
   {
      var serviceControl = new ServiceControl();

      { // amqp
         var builder = new AmqpComponentBuilder();
         var options =
         {
            host: 'localhost'
         };

         builder.setOptions(options);
         serviceControl.setBuilder(builder);
      }

      this.controls.push(serviceControl);
   };

   this.startControls = function(callback)
   {
      var self = this;

      this.started = 0;
      this.controls.forEach(function(control)
      {
         control.on('started', function()
         {
            self.onStartProgress(callback);
         });
         control.start();
      });
   };

   this.onStartProgress = function(callback)
   {
      this.started++;
      if (this.started == this.controls.length)
      {
         // console.log('started');
         callback();
      }
   };

   this.stopControls = function()
   {
      this.controls.forEach(function(control)
      {
         control.tearDown();
      });
   };

   this.expectingMessage = function(test, index, event, expectedHeader, expectedBody)
   {
      var serviceControl = this.controls[index];
      var amqp = serviceControl.getService('amqp');

      amqp.on(event, function(header, body)
      {
         test.deepEqual(header, expectedHeader, 'Wrong Header');
         test.deepEqual(body, expectedBody, 'Wrong Body');
         test.done();
      });
   };

   this.expectingMessageForAll = function(test, expectedHeader, expectedBody)
   {
      var total = this.controls.length;
      var returned = 0;

      for ( var i = 0; i < total; i++)
      {
         var serviceControl = this.controls[i];
         var amqp = serviceControl.getService('amqp');

         amqp.on('broadcast:' + expectedHeader.type, function(header, body)
         {
            test.deepEqual(header, expectedHeader, 'Wrong Header');
            test.deepEqual(body, expectedBody, 'Wrong Body');
            returned++;
            if (returned == total)
            {
               test.done();
            }
         });
      }
   };

   this.whenBroadcastingMessage = function(index, header, body)
   {
      var serviceControl = this.controls[index];
      var amqp = serviceControl.getService('amqp');

      amqp.broadcast(header, body);
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   this.fixture.createAmqpServiceControl();
   this.fixture.createAmqpServiceControl();

   this.fixture.startControls(callback);
};

exports.tearDown = function(callback)
{
   this.fixture.stopControls();

   callback();
};

exports.testMessageShouldBeReceivedBySecond_WhenBroadcastedByFirst = function(test)
{
   var header =
   {
      type: 'TestMessage'
   };
   var body =
   {
      data1: 1234,
      data2: 'test'
   };

   this.fixture.expectingMessage(test, 1, 'broadcast', header, body);

   test.expect(2);
   this.fixture.whenBroadcastingMessage(0, header, body);
};

exports.testMessageShouldBeReceivedByFirst_WhenBroadcastedBySecond = function(test)
{
   var header =
   {
      type: 'TestMessage'
   };
   var body =
   {
      data1: 1234,
      data2: 'test'
   };

   this.fixture.expectingMessage(test, 0, 'broadcast', header, body);

   test.expect(2);
   this.fixture.whenBroadcastingMessage(1, header, body);
};

exports.testMessageShouldBeReceivedByFirst_WhenBroadcastedByFirst = function(test)
{
   var header =
   {
      type: 'TestMessage'
   };
   var body =
   {
      data1: 1234,
      data2: 'test'
   };

   this.fixture.expectingMessage(test, 0, 'broadcast', header, body);

   test.expect(2);
   this.fixture.whenBroadcastingMessage(0, header, body);
};

exports.testMessageShouldBeReceivedByAll_WhenBroadcastedByFirst = function(test)
{
   var header =
   {
      type: 'TestMessage'
   };
   var body =
   {
      data1: 1234,
      data2: 'test'
   };

   this.fixture.expectingMessageForAll(test, header, body);

   test.expect(4);
   this.fixture.whenBroadcastingMessage(0, header, body);
};

exports.testMessageShouldBeReceived_WhenListenedOnSpecifically = function(test)
{
   var header =
   {
      type: 'TestMessage'
   };
   var body =
   {
      data1: 1234,
      data2: 'test'
   };

   this.fixture.expectingMessage(test, 0, 'broadcast:TestMessage', header, body);

   test.expect(2);
   this.fixture.whenBroadcastingMessage(0, header, body);
};
