/**
 * This is the debugging panel. For now it only shows a text box containing the catched debug messages.
 */
upro.view.mediators.DebugPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath)
   {
      $super(upro.view.mediators.DebugPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
   },

   onRegister: function()
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);
      var panel = $(this.panelId);
      var dimension = panel.getDimensions();

      this.uiBase = uki(
      {
         view: 'MultilineTextField',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'left top right bottom',
         id: 'debugPanel_base',
         background: 'theme(box)'
      });
      this.uiBase.attachTo(panel);

      var base = uki('#debugPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, 4, upro.res.menu.IconData.Debug, upro.res.text.Lang
            .format("panels.debug.menuLabel"), "debug", base);
   },

   onNotifyDebugMessage: function(text)
   {
      var base = uki('#debugPanel_base');
      var viewText = base.value();

      if (viewText.length > 10000)
      {
         viewText = "Cleared old text";
      }
      if (viewText.length > 0)
      {
         viewText += "\n";
      }
      viewText += text;
      base.value(viewText);
   }

});

upro.view.mediators.DebugPanelMediator.NAME = "DebugPanel";
