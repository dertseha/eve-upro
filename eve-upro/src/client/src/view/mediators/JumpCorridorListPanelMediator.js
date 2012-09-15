/**
 * This panel shows the jump corridor list
 */
upro.view.mediators.JumpCorridorListPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.JumpCorridorListPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.jumpCorridorList = null;

      this.selectionTimer = upro.sys.Timer.getSingleTimer(this.onSelectionTimer.bind(this));
      this.selection = null;
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
         id: 'jumpCorridorListPanel_base',
         childViews: [
         {
            view: 'ScrollPane',
            rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
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
               rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
               anchors: 'top left right bottom',
               id: 'jumpCorridorList_list',
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

      var base = uki('#jumpCorridorListPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.WormholeOut,
            upro.res.text.Lang.format("panels.jumpCorridor.list.menuLabel"), "jumpCorridorList", base);

      this.jumpCorridorList = uki("#jumpCorridorList_list")[0];
   },

   getImageForOwner: function(listEntry)
   {
      var link = upro.res.ImageData.Transparent;

      if (listEntry.info.isClientAllowedControl())
      {
         link = upro.res.ImageData.Owner;
      }

      return link;
   },

   getImageForJumpType: function(listEntry)
   {
      var link = upro.res.ImageData.Transparent;
      var jumpType = listEntry.info.getJumpType();

      if (upro.res.ImageData.hasOwnProperty(jumpType))
      {
         link = upro.res.ImageData[jumpType];
      }

      return link;
   },

   listRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForJumpType(data) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForOwner(data) + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.info.getName().escapeHTML() + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';

      this.selection = state ? data.info.getId() : null;
      this.selectionTimer.start(50);
   },

   refillList: function()
   {
      var jumpCorridorProxy = this.facade().retrieveProxy(upro.model.proxies.JumpCorridorProxy.NAME);
      var data = [];

      jumpCorridorProxy.forEachInfo(function(info)
      {
         var listEntry =
         {
            info: info
         };

         data.push(listEntry);
      });

      this.setListDataSorted(data);
   },

   setListDataSorted: function(data)
   {
      var jumpCorridorProxy = this.facade().retrieveProxy(upro.model.proxies.JumpCorridorProxy.NAME);
      var selectedInfoId = jumpCorridorProxy.getSelectedInfoId();
      var selectedIndex = -1;

      data.sort(function(listEntryA, listEntryB)
      {
         return listEntryA.info.getName().toLowerCase().localeCompare(listEntryB.info.getName().toLowerCase());
      });
      if (selectedInfoId)
      {
         for ( var i = 0; (selectedIndex < 0) && (i < data.length); i++)
         {
            var listEntry = data[i];

            if (listEntry.info.getId() == selectedInfoId)
            {
               selectedIndex = i;
            }
         }
      }

      this.jumpCorridorList.data(data);
      this.jumpCorridorList.selectedIndex(selectedIndex);
      this.jumpCorridorList.parent().layout();
   },

   onSelectionTimer: function()
   {
      this.facade().sendNotification(upro.app.Notifications.JumpCorridorSelectionRequest, this.selection);
      this.selection = null;
   },

   onNotifyJumpCorridorListChanged: function()
   {
      this.refillList();
   },

   onNotifyJumpCorridorDataChanged: function(info)
   {
      var that = this;
      var data = this.jumpCorridorList.data();
      var i = 0;

      data.forEach(function(listEntry)
      {
         if (listEntry.info.getId() == info.getId())
         {
            listEntry.info = info;
            that.jumpCorridorList.redrawRow(i);
         }
         i++;
      });

      this.setListDataSorted(data);
   }
});

upro.view.mediators.JumpCorridorListPanelMediator.NAME = "JumpCorridorListPanel";
