/**
 * This command initializes the application - lets it enter its initial state. The model and view have been set up
 * before.
 */
upro.ctrl.cmd.InitApplicationCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionControl = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionControl.establishUplink();
   }

});
