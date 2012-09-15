upro.view.mediators.SharedObjectInterestPanelMediator = Class.create(upro.view.mediators.AbstractSharingPanelMediator,
      {
         initialize: function($super, panelId, menuPath, menuIndex)
         {
            $super(upro.view.mediators.SharedObjectInterestPanelMediator.NAME, "sharedInterest", panelId, menuPath,
                  menuIndex);

         },

         getBaseViewInfo: function()
         {
            var info =
            {
               icon: upro.res.menu.IconData.SharedObjectInterest,
               menuLabel: upro.res.text.Lang.format("panels.sharedObject.interest.menuLabel"),
               viewId: "sharedObjectInterest"
            };

            return info;
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
         }
      });

upro.view.mediators.SharedObjectInterestPanelMediator.NAME = "SharedObjectInterestPanel";
