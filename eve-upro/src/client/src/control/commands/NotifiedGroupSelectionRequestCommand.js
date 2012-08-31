upro.ctrl.cmd.NotifiedGroupSelectionRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);

      groupProxy.setSelectedGroup(notification.getBody());
   }
});
