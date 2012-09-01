upro.ctrl.cmd.NotifiedGroupRemoveAdvertisementRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var group = groupProxy.getSelectedGroup();
      var interest = notification.getBody();

      if ((interest.length > 0) && group && group.isClientAllowedControl())
      {
         groupProxy.removeAdvertisementsOfSelectedGroup(interest);
      }
   }

});
