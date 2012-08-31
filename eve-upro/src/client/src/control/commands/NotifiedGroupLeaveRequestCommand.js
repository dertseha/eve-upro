upro.ctrl.cmd.NotifiedGroupLeaveRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);

      groupProxy.leaveGroup(notification.getBody());
   }
});
