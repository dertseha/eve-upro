/**
 * Abstract mediator class that provides some automated reflection
 * functionality regarding notifications.
 */
upro.view.mediators.AbstractMediator = Class.create(Mediator,
{
   /**
    * Lists the notifications this mediator is interested in.
    * The method iterates through the objects' methods and returns the stripped
    * name if it has the HANDLER_NAME_PREFIX.
    * @return an array of notification names
    */
   listNotificationInterests: function()
   {
      var names = [];
      var prefix = upro.view.mediators.AbstractMediator.HANDLER_NAME_PREFIX;

      for (var memberName in this)
      {
         if ((memberName.length > prefix.length) && (memberName.substr(0, prefix.length) == prefix))
         {
            names.push(memberName.substr(prefix.length));
         }
      }

      return names;
   },

   /**
    * Tries to handle given notification.
    */
   handleNotification: function(note)
   {
      var name = upro.view.mediators.AbstractMediator.HANDLER_NAME_PREFIX + note.getName();

      if (this[name] != undefined)
      {
         this[name](note.getBody());
      }
   }
});

/** Name prefix for a notification handler */
upro.view.mediators.AbstractMediator.HANDLER_NAME_PREFIX = "onNotify";
