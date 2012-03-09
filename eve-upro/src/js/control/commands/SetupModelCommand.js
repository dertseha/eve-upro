
upro.ctrl.cmd.SetupModelCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      this.facade().registerProxy(new upro.model.proxies.InfoTypeFactoryProxy());
      this.facade().registerProxy(new upro.model.proxies.SessionControlProxy());
   }

});
