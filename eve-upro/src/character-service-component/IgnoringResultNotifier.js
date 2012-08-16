var util = require('util');

var ResultNotifier = require('./ResultNotifier.js');

/**
 * A result notifier not doing anything
 */
function IgnoringResultNotifier()
{
   /** {@inheritDoc} */
   this.notifyRequestResults = function(notifyNames)
   {

   };
}
util.inherits(IgnoringResultNotifier, ResultNotifier);

module.exports = IgnoringResultNotifier;
