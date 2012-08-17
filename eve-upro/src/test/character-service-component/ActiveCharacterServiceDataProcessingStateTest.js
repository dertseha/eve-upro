var Character = require('../../character-agent-component/Character.js');
var ActiveCharacterServiceDataProcessingState = require('../../character-service-component/ActiveCharacterServiceDataProcessingState.js');

function Fixture()
{
   this.character = new Character();
   this.state = new ActiveCharacterServiceDataProcessingState(this);

   this.givenCharacterHasSessionInfo = function(sessionId, responseQueue)
   {
      this.character.addClientSession(sessionId, responseQueue);
   };

   this.givenProcessMethod = function(name, returnValue)
   {
      this['process' + name] = function(header, body)
      {
         return returnValue;
      };
   };

   this.expectingBroadcastStateDataCalled = function(test, expectedInterest, expectedResponseQueue)
   {
      this.broadcastStateData = function(interest, responseQueue)
      {
         test.deepEqual(interest, expectedInterest);

         test.equal(responseQueue, expectedResponseQueue);
      };
   };

   this.expectingProcessCalled = function(test, expectedHeader, expectedBody, returnValue)
   {
      this['process' + expectedHeader.type] = function(header, body)
      {
         test.deepEqual(header, expectedHeader);
         test.deepEqual(body, expectedBody);

         return returnValue;
      };
   };

   this.expectingNotifierCalled = function(test, expectedNotifyNames)
   {
      var notifier =
      {
         notifyRequestResults: function(notifyNames)
         {
            test.deepEqual(notifyNames, expectedNotifyNames);
         }
      };

      this.state.resultNotifier = notifier;
   };
}

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   callback();
};

exports.testBroadcastStateDataRequested_WhenSessionAdded = function(test)
{
   var sessionId = '1234';
   var responseQueue = 'abcd';

   this.fixture.givenCharacterHasSessionInfo(sessionId, responseQueue);

   this.fixture.expectingBroadcastStateDataCalled(test, [
   {
      scope: 'Session',
      id: sessionId
   } ], responseQueue);

   test.expect(2);
   this.fixture.state.onCharacterSessionAdded(sessionId);

   test.done();
};

exports.testProcessMethodCalled_WhenBroadcastProcessed = function(test)
{
   var header =
   {
      type: 'abcd',
      info: 1234
   };
   var body =
   {
      value: 'testbody'
   };

   this.fixture.expectingProcessCalled(test, header, body);

   test.expect(2);
   this.fixture.state.processBroadcast(header, body);

   test.done();
};

exports.testNotifierCalledWithProcessResult_WhenBroadcastProcessed = function(test)
{
   var result = [ '1234', 'abcd' ];
   var header =
   {
      type: 'abcd',
      info: 1234
   };
   var body =
   {
      value: 'testbody'
   };

   this.fixture.givenProcessMethod(header.type, result);

   this.fixture.expectingNotifierCalled(test, result);

   test.expect(1);
   this.fixture.state.processBroadcast(header, body);

   test.done();
};
