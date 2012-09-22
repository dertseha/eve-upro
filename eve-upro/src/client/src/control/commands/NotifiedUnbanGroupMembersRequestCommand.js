upro.ctrl.cmd.NotifiedUnbanGroupMembersRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var notifyBody = notification.getBody();

      groupProxy.unbanMembers(notifyBody.id, notifyBody.characters);
   }
});
