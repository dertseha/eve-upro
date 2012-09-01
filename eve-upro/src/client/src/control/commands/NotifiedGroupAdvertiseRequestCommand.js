upro.ctrl.cmd.NotifiedGroupAdvertiseRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var group = groupProxy.getSelectedGroup();
      var interest = notification.getBody();

      if ((interest.length > 0) && group && group.isClientOwner())
      {
         groupProxy.advertiseSelectedGroup(interest);
      }
   }

});
