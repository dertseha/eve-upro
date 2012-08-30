upro.ctrl.cmd.NotifiedGroupCreateRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var groupName = notification.getBody();

      if (groupName && (groupName.length > 3))
      {
         groupProxy.createGroup(groupName);
      }
   }

});
