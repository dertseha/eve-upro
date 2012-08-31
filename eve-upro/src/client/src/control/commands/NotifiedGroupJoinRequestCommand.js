upro.ctrl.cmd.NotifiedGroupJoinRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);

      groupProxy.joinGroup(notification.getBody());
   }
});
