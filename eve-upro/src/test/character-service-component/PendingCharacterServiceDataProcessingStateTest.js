var PendingCharacterServiceDataProcessingState = require('../../character-service-component/PendingCharacterServiceDataProcessingState.js');

function Fixture()
{
   var self = this;

   this.sequenceCounter = 0;
   this.nextExpectedCallIndex = 0;
   this.state = new PendingCharacterServiceDataProcessingState(this);

   this.state.getActiveProcessingState = function()
   {
      return self;
   };

   this.getDummyCallback = function()
   {
      var self = this;
      var callback = function()
      {
         self.nextExpectedCallIndex++;
      };

      return callback;
   };

   this.applyCharacterData = this.getDummyCallback();
   this.processBroadcast = this.getDummyCallback();
   this.saveCharacterData = this.getDummyCallback();
   this.broadcastStateData = this.getDummyCallback();

   this.givenAPendingBroadcast = function()
   {
      var header = {};
      var body = {};

      this.state.processBroadcast(header, body);
   };

   this.whenFirstResultReturned = function(data)
   {
      this.state.onFirstDataResult(data);
   };

   this.getSequenceCallback = function(test, name)
   {
      var expectedIndex = this.sequenceCounter++;
      var self = this;

      var callback = function()
      {
         test.equal(self.nextExpectedCallIndex, expectedIndex, 'Wrong order for ' + name);
         self.nextExpectedCallIndex = expectedIndex + 1;
      };

      return callback;
   };

   this.expectingApplyCharacterDataCalledInSequence = function(test)
   {
      this.applyCharacterData = this.getSequenceCallback(test, 'applyCharacterData');
   };

   this.expectingSaveCharacterDataCalledInSequence = function(test)
   {
      this.saveCharacterData = this.getSequenceCallback(test, 'saveCharacterData');
   };

   this.expectingProcessBroadcastCalledInSequence = function(test)
   {
      this.processBroadcast = this.getSequenceCallback(test, 'processBroadcast');
   };

   this.expectingBroadcastStateDataCalledInSequence = function(test)
   {
      this.broadcastStateData = this.getSequenceCallback(test, 'broadcastStateData');
   };
}

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   callback();
};

exports.testFunctionsCalledInOrder_WhenFirstDataReturned = function(test)
{
   this.fixture.givenAPendingBroadcast();

   this.fixture.expectingApplyCharacterDataCalledInSequence(test);
   this.fixture.expectingProcessBroadcastCalledInSequence(test);
   this.fixture.expectingSaveCharacterDataCalledInSequence(test);
   this.fixture.expectingBroadcastStateDataCalledInSequence(test);

   this.fixture.whenFirstResultReturned(null);

   test.expect(4);
   test.done();
};
