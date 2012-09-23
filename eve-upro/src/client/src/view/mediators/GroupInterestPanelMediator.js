upro.view.mediators.GroupInterestPanelMediator = Class.create(upro.view.mediators.AbstractSharingPanelMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.GroupInterestPanelMediator.NAME, "groupInterest", panelId, menuPath, menuIndex);

   },

   getBaseViewInfo: function()
   {
      var info =
      {
         icon: upro.res.menu.IconData.GroupEdit,
         menuLabel: upro.res.text.Lang.format("panels.group.interest.menuLabel"),
         viewId: "groupInterest"
      };

      return info;
   },

   isValidCharacterForSharing: function(bodyName)
   {
      return true;
   },

   isValidCorporationForSharing: function(bodyName)
   {
      return true;
   },

   isValidAllianceForSharing: function(bodyName)
   {
      return true;
   },

   requestAddOwner: function(notifyBody)
   {
      this.facade().sendNotification(upro.app.Notifications.SharedObjectAddOwnerRequest, notifyBody);
   },

   requestRemoveOwner: function(notifyBody)
   {
      this.facade().sendNotification(upro.app.Notifications.SharedObjectRemoveOwnerRequest, notifyBody);
   },

   requestAddShares: function(notifyBody)
   {
      this.facade().sendNotification(upro.app.Notifications.SharedObjectAddSharesRequest, notifyBody);
   },

   requestRemoveShares: function(notifyBody)
   {
      this.facade().sendNotification(upro.app.Notifications.SharedObjectRemoveSharesRequest, notifyBody);
   },

   onNotifyGroupSelected: function(group)
   {
      this.setSharedObject(group);
   },

   onNotifyGroupDataChanged: function(sharedObject)
   {
      if (this.sharedObject && (this.sharedObject.getId() == sharedObject.getId()))
      {
         this.setSharedObject(sharedObject);
      }
   }
});

upro.view.mediators.GroupInterestPanelMediator.NAME = "GroupInterestPanel";
