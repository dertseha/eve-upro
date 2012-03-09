/**
 * A timer waits a certain time until it calls a callback. Reason for not using prototype's PeriodicalExecutor: - Having
 * a private one is easier for testing (should it be needed)
 */
upro.sys.Timer = Class.create(
{
   initialize: function(callback)
   {
      this.callback = callback;
      this.context = null;
      this.executing = false;
   },

   /**
    * Starts the timer with given millisecond interval Call is ignored if already running
    * 
    * @param msec milliseconds to wait
    */
   start: function(msec)
   {
      if (this.context == null)
      {
         this.context = this.startInternal(this.callbackInternal.bind(this), msec);
      }
   },

   /**
    * Internal start function
    */
   startInternal: function(code, msec)
   {
      return null;
   },

   /**
    * Stops (aborts) any pending call Call is ignored if timer is not running
    */
   stop: function()
   {
      if (this.context != null)
      {
         var context = this.context;

         this.context = null;
         this.stopInternal(context);
      }
   },

   /**
    * Internal stop function
    */
   stopInternal: function(context)
   {

   },

   /**
    * Internal callback function
    */
   callbackInternal: function()
   {
      if (!this.executing)
      {
         this.context = this.restartInternal(this.context);
         try
         {
            this.executing = true;
            this.callback();
            this.executing = false;
         }
         catch (e)
         {
            this.executing = false;
            throw e;
         }
      }
   },

   restartInternal: function(context)
   {
      return context;
   }

});

/**
 * Returns a timer object calling the callback periodically
 * 
 * @return a timer object calling the callback periodically
 */
upro.sys.Timer.getIntervalTimer = function(callback)
{
   var timer = new upro.sys.Timer(callback);

   timer.startInternal = function(code, msec)
   {
      return window.setInterval(code, msec);
   };
   timer.stopInternal = function(context)
   {
      window.clearInterval(context);
   };

   return timer;
};

/**
 * Returns a timer object calling the callback once. Can be restarted.
 * 
 * @return a timer object calling the callback once
 */
upro.sys.Timer.getSingleTimer = function(callback)
{
   var timer = new upro.sys.Timer(callback);

   timer.startInternal = function(code, msec)
   {
      return window.setTimeout(code, msec);
   };
   timer.stopInternal = function(context)
   {
      window.clearTimeout(context);
   };
   timer.restartInternal = function(context)
   {
      return null;
   };

   return timer;
};
