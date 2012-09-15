upro.ctrl.cmd.NotifiedSharedObjectRemoveSharesRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var notifyBody = notification.getBody();

      notifyBody.sharedObject.getController().removeShares(notifyBody.sharedObject.getId(), notifyBody.interest);
   }
});
