
upro.ctrl.cmd.NotifiedHighlightedObjectChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var object = notification.getBody();
      var highlightMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemHighlightMediator.NAME);
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);

      if (object instanceof upro.nav.SolarSystem)
      {
         var realPos = sceneMediator.projectSolarSystem(object);

         if (realPos)
         {
            highlightMediator.setHighlight(object, realPos);
         }
         else
         {
            highlightMediator.clearHighlight();
         }
      }
      else
      {
         highlightMediator.clearHighlight();
      }
   }

});
