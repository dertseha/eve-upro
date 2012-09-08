/**
 * This is the session panel
 */
upro.view.mediators.SessionPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.SessionPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.logoutButton = null;
   },

   onRegister: function()
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);
      var panel = $(this.panelId);
      var dimension = panel.getDimensions();
      var halfWidth = dimension.width / 2;

      this.uiBase = uki(
      {
         view: 'Box',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'left top right bottom',
         id: 'sessionPanel_base',
         background: 'theme(simpleFrame)',
         childViews: [
         {
            view: 'Button',
            rect: (halfWidth / 2) + ' ' + (dimension.height / 4) + ' ' + (halfWidth) + ' 25',
            anchors: 'top left right',
            text: upro.res.text.Lang.format("panels.session.logout.command"),
            id: 'session_logout'
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#sessionPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.Session,
            upro.res.text.Lang.format("panels.session.menuLabel"), "session", base);

      this.logoutButton = uki('#session_logout');
      this.logoutButton.bind('click', this.onLogoutButton.bind(this));
   },

   onLogoutButton: function()
   {
      upro.sys.log("Logout request received");
      window.location.href = "/logout";
   }

});

upro.view.mediators.SessionPanelMediator.NAME = "SessionPanel";
