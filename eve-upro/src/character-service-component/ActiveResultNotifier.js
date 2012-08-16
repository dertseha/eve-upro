var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var ResultNotifier = require('./ResultNotifier.js');

/**
 * An active result notifier. It first requests the service data to save the character data and then calls all broadcast
 * methods identified by the notify names.
 * 
 * @param serviceData the CharacterServiceData to use
 */
function ActiveResultNotifier(serviceData)
{
   this.serviceData = serviceData;

   /** {@inheritDoc} */
   this.notifyRequestResults = function(notifyNames)
   {
      var self = this;

      this.serviceData.saveCharacterData();
      notifyNames.forEach(function(notifyName)
      {
         var handler = self.serviceData['broadcast' + notifyName];

         handler.call(self.serviceData);
      });
   };
}
util.inherits(ActiveResultNotifier, ResultNotifier);

module.exports = ActiveResultNotifier;
