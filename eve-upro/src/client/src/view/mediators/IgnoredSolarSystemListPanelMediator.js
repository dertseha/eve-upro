/**
 * This panel shows the list of ignored solar systems
 */
upro.view.mediators.IgnoredSolarSystemListPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.IgnoredSolarSystemListPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.systemsList = null;
      this.allowButton = null;

      this.selectionTimer = upro.sys.Timer.getSingleTimer(this.onSelectionTimer.bind(this));
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
         id: 'ignoredSystemsPanel_base',
         childViews: [
         {
            view: 'Button',
            rect: '0 0 ' + (dimension.width) + ' 25',
            anchors: 'left top right bottom',
            text: upro.res.text.Lang.format("panels.ignoredSystems.allow.command"),
            id: 'ignoredSystemsPanel_allow'
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
               id: 'ignoredSystemsPanel_list',
               multiselect: true,
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

      var base = uki('#ignoredSystemsPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.Denied,
            upro.res.text.Lang.format("panels.map.ignoredSystems.menuLabel"), "ignoredSystems", base);

      this.systemsList = uki('#ignoredSystemsPanel_list');
      this.allowButton = uki('#ignoredSystemsPanel_allow')[0];
      this.allowButton.disabled(true);
      this.allowButton.bind('click', this.onAllowButton.bind(this));
   },

   setList: function(solarSystemIdList)
   {
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);
      var data = [];

      solarSystemIdList.forEach(function(solarSystemId)
      {
         var listEntry =
         {
            solarSystem: universeProxy.findSolarSystemById(solarSystemId)
         };

         data.push(listEntry);
      });
      data.sort(function(listEntryA, listEntryB)
      {
         return listEntryA.solarSystem.name.toLowerCase().localeCompare(listEntryB.solarSystem.name.toLowerCase());
      });

      this.systemsList.data(data);
      this.systemsList.parent().layout();
   },

   getColorBySecurityLevel: function(solarSystem)
   {
      var colors = [ 'F00000', 'D73000', 'F04800', 'F06000', 'D77700', 'EFEF00', '8FEF2F', '00F000', '00EF47',
            '48F0C0', '2FEFEF' ];
      var index = (solarSystem.security * 10).toFixed(0);

      return '#' + colors[index];
   },

   listRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;background:'
            + this.getColorBySecurityLevel(data.solarSystem) + ';"></div>' + '</td>';
      result += '<td>' + data.solarSystem.name + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';

      this.selectionTimer.start(50);
   },

   onSelectionTimer: function()
   {
      this.allowButton.disabled(this.systemsList.selectedRows().length == 0);
   },

   onAllowButton: function()
   {
      if (!this.allowButton.disabled())
      {
         var selectedRows = this.systemsList.selectedRows();
         var notifyBody =
         {
            ignore: false,
            solarSystemIdList: selectedRows.map(function(entry)
            {
               return entry.solarSystem.getId();
            })
         };

         this.facade().sendNotification(upro.app.Notifications.UserIgnoredSolarSystemsSetIgnoreState, notifyBody);
      }
   }
});

upro.view.mediators.IgnoredSolarSystemListPanelMediator.NAME = "IgnoredSolarSystemListPanel";
