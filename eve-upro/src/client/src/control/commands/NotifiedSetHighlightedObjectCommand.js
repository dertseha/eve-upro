
upro.ctrl.cmd.NotifiedSetHighlightedObjectCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var proxy = this.facade().retrieveProxy(upro.model.proxies.UserViewDataProxy.NAME);

      proxy.setHighlightedObject(notification.getBody());
   }

});
