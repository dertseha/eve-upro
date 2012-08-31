/**
 * This panel shows the group list
 */
upro.view.mediators.GroupListPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath)
   {
      $super(upro.view.mediators.GroupListPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;

      this.textField = null;
      this.createButton = null;

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
         id: 'groupListPanel_base',
         childViews: [
         {
            view: 'TextField',
            rect: '0 0 ' + (dimension.width - 30) + ' ' + 25,
            anchors: 'left top right',
            background: 'theme(box)',
            id: 'groupList_text',
            placeholder: upro.res.text.Lang.format("panels.group.list.textHint")
         },
         {
            view: 'Button',
            rect: (dimension.width - 25) + ' 0 25 25',
            anchors: 'top right',
            text: '+',
            id: 'groupList_create'
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
               rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
               anchors: 'top left right bottom',
               id: 'groupList_list',
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

      var base = uki('#groupListPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, 0, upro.res.menu.IconData.GroupList, upro.res.text.Lang
            .format("panels.group.list.menuLabel"), "groupList", base);

      this.createButton = uki('#groupList_create');

      this.createButton.disabled(true);
      this.createButton.bind('click', this.onCreateButton.bind(this));

      this.textField = uki('#groupList_text');
      this.textField.bind('keydown keyup', this.onTextChange.bind(this));
   },

   getImageForMembership: function(group)
   {
      var image = +'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEklEQVR42mNgGAWjYBSMAggAAAQQ'
            + 'AAGvRYgsAAAAAElFTkSuQmCC';

      if (group.isClientMember())
      {
         image = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAVklEQVR42mNgGHLg////84H4PBDz"
               + "k6sZBkgzBE0z3BBKNIPAfJgCfqiT5lOiGVWCGM1QReexKSBKMwFbCGsm0ZD55IY0Yc0EDJlPSWqb"
               + "T0l6n0+XzAUAB/N36Dezi8oAAAAASUVORK5CYII=";
      }

      return image;
   },

   listRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">'
            + '<img style="height:16px;" src="data:image/png;base64,' + this.getImageForMembership(data.group) + '">'
            + '</img></div>' + '</td>';
      result += '<td>' + data.group.getName() + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(container, data, state, hasFocus)
   {
      data.state = state;
      data.hasFocus = hasFocus;
      container.style['font-weight'] = data.state ? 'bold' : 'normal';
      container.style['background'] = data.state ? '#704010' : '';

      this.selection = data.state ? data.group.getId() : null;
      this.selectionTimer.start(50);
   },

   onTextChange: function()
   {
      this.createButton.disabled(this.textField.value().length < 3);
   },

   onCreateButton: function()
   {
      if (!this.createButton.disabled())
      {
         this.facade().sendNotification(upro.app.Notifications.GroupCreateRequest, this.textField.value());
      }
   },

   onSelectionTimer: function()
   {
      this.facade().sendNotification(upro.app.Notifications.GroupSelectionRequest, this.selection);
      this.selection = null;
   },

   onNotifyGroupListChanged: function()
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var selectedGroupId = groupProxy.getSelectedGroupId();
      var data = [];
      var selectedIndex = -1;

      groupProxy.forEachGroup(function(group)
      {
         var listEntry =
         {
            state: 0,
            hasFocus: false,
            group: group
         };

         data.push(listEntry);
      });
      data.sort(function(listEntryA, listEntryB)
      {
         return listEntryA.group.getName().localeCompare(listEntryB.group.getName());
      });
      if (selectedGroupId)
      {
         for ( var i = 0; (selectedIndex < 0) && (i < data.length); i++)
         {
            var listEntry = data[i];

            if (listEntry.group.getId() == selectedGroupId)
            {
               selectedIndex = i;
            }
         }
      }

      var groupList = uki('#groupList_list');
      groupList.data(data);
      groupList.selectedIndex(selectedIndex);
   }
});

upro.view.mediators.GroupListPanelMediator.NAME = "GroupListPanel";
