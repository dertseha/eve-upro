upro.view.mediators.InGameBrowserMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.InGameBrowserMediator.NAME, new upro.eve.NullInGameBrowser());

      this.lastReportedRouteIndex = -1;
   },

   onRegister: function()
   {
      var igb = upro.eve.getInGameBrowser();

      this.setViewComponent(igb);
   },

   getLastReportedRouteIndex: function()
   {
      return this.lastReportedRouteIndex;
   },

   setLastReportedRouteIndex: function(value)
   {
      this.lastReportedRouteIndex = value;
   }

});

upro.view.mediators.InGameBrowserMediator.NAME = "IGB";
