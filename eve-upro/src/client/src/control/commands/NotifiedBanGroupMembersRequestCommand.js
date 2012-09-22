upro.ctrl.cmd.NotifiedBanGroupMembersRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var notifyBody = notification.getBody();

      groupProxy.banMembers(notifyBody.id, notifyBody.characters);
   }
});
