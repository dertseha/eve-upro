upro.ctrl.cmd.NotifiedSharedObjectAddOwnerRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var notifyBody = notification.getBody();

      notifyBody.sharedObject.getController().addOwner(notifyBody.sharedObject.getId(), notifyBody.interest);
   }
});
