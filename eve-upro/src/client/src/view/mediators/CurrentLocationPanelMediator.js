/**
 * This panel shows the current location status groups
 */
upro.view.mediators.CurrentLocationPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.CurrentLocationPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.sendButton = null;
      this.displayButton = null;

      this.groupList = null;
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
         id: 'currentLocationPanel_base',
         childViews: [
         {
            view: 'Button',
            rect: '0 ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom left width',
            text: upro.res.text.Lang.format("panels.currentLocation.send.command"),
            id: 'currentLocation_send'
         },
         {
            view: 'Button',
            rect: (dimension.width - halfWidth + 2) + ' ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom right width',
            text: upro.res.text.Lang.format("panels.currentLocation.display.command"),
            id: 'currentLocation_display'
         },
         {
            view: 'ScrollPane',
            rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height - 30),
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
               id: 'currentLocation_groupList',
               style:
               {
                  fontSize: '12px',
                  lineHeight: '18px'
               },
               render:
               {
                  render: this.listRenderer.bind(this),
                  setSelected: this.setSelectedGroupList.bind(this)
               },
               multiselect: true
            } ]
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#currentLocationPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.CurrentLocation,
            upro.res.text.Lang.format("panels.currrentLocation.menuLabel"), "currentLocation", base);

      this.sendButton = uki('#currentLocation_send');
      this.sendButton.bind('click', this.onSendButton.bind(this));
      this.displayButton = uki('#currentLocation_display');
      this.displayButton.bind('click', this.onDisplayButton.bind(this));
      this.groupList = uki('#currentLocation_groupList');
   },

   getImageForSendLocation: function(statusGroup)
   {
      var image = upro.res.ImageData.Transparent;

      if (statusGroup.isSendLocationEnabled())
      {
         image = upro.res.ImageData.SendLocation;
      }

      return image;
   },

   getImageForDisplayLocation: function(statusGroup)
   {
      var image = upro.res.ImageData.Transparent;

      if (statusGroup.isDisplayLocationEnabled())
      {
         image = upro.res.ImageData.DisplayLocation;
      }

      return image;
   },

   listRenderer: function(data, rect, index)
   {
      var result = "";
      var nameStyle = "";

      if (data.isPredefined)
      {
         nameStyle += "color:#00FF00;"; // to give a hint against impostors
      }
      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForSendLocation(data.statusGroup) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForDisplayLocation(data.statusGroup) + '">' + '</img></div>' + '</td>';
      result += '<td style="' + nameStyle + '">' + data.name + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelectedGroupList: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';
   },

   sendModifyStatusGroupForSelected: function(modifier)
   {
      var facade = this.facade();
      var listEntries = this.groupList.selectedRows();

      listEntries.forEach(function(listEntry)
      {
         var notifyBody =
         {
            groupId: listEntry.statusGroup.getId()
         };

         modifier(notifyBody, listEntry);
         facade.sendNotification(upro.app.Notifications.ModifyLocationStatusGroupSettings, notifyBody);
      });
   },

   onSendButton: function()
   {
      this.sendModifyStatusGroupForSelected(function(notifyBody, listEntry)
      {
         notifyBody.sendLocation = !listEntry.statusGroup.isSendLocationEnabled();
      });
   },

   onDisplayButton: function()
   {
      this.sendModifyStatusGroupForSelected(function(notifyBody, listEntry)
      {
         notifyBody.displayLocation = !listEntry.statusGroup.isDisplayLocationEnabled();
      });
   },

   sortListData: function(data)
   {
      return data.sort(function(listEntryA, listEntryB)
      {
         return listEntryA.name.toLowerCase().localeCompare(listEntryB.name.toLowerCase());
      });
   },

   fillGroupList: function()
   {
      var trackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var oldSelected = this.getSelectedGroupIds();
      var data = [];

      trackerProxy.forEachGroup(function(statusGroup)
      {
         var group = groupProxy.getGroup(statusGroup.getId());

         if (group)
         {
            var listEntry =
            {
               statusGroup: statusGroup,
               isPredefined: upro.model.predefinedGroupTypes.hasOwnProperty(statusGroup.getId()),
               name: group.getName()
            };

            data.push(listEntry);
         }
      });

      data = this.sortListData(data);
      this.groupList.data(data);
      this.groupList.selectedIndexes(this.getSelectedIndexesByGroupId(data, oldSelected));
      this.groupList.parent().layout();
   },

   onNotifyGroupListChanged: function()
   {
      this.fillGroupList();
   },

   onNotifyLocationStatusGroupListChanged: function()
   {
      this.fillGroupList();
   },

   getSelectedGroupIds: function()
   {
      var listEntries = this.groupList.selectedRows();
      var result = [];

      listEntries.forEach(function(listEntry)
      {
         result.push(listEntry.statusGroup.getId());
      });

      return result;
   },

   getSelectedIndexesByGroupId: function(listEntries, groupIds)
   {
      var result = [];
      var index = 0;

      listEntries.forEach(function(listEntry)
      {
         if (groupIds.indexOf(listEntry.statusGroup.getId()) >= 0)
         {
            result.push(index);
         }
         index++;
      });

      return result;
   }
});

upro.view.mediators.CurrentLocationPanelMediator.NAME = "CurrentLocationPanel";
