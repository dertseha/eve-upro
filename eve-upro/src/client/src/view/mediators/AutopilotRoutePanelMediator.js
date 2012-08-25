/**
 * This panel shows the autopilot route
 */
upro.view.mediators.AutopilotRoutePanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath)
   {
      $super(upro.view.mediators.AutopilotRoutePanelMediator.NAME, null);

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
         view: 'ScrollPane',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'left top right bottom',
         id: 'autopilotRoutePanel_base',
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
            rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
            anchors: 'top left right bottom',
            id: 'autopilotRoute',
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
      });
      this.uiBase.attachTo(panel);

      var base = uki('#autopilotRoutePanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, 1, upro.res.menu.IconData.Autopilot, upro.res.text.Lang
            .format("panels.autopilot.route.menuLabel"), "autopilotRoute", base);
   },

   setRoute: function(route)
   {
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);
      var data = [];
      var guiList = uki('#autopilotRoute');

      for ( var i = 0; i < route.length; i++)
      {
         var routeEntry = route[i];
         var displayEntry =
         {
            routeEntry: routeEntry,
            solarSystem: universeProxy.findSolarSystemById(routeEntry.solarSystemId)
         };

         data.push(displayEntry);
      }

      guiList.data(data);
   },

   getColorBySecurityLevel: function(solarSystem)
   {
      var colors = [ 'F00000', 'D73000', 'F04800', 'F06000', 'D77700', 'EFEF00', '8FEF2F', '00F000', '00EF47',
            '48F0C0', '2FEFEF' ];
      var index = (solarSystem.security * 10).toFixed(0);

      return '#' + colors[index];
   },

   getImageForEntryType: function(routeEntry)
   {
      var entryTypes = {};

      entryTypes[upro.nav.SystemRouteEntry.EntryType.Checkpoint] = ''
            + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAfklEQVR42rWSiw3AIAhE2YBRHKEj'
            + 'OBKjdKSOwggUE5sSUvGXvuQSI3CKAuAQEVSRiuWlrAlG0MRL2pQYRsUkfSgyYHdarrK34sjAks1+'
            + 'toFfDbZb2H5E7H3jyBy0TOIZcCbpwyDBDO49CGaprXAVwgpaeBbBKs8c7BgcRVHODf6DmqxQtG1W' + 'AAAAAElFTkSuQmCC';
      entryTypes[upro.nav.SystemRouteEntry.EntryType.Waypoint] = ''
            + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAlUlEQVR42rWSiwnAIAxEs4GjOIIj'
            + 'dBRHyCgdwVE6iiOkEZI2iIpV+uBAEj3MB6CCiBwLWZleyhlhBr54UZ+Sc6PHaC4nVhAlE8eRgX47'
            + 'NXJqkkcGSjCGWc5Bk78abJdgmxhNPM420VVjPETPGGf2wJpkU9Z4ByoT31giD1+o+oHwFSlFS3Cw'
            + 'Aj88i2AVncKOQdCt7HEDHOhv1GOG9+IAAAAASUVORK5CYII=';
      entryTypes[upro.nav.SystemRouteEntry.EntryType.Transit] = ''
            + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEklEQVR42mNgGAWjYBSMAggAAAQQ'
            + 'AAGvRYgsAAAAAElFTkSuQmCC';

      return entryTypes[routeEntry.entryType];
   },

   routeRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;background:'
            + this.getColorBySecurityLevel(data.solarSystem) + ';"></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">'
            + '<img style="height:16px;" src="data:image/png;base64,' + this.getImageForEntryType(data.routeEntry)
            + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.solarSystem.name + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(item, data, state, hasFocus)
   {

   }
});

upro.view.mediators.AutopilotRoutePanelMediator.NAME = "AutopilotRoutePanel";
