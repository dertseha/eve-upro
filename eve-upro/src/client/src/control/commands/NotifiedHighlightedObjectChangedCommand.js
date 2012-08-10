upro.ctrl.cmd.NotifiedHighlightedObjectChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var object = notification.getBody();
      var highlightMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemHighlightMediator.NAME);

      highlightMediator.setHighlightSolarSystem("HoverPos", object instanceof upro.nav.SolarSystem ? object : null);
   }

});
