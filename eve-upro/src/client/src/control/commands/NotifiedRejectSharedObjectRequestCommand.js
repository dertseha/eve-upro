upro.ctrl.cmd.NotifiedRejectSharedObjectRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionControlProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var notifyBody = notification.getBody();

      sessionControlProxy.rejectSharedObject(notifyBody.objectType, notifyBody.id);
   }
});
