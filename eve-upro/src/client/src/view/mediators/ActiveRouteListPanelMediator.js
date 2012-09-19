/**
 * This panel shows the active route
 */
upro.view.mediators.ActiveRouteListPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.ActiveRouteListPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.nameText = null;
      this.createButton = null;
      this.updateButton = null;

      this.routeList = null;

      this.selectedRoute = null;
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
         id: 'activeRouteListPanel_base',
         childViews: [
         {
            view: 'TextField',
            rect: '0 0 ' + (dimension.width) + ' ' + 25,
            anchors: 'left top right',
            background: 'theme(box)',
            id: 'activeRouteListPanel_name',
            placeholder: upro.res.text.Lang.format("panels.activeRoute.edit.nameHint")
         },
         {
            view: 'Button',
            rect: '0 30 ' + (halfWidth - 2) + ' 25',
            anchors: 'top left width',
            text: upro.res.text.Lang.format("panels.activeRoute.edit.create.command"),
            id: 'activeRouteListPanel_create'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' 30 ' + (halfWidth - 2) + ' 25',
            anchors: 'top right width',
            text: upro.res.text.Lang.format("panels.activeRoute.edit.update.command"),
            id: 'activeRouteListPanel_update'
         },
         {
            view: 'ScrollPane',
            rect: '0 60 ' + (dimension.width) + ' ' + (dimension.height - 60),
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
               rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height - 60),
               anchors: 'top left right bottom',
               id: 'activeRouteListPanel_list',
               style:
               {
                  fontSize: '12px',
                  lineHeight: '18px'
               },
               render:
               {
                  render: this.routeRenderer.bind(this),
                  setSelected: this.setSelected.bind(this)
               }
            } ]
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#activeRouteListPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.ActiveRoute,
            upro.res.text.Lang.format("panels.activeRoute.route.menuLabel"), "activeRoute", base);

      this.routeList = uki("#activeRouteListPanel_list")[0];
      this.nameText = uki("#activeRouteListPanel_name")[0];
      this.createButton = uki("#activeRouteListPanel_create")[0];
      this.createButton.disabled(true);
      this.createButton.bind('click', this.onCreateButton.bind(this));
      this.updateButton = uki("#activeRouteListPanel_update")[0];
      this.updateButton.disabled(true);
      this.updateButton.bind('click', this.onUpdateButton.bind(this));
   },

   setRoute: function(route)
   {
      var data = [];
      var jumpType = upro.nav.JumpType.None;

      route.forEach(function(systemRouteEntry)
      {
         var displayEntry =
         {
            systemRouteEntry: systemRouteEntry,
            jumpType: jumpType
         };

         jumpType = systemRouteEntry.getJumpType();
         data.push(displayEntry);
      });

      this.routeList.data(data);
      this.routeList.parent().layout();

      this.updateControls();
   },

   updateControls: function()
   {
      var isEmpty = this.routeList.data().length == 0;

      this.createButton.disabled(isEmpty);
      this.updateButton.disabled(isEmpty || !this.selectedRoute);
   },

   getColorBySecurityLevel: function(solarSystem)
   {
      var colors = [ 'F00000', 'D73000', 'F04800', 'F06000', 'D77700', 'EFEF00', '8FEF2F', '00F000', '00EF47',
            '48F0C0', '2FEFEF' ];
      var index = (solarSystem.security * 10).toFixed(0);

      return '#' + colors[index];
   },

   getImageForEntryType: function(entryType)
   {
      var entryTypes = {};

      entryTypes[upro.nav.SystemRouteEntry.EntryType.Checkpoint] = upro.res.ImageData.Checkpoint;
      entryTypes[upro.nav.SystemRouteEntry.EntryType.Waypoint] = upro.res.ImageData.Waypoint;
      entryTypes[upro.nav.SystemRouteEntry.EntryType.Transit] = upro.res.ImageData.Transparent;

      return entryTypes[entryType];
   },

   getImageForJumpType: function(jumpType)
   {
      var link = upro.res.ImageData.Transparent;

      if (upro.res.ImageData.hasOwnProperty(jumpType))
      {
         link = upro.res.ImageData[jumpType];
      }

      return link;
   },

   routeRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForJumpType(data.jumpType) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;background:'
            + this.getColorBySecurityLevel(data.systemRouteEntry.getSolarSystem()) + ';"></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForEntryType(data.systemRouteEntry.getEntryType()) + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.systemRouteEntry.getSolarSystem().name + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(item, data, state, hasFocus)
   {

   },

   setRouteInfo: function(route)
   {
      this.nameText.value(route.getName());
   },

   onNotifyRouteSelected: function(route)
   {
      this.selectedRoute = route;
      this.updateControls();
   },

   getNotifyBody: function()
   {
      var notifyBody =
      {
         name: this.nameText.value()
      };

      return notifyBody;
   },

   onCreateButton: function()
   {
      if (!this.createButton.disabled())
      {
         var notifyBody = this.getNotifyBody();

         this.facade().sendNotification(upro.app.Notifications.ActiveRouteCreateNewRouteRequest, notifyBody);
      }
   },

   onUpdateButton: function()
   {
      if (!this.updateButton.disabled())
      {
         var notifyBody = this.getNotifyBody();

         notifyBody.id = this.selectedRoute.getId();
         this.facade().sendNotification(upro.app.Notifications.ActiveRouteUpdateRouteRequest, notifyBody);
      }
   }
});

upro.view.mediators.ActiveRouteListPanelMediator.NAME = "ActiveRouteListPanel";
