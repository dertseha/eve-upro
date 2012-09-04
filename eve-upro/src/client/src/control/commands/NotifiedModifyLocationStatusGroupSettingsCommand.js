upro.ctrl.cmd.NotifiedModifyLocationStatusGroupSettingsCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var trackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
      var notifyBody = notification.getBody();

      trackerProxy.modifyLocationStatusGroup(notifyBody.groupId, notifyBody);
   }
});
