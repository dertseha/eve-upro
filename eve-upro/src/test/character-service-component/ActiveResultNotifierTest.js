var ActiveResultNotifier = require('../../character-service-component/ActiveResultNotifier.js');

function Fixture()
{
   this.notifier = new ActiveResultNotifier(this);

   this.saveCharacterData = function()
   {

   };

   this.expectingSaveCharacterDataCalled = function(test)
   {
      this.saveCharacterData = function()
      {
         test.ok(true);
      };
   };

   this.expectingNotifyCallbacks = function(test, notifyNames)
   {
      var called = [];
      var self = this;

      notifyNames.forEach(function(name)
      {
         self['broadcast' + name] = function()
         {
            test.ok(called.indexOf(name) < 0);
            called.push(name);
         };
      });
   };

   this.givenNotifyCallbacks = function(notifyNames)
   {
      var self = this;

      notifyNames.forEach(function(name)
      {
         self['broadcast' + name] = function()
         {

         };
      });
   };

   this.whenResultsAreToBeNotified = function(notifyNames)
   {
      this.notifier.notifyRequestResults(notifyNames);
   };

}

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   callback();
};

exports.testSaveCharacterDataCalled_WhenNotifyNamesProvided = function(test)
{
   var notifyNames = [ 'A', 'B' ];

   this.fixture.givenNotifyCallbacks(notifyNames);

   this.fixture.expectingSaveCharacterDataCalled(test);

   this.fixture.whenResultsAreToBeNotified(notifyNames);

   test.expect(1);
   test.done();
};

exports.testSaveCharacterDataNotCalled_WhenNoNotifyNamesProvided = function(test)
{
   var notifyNames = [];

   this.fixture.givenNotifyCallbacks(notifyNames);

   this.fixture.expectingSaveCharacterDataCalled(test);

   this.fixture.whenResultsAreToBeNotified(notifyNames);

   test.expect(0);
   test.done();
};

exports.testNotifyCallbacksCalled_WhenNotifyNamesProvided = function(test)
{
   var notifyNames = [ 'C', 'D' ];

   this.fixture.givenNotifyCallbacks(notifyNames);

   this.fixture.expectingNotifyCallbacks(test, notifyNames);

   this.fixture.whenResultsAreToBeNotified(notifyNames);

   test.expect(2);
   test.done();
};
