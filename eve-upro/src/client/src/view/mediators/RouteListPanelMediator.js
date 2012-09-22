/**
 * This panel shows the list of routes
 */
upro.view.mediators.RouteListPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.RouteListPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.setActiveButton = null;
      this.destroyButton = null;
      this.rejectButton = null;

      this.routeList = null;

      this.selectionTimer = upro.sys.Timer.getSingleTimer(this.onSelectionTimer.bind(this));
      this.selection = null;
   },

   onRegister: function()
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);
      var panel = $(this.panelId);
      var dimension = panel.getDimensions();
      var halfWidth = (dimension.width / 2);

      this.uiBase = uki(
      {
         view: 'Box',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'left top right bottom',
         id: 'routeListPanel_base',
         childViews: [
         {
            view: 'Button',
            rect: '0 0 ' + (halfWidth - 2) + ' 25',
            anchors: 'top left width',
            text: upro.res.text.Lang.format("panels.routes.edit.setActive.command"),
            id: 'routeListPanel_setActive'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' 0 ' + (halfWidth - 2) + ' 25',
            anchors: 'top right width',
            text: upro.res.text.Lang.format("panels.routes.edit.destroy.command"),
            id: 'routeListPanel_destroy'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' 0 ' + (halfWidth - 2) + ' 25',
            anchors: 'top right width',
            text: upro.res.text.Lang.format("panels.routes.edit.reject.command"),
            id: 'routeListPanel_reject'
         },
         {
            view: 'ScrollPane',
            rect: '0 30 ' + (dimension.width) + ' ' + (dimension.height - 30),
            anchors: 'left top right bottom',
            textSelectable: false,
            style:
            {
               'border-style': 'solid',
               'border-width': '2px',
               'border-color': '#704010'
            },
            childViews: [
            {
               view: 'List',
               rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height - 30),
               anchors: 'top left right bottom',
               id: 'routeListPanel_list',
               style:
               {
                  fontSize: '12px',
                  lineHeight: '18px'
               },
               render:
               {
                  render: this.listRenderer.bind(this),
                  setSelected: this.setSelected.bind(this)
               }
            } ]
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#routeListPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.RouteList,
            upro.res.text.Lang.format("panels.routes.route.menuLabel"), "routes", base);

      this.routeList = uki("#routeListPanel_list")[0];
      this.setActiveButton = uki("#routeListPanel_setActive")[0];
      this.setActiveButton.disabled(true);
      this.setActiveButton.bind('click', this.onSetActiveButton.bind(this));
      this.destroyButton = uki("#routeListPanel_destroy")[0];
      this.destroyButton.disabled(true);
      this.destroyButton.bind('click', this.onDestroyButton.bind(this));
      this.rejectButton = uki("#routeListPanel_reject")[0];
      this.rejectButton.disabled(true);
      this.rejectButton.bind('click', this.onRejectButton.bind(this));
   },

   refillRouteList: function()
   {
      var routeProxy = this.facade().retrieveProxy(upro.model.proxies.RouteProxy.NAME);
      var selectedId = routeProxy.getSelectedInfoId();
      var data = [];
      var selectedIndex = -1;

      routeProxy.forEachInfo(function(route)
      {
         var listEntry =
         {
            route: route
         };

         data.push(listEntry);
      });
      data.sort(function(listEntryA, listEntryB)
      {
         return listEntryA.route.getName().toLowerCase().localeCompare(listEntryB.route.getName().toLowerCase());
      });
      if (selectedId)
      {
         for ( var i = 0; (selectedIndex < 0) && (i < data.length); i++)
         {
            var listEntry = data[i];

            if (listEntry.route.getId() == selectedId)
            {
               selectedIndex = i;
            }
         }
      }

      this.routeList.data(data);
      this.routeList.parent().layout();

      this.routeList.selectedIndex(selectedIndex);
   },

   getImageForOwner: function(info)
   {
      var link = upro.res.ImageData.Transparent;

      if (info.isClientAllowedControl())
      {
         link = upro.res.ImageData.Owner;
      }

      return link;
   },

   listRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForOwner(data.route) + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.route.getName().escapeHTML() + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';

      this.selection = state ? data.route.getId() : null;
      this.selectionTimer.start(50);
   },

   onSelectionTimer: function()
   {
      this.facade().sendNotification(upro.app.Notifications.RouteSelectionRequest, this.selection);
      this.selection = null;
   },

   onNotifyRouteListChanged: function()
   {
      this.refillRouteList();
   },

   onNotifyRouteDataChanged: function()
   {
      this.refillRouteList();
   },

   onNotifyRouteSelected: function(route)
   {
      if (route)
      {
         var isController = route.isClientAllowedControl();

         this.setActiveButton.disabled(false);
         this.destroyButton.disabled(!isController);
         this.destroyButton.visible(isController);
         this.rejectButton.disabled(isController);
         this.rejectButton.visible(!isController);
      }
      else
      {
         this.setActiveButton.disabled(true);
         this.destroyButton.disabled(true);
         this.destroyButton.visible(true);
         this.rejectButton.disabled(true);
         this.rejectButton.visible(false);
      }
   },

   onSetActiveButton: function()
   {
      if (!this.setActiveButton.disabled())
      {
         var routeProxy = this.facade().retrieveProxy(upro.model.proxies.RouteProxy.NAME);

         this.facade().sendNotification(upro.app.Notifications.SetActiveRouteRequest, routeProxy.getSelectedInfo());
      }
   },

   onDestroyButton: function()
   {
      if (!this.destroyButton.disabled())
      {
         var routeProxy = this.facade().retrieveProxy(upro.model.proxies.RouteProxy.NAME);

         this.facade().sendNotification(upro.app.Notifications.DestroyRouteRequest, routeProxy.getSelectedInfoId());
      }
   },

   onRejectButton: function()
   {
      if (!this.rejectButton.disabled())
      {
         var routeProxy = this.facade().retrieveProxy(upro.model.proxies.RouteProxy.NAME);
         var notifyBody =
         {
            objectType: "Route",
            id: routeProxy.getSelectedInfoId()
         };

         this.facade().sendNotification(upro.app.Notifications.RejectSharedObjectRequest, notifyBody);
      }
   }

});

upro.view.mediators.RouteListPanelMediator.NAME = "RouteListPanel";
