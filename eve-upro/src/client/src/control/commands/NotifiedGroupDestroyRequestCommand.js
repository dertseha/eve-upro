upro.ctrl.cmd.NotifiedGroupDestroyRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);

      groupProxy.destroyGroup(notification.getBody());
   }
});
