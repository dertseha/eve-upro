/**
 * This panel shows the autopilot route
 */
upro.view.mediators.AutopilotRoutePanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.AutopilotRoutePanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.clearButton = null;

      this.routeList = null;
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
         id: 'autopilotRoutePanel_base',
         childViews: [
         {
            view: 'Button',
            rect: '0 0 ' + (dimension.width) + ' 25',
            anchors: 'top right width',
            text: upro.res.text.Lang.format("panels.autopilot.edit.clear.command"),
            id: 'autopilotRoute_clear'
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
               id: 'autopilotRoute_list',
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

      var base = uki('#autopilotRoutePanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.Autopilot,
            upro.res.text.Lang.format("panels.autopilot.route.menuLabel"), "autopilotRoute", base);

      this.routeList = uki('#autopilotRoute_list');
      this.clearButton = uki("#autopilotRoute_clear")[0];
      this.clearButton.disabled(true);
      this.clearButton.bind('click', this.onClearButton.bind(this));
   },

   setRoute: function(route)
   {
      var data = [];
      var jumpType = upro.nav.JumpType.None;

      route.forEach(function(routeEntry)
      {
         var displayEntry =
         {
            routeEntry: routeEntry,
            isNext: false,
            jumpType: jumpType
         };

         jumpType = routeEntry.nextJumpType;
         data.push(displayEntry);
      });

      this.routeList.data(data);
      this.routeList.parent().layout();

      this.updateControls();
   },

   updateControls: function()
   {
      var isEmpty = this.routeList.data().length === 0;

      this.clearButton.disabled(isEmpty);
   },

   setNextRouteIndex: function(index)
   {
      var data = this.routeList.data();
      var i = 0;

      data.forEach(function(listEntry)
      {
         listEntry.isNext = i === index;
         i++;
      });
      this.routeList.data(data);
      this.routeList.parent().layout();
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

   getImageForNext: function(listEntry)
   {
      var link = upro.res.ImageData.Transparent;

      if (listEntry.isNext)
      {
         link = upro.res.ImageData.ArrowRight;
      }

      return link;
   },

   routeRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForNext(data) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForJumpType(data.jumpType) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;background:'
            + this.getColorBySecurityLevel(data.routeEntry.getSolarSystem()) + ';"></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForEntryType(data.routeEntry.getEntryType()) + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.routeEntry.getSolarSystem().name + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(item, data, state, hasFocus)
   {

   },

   onClearButton: function()
   {
      if (!this.clearButton.disabled())
      {
         this.facade().sendNotification(upro.app.Notifications.ClearAutopilotRouteRequest);
      }
   }
});

upro.view.mediators.AutopilotRoutePanelMediator.NAME = "AutopilotRoutePanel";
