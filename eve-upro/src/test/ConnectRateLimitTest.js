var ConnectRateLimiter = require('../util/connect-rate-limit.js');

function Fixture()
{
   var self = this;

   this.requestHandled = [];
   this.requestsRejected = [];
   this.limiterInfo =
   {
      queue: [],
      limiter:
      {
         removeTokens: function(count, callback)
         {
            return self.onRemoveTokens(count, callback);
         }
      }
   };

   this.onNext = function(err, id)
   {
      if (err)
      {
         this.requestsRejected.push(id + ':' + err);
      }
      else
      {
         this.requestHandled.push(id);
      }
   };

   this.onProvideLimiter = function(req)
   {
      return this.limiterInfo;
   };

   this.givenLimiterIsExhausted = function()
   {
      this.onRemoveTokens = function(count, callback)
      {
         this.storedCallback = callback;

         return false;
      };
   };

   this.givenLimiterIsCapable = function()
   {
      this.onRemoveTokens = function(count, callback)
      {
         callback();

         return true;
      };
   };

   this.whenLimiterBecomesCapable = function()
   {
      this.givenLimiterIsCapable();
      this.storedCallback();
   };

   this.givenAMiddleware = function(hardLimit)
   {
      var options =
      {
         hardLimit: hardLimit,
         callbackDeferrer: function(callback)
         {
            callback();
         }
      };

      this.middleware = new ConnectRateLimiter(function(req)
      {
         return self.onProvideLimiter(req);
      }, options);
   };

   this.givenQueueIsNotEmpty = function()
   {
      this.limiterInfo.queue.push(function()
      {
      });
   };

   this.givenQueueEntry = function(id)
   {
      this.whenRequestIsProcessed(id);
   };

   this.expectingLimiterNotQueried = function(test)
   {
      this.onRemoveTokens = function(count, callback)
      {
         test.equal(true, false);
         test.done();

         return false;
      };
   };

   this.whenRequestIsProcessed = function(id)
   {
      var self = this;
      var req = {};
      var res =
      {
         send: function(status)
         {
            self.onNext(status, id);
         }
      };
      var next = function()
      {
         self.onNext(null, id);
      };

      this.middleware(req, res, next);
   };

   this.thenNextShouldHaveBeenCalled = function(test, expectedIds)
   {
      test.deepEqual(this.requestHandled, expectedIds);
   };

   this.thenNextShouldNotHaveBeenCalled = function(test)
   {
      test.equal(this.requestHandled.length, 0);
   };

   this.thenLimiterQueueShouldHaveEntries = function(test, expectedCount)
   {
      test.equal(this.limiterInfo.queue.length, expectedCount);
   };

   this.thenRequestShouldHaveBeenRejected = function(test, expectedIds)
   {
      test.deepEqual(this.requestsRejected, expectedIds);
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   callback();
};

exports.testNextShouldHaveBeenCalled_WhenLimiterIsCapable = function(test)
{
   this.fixture.givenLimiterIsCapable();
   this.fixture.givenAMiddleware();

   this.fixture.whenRequestIsProcessed(1);

   this.fixture.thenNextShouldHaveBeenCalled(test, [ 1 ]);

   test.done();
};

exports.testNextShouldNotHaveBeenCalled_WhenLimiterIsExhausted = function(test)
{
   this.fixture.givenLimiterIsExhausted();
   this.fixture.givenAMiddleware();

   this.fixture.whenRequestIsProcessed();

   this.fixture.thenNextShouldNotHaveBeenCalled(test);

   test.done();
};

exports.testNextShouldBeQueuedUp_WhenLimiterIsExhausted = function(test)
{
   this.fixture.givenLimiterIsExhausted();
   this.fixture.givenAMiddleware();

   this.fixture.whenRequestIsProcessed(1);

   this.fixture.thenLimiterQueueShouldHaveEntries(test, 1);

   test.done();
};

exports.testNextShouldBeQueuedUpImmediately_WhenQueueNotEmpty = function(test)
{
   this.fixture.givenAMiddleware();
   this.fixture.givenQueueIsNotEmpty();

   this.fixture.expectingLimiterNotQueried(test);
   this.fixture.whenRequestIsProcessed(1);

   this.fixture.thenLimiterQueueShouldHaveEntries(test, 2);

   test.done();
};

exports.testNextShouldBeCalled_WhenLimiterBecomesAvailableAgain = function(test)
{
   this.fixture.givenLimiterIsExhausted();
   this.fixture.givenAMiddleware();
   this.fixture.givenQueueEntry(1);

   this.fixture.whenLimiterBecomesCapable();

   this.fixture.thenNextShouldHaveBeenCalled(test, [ 1 ]);

   test.done();
};

exports.testPendingNextShouldBeCalledInOrder_WhenLimiterBecomesAvailableAgain = function(test)
{
   this.fixture.givenLimiterIsExhausted();
   this.fixture.givenAMiddleware();
   this.fixture.givenQueueEntry(1);
   this.fixture.givenQueueEntry(2);
   this.fixture.givenQueueEntry(3);

   this.fixture.whenLimiterBecomesCapable();

   this.fixture.thenNextShouldHaveBeenCalled(test, [ 1, 2, 3 ]);

   test.done();
};

exports.testTooManyRequestsStatusShouldBeReturned_WhenRequestingAtHardLimit = function(test)
{
   this.fixture.givenLimiterIsExhausted();
   this.fixture.givenAMiddleware(2);
   this.fixture.givenQueueEntry(1);
   this.fixture.givenQueueEntry(2);

   this.fixture.whenRequestIsProcessed(3);

   this.fixture.thenRequestShouldHaveBeenRejected(test, [ '3:429' ]);

   test.done();
};
