/**
 * This abstract mediator is the base for a side button
 */
upro.view.mediators.AbstractSideButtonMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, name, panelId, slotIndex, label)
   {
      $super(name, null);

      var self = this;

      this.panelId = panelId;
      this.slotIndex = slotIndex;
      this.label = label;

      this.commandAdapter = new upro.hud.SimpleCommandAdapter(function()
      {
         self.onCommand();
      }, label);
   },

   getIconCreator: function()
   {
      return null;
   },

   getCommandAdapter: function()
   {
      return this.commandAdapter;
   },

   onRegister: function()
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);
      var paperContext = uiMediator.getPaperContext(this.panelId);
      var baseOffset =
      {
         x: upro.hud.Button.getOffset[2](0).x,
         y: (upro.hud.Button.Scale * 2 + 1) * (this.slotIndex + 1)
      };

      this.menuEntry = new upro.hud.MenuEntry(this.getIconCreator(paperContext), this.getCommandAdapter());
      this.menuEntry.show(paperContext, baseOffset.x, baseOffset.y);
   }
});
