/**
 * This mediator covers the hide UI button
 */
upro.view.mediators.HideUiSideButtonMediator = Class.create(upro.view.mediators.AbstractSideButtonMediator,
{
   initialize: function($super, panelId)
   {
      $super(upro.view.mediators.HideUiSideButtonMediator.NAME, panelId, 0, upro.res.text.Lang
            .format("view.setUiInvisible"));

      this.getCommandAdapter().setActive(true);
   },

   getIconCreator: function(context)
   {
      var iconCreator = new upro.hud.IconCreatorFactory(context, upro.res.menu.IconData.Windows);

      return iconCreator.getIconCreator();
   },

   onCommand: function()
   {
      this.facade().sendNotification(upro.app.Notifications.SetUserInterfaceInvisible);
   }
});

upro.view.mediators.HideUiSideButtonMediator.NAME = "HideUiSideButton";
