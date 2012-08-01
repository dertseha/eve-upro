var util = require('util');

var eveapi = require('../lib/index.js');
var ApiFunction = require('../lib/ApiFunction.js');

function DummyApiFunction(collectionName)
{
   DummyApiFunction.super_.call(this);

   this.collectionName = collectionName;

   this.getCollectionName = function()
   {
      return this.collectionName;
   };
}
util.inherits(DummyApiFunction, ApiFunction);

function Fixture()
{
   this.storage = new eveapi.EveApiStorage();
   this.callback = function()
   {
   };

   this.apiFunctions = {};

   this.givenADummyApiFunction = function(name, collectionName)
   {
      this.apiFunctions[name] = new DummyApiFunction(collectionName);
   };

   this.expectingCallbackToBeCalled = function(test, expectedError)
   {
      this.callback = function(err)
      {
         test.deepEqual(err, expectedError, 'Wrong error: ' + JSON.stringify(err));
         test.done();
      };
   };

   this.givenStorageNotExpectingToBeCalled = function(test)
   {
      this.storage.defineCollection = function(collectionName, callback)
      {
         test.ok(false, "callback not expected");
      };
   };

   this.givenACountingStorage = function()
   {
      var self = this;

      this.callCount = 0;
      this.storage.defineCollection = function(collectionName, callback)
      {
         self.callCount++;
      };
   };

   this.givenAWorkingStorage = function()
   {
      this.storage.defineCollection = function(collectionName, callback)
      {
         process.nextTick(function()
         {
            callback(null);
         });
      };
   };

   this.givenAFailingStorage = function(failureFunctions)
   {
      this.storage.defineCollection = function(collectionName, callback)
      {
         var entry = failureFunctions[collectionName];

         process.nextTick(function()
         {
            callback(entry);
         });
      };
   };

   this.whenRequestingInitialization = function()
   {
      eveapi.initStorage(this.storage, this.callback, this.apiFunctions);
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   callback();
};

exports.testStorageIsNotTouched_WhenNoFunctionsRegistered = function(test)
{
   this.fixture.givenStorageNotExpectingToBeCalled();

   test.expect(0);
   this.fixture.whenRequestingInitialization();

   test.done();
};

exports.testStorageIsCalled_WhenRequested = function(test)
{
   this.fixture.givenADummyApiFunction('Func1', 'Collection1');
   this.fixture.givenADummyApiFunction('Func2', 'Collection2');
   this.fixture.givenACountingStorage();

   this.fixture.whenRequestingInitialization();

   test.expect(1);
   test.equal(this.fixture.callCount, 2);
   test.done();
};

exports.testCallbackIsCalled_WhenAllIsDoneOk = function(test)
{
   this.fixture.givenADummyApiFunction('Func1', 'Collection1');
   this.fixture.givenADummyApiFunction('Func2', 'Collection2');
   this.fixture.givenAWorkingStorage();

   this.fixture.expectingCallbackToBeCalled(test, null);

   test.expect(1);
   this.fixture.whenRequestingInitialization();
};

exports.testCallbackIsCalledWithError_WhenFirstHasFailure = function(test)
{
   this.fixture.givenADummyApiFunction('Func1', 'Collection1');
   this.fixture.givenADummyApiFunction('Func2', 'Collection2');
   this.fixture.givenAFailingStorage(
   {
      Collection1: 'error1'
   });

   this.fixture.expectingCallbackToBeCalled(test, [ 'error1' ]);

   test.expect(1);
   this.fixture.whenRequestingInitialization();
};

exports.testCallbackIsCalledWithError_WhenSecondHasFailure = function(test)
{
   this.fixture.givenADummyApiFunction('Func1', 'Collection1');
   this.fixture.givenADummyApiFunction('Func2', 'Collection2');
   this.fixture.givenAFailingStorage(
   {
      Collection2: 'error2'
   });

   this.fixture.expectingCallbackToBeCalled(test, [ 'error2' ]);

   test.expect(1);
   this.fixture.whenRequestingInitialization();
};

exports.testCallbackIsCalledWithError_WhenAllHaveFailure = function(test)
{
   this.fixture.givenADummyApiFunction('Func1', 'Collection1');
   this.fixture.givenADummyApiFunction('Func2', 'Collection2');
   this.fixture.givenAFailingStorage(
   {
      Collection1: 'error1',
      Collection2: 'error2'
   });

   this.fixture.expectingCallbackToBeCalled(test, [ 'error1', 'error2' ]);

   test.expect(1);
   this.fixture.whenRequestingInitialization();
};
