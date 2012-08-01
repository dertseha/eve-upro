var util = require('util');
var EventEmitter = require('events').EventEmitter;

/**
 * A component is a startable service providing functionality after some (asynchronous) initialization phase.
 */
function Component()
{
   Component.super_.call(this);

   /**
    * Requests to start the component. A successful start must be notified by emitting 'started' (see onStarted() ).
    */
   this.start = function()
   {
      this.onStarted();
   };

   /**
    * Hard shut down the component - free external resources and abort pending requests, but don't issue any new
    * requests; Don't rely on dependencies.
    */
   this.tearDown = function()
   {

   };

   /**
    * The 'started' handler - will emit 'started'.
    */
   this.onStarted = function()
   {
      this.emit('started');
   };

}
util.inherits(Component, EventEmitter);

module.exports = Component;
