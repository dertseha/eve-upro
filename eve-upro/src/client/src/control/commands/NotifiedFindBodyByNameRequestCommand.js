upro.ctrl.cmd.NotifiedFindBodyByNameRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var bodyRegisterProxy = this.facade().retrieveProxy(upro.model.proxies.BodyRegisterProxy.NAME);
      var searchText = notification.getBody();

      if (upro.model.proxies.BodyRegisterProxy.isValidNameSearchText(searchText))
      {
         bodyRegisterProxy.findBodiesByName(searchText);
      }
   }

});
