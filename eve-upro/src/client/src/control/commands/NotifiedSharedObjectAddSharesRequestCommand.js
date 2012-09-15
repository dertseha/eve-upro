upro.ctrl.cmd.NotifiedSharedObjectAddSharesRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var notifyBody = notification.getBody();

      notifyBody.sharedObject.getController().addShares(notifyBody.sharedObject.getId(), notifyBody.interest);
   }
});
