/**
 * This IGB implementation wraps another one and passes on requests on a delayed queue basis. Queue entries are handled
 * sequentially.
 */
upro.eve.ThrottledInGameBrowser = Class.create(upro.eve.NullInGameBrowser,
{
   /**
    * Initializer
    * 
    * @param igb the InGameBrowser object to wrap
    * @param timeoutMSec how long to wait until the next call will be executed
    */
   initialize: function($super, igb, timeoutMSec)
   {
      $super();

      var self = this;

      this.igb = igb;
      this.timeoutMSec = timeoutMSec;

      this.queue = [];
      this.free = true;

      this.timer = upro.sys.Timer.getSingleTimer(function()
      {
         self.onTimer();
      });

      this.startTimer(); // to ensure a quick creation in sequence doesn't end up spamming
   },

   /**
    * Timer callback. Processes one queue entry until queue is empty and time has passed once to set free again.
    */
   onTimer: function()
   {
      if (this.queue.length > 0)
      {
         this.processFirstQueueEntry();
         this.startTimer();
      }
      else
      {
         this.free = true;
      }
   },

   /**
    * Processes the first queue entry
    */
   processFirstQueueEntry: function()
   {
      var entry = this.queue[0];

      this.queue = this.queue.slice(1);
      try
      {
         this.igb[entry.methodName].apply(this.igb, entry.arguments);
      }
      catch (ex)
      {
         upro.sys.log("Failed to execute IGB function [" + entry.methodName + "] - exception: " + ex);
      }
   },

   /**
    * Starts timer to process next request or become free again
    */
   startTimer: function()
   {
      this.free = false;
      this.timer.start(this.timeoutMSec);
   },

   /**
    * Queues up one request and tries to perform it immediately if possible
    * 
    * @param methodName the name of the method to call on the wrapped IGB object
    * @param requestArguments the arguments to pass on
    */
   request: function(methodName, requestArguments)
   {
      var entry =
      {
         methodName: methodName,
         arguments: requestArguments
      };

      this.queue.push(entry);
      if (this.free)
      {
         this.processFirstQueueEntry();
         this.startTimer();
      }
   },

   /** {@inheritDoc} */
   addWaypoint: function()
   {
      this.request('addWaypoint', arguments);
   },

   /** {@inheritDoc} */
   clearAllWaypoints: function()
   {
      this.request('clearAllWaypoints', arguments);
   }
});
