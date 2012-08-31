/**
 * This panel shows the edit controls for a group
 */
upro.view.mediators.GroupEditPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath)
   {
      $super(upro.view.mediators.GroupEditPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;

      this.joinButton = null;
      this.leaveButton = null;
      this.destroyButton = null;
   },

   onRegister: function()
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);
      var panel = $(this.panelId);
      var dimension = panel.getDimensions();

      this.uiBase = uki(
      {
         view: 'Box',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'left top right bottom',
         id: 'groupEditPanel_base',
         childViews: [
         {
            view: 'Button',
            rect: '5 0 100 25',
            anchors: 'left top',
            text: upro.res.text.Lang.format("panels.group.edit.join"),
            id: 'groupEdit_join'
         },
         {
            view: 'Button',
            rect: '5 30 100 25',
            anchors: 'left top',
            text: upro.res.text.Lang.format("panels.group.edit.leave"),
            id: 'groupEdit_leave'
         },
         {
            view: 'Button',
            rect: '5 60 100 25',
            anchors: 'left top',
            text: upro.res.text.Lang.format("panels.group.edit.destroy"),
            id: 'groupEdit_destroy'
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#groupEditPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, 1, upro.res.menu.IconData.GroupEdit, upro.res.text.Lang
            .format("panels.group.edit.menuLabel"), "groupEdit", base);

      this.joinButton = uki('#groupEdit_join');
      this.joinButton.bind('click', this.onJoinButton.bind(this));
      this.leaveButton = uki('#groupEdit_leave');
      this.leaveButton.bind('click', this.onLeaveButton.bind(this));
      this.destroyButton = uki('#groupEdit_destroy');
      this.destroyButton.bind('click', this.onDestroyButton.bind(this));

      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      this.onNotifyGroupSelected(groupProxy.getSelectedGroup());
   },

   notifySelectedGroup: function(notification)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);

      this.facade().sendNotification(notification, groupProxy.getSelectedGroup().getId());
   },

   onJoinButton: function()
   {
      if (!this.joinButton.disabled())
      {
         this.notifySelectedGroup(upro.app.Notifications.GroupJoinRequest);
      }
   },

   onLeaveButton: function()
   {
      if (!this.leaveButton.disabled())
      {
         this.notifySelectedGroup(upro.app.Notifications.GroupLeaveRequest);
      }
   },

   onDestroyButton: function()
   {
      if (!this.destroyButton.disabled())
      {
         this.notifySelectedGroup(upro.app.Notifications.GroupDestroyRequest);
      }
   },

   onNotifyGroupSelected: function(group)
   {
      if (group)
      {
         var isMember = group.isClientMember();

         this.joinButton.disabled(isMember);
         this.leaveButton.disabled(!isMember);
         this.destroyButton.disabled(!group.isClientOwner());
      }
      else
      {
         this.joinButton.disabled(true);
         this.leaveButton.disabled(true);
         this.destroyButton.disabled(true);
      }
   }
});

upro.view.mediators.GroupEditPanelMediator.NAME = "GroupEditPanel";
