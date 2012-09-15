upro.ctrl.cmd.NotifiedSharedObjectRemoveOwnerRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var notifyBody = notification.getBody();

      notifyBody.sharedObject.getController().removeOwner(notifyBody.sharedObject.getId(), notifyBody.interest);
   }
});
