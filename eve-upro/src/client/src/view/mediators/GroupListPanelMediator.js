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
            id: 'groupList_text'
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

   listRenderer: function(data, rect, index)
   {
      var result = JSON.stringify(data);

      // result = '<table style="width:100%;height:100%"><tr>';
      // result += '<td style="width:16px;">' + '<div style="height:16px;background:'
      // + this.getColorBySecurityLevel(data.solarSystem) + ';"></div>' + '</td>';
      // result += '<td style="width:16px;">' + '<div style="height:16px;">'
      // + '<img style="height:16px;" src="data:image/png;base64,' + this.getImageForEntryType(data.routeEntry)
      // + '">' + '</img></div>' + '</td>';
      // result += '<td>' + data.solarSystem.name + '</td>';
      // result += '</tr></table>';

      return result;
   },

   setSelected: function(item, data, state, hasFocus)
   {

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

   onNotifyGroupCreated: function(newGroup)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var data = [];

      groupProxy.forEachGroup(function(group)
      {
         console.log('iterating: ' + group.getName());
         data.push(group);
      });
      uki('#groupList_list').data(data);
   }
});

upro.view.mediators.GroupListPanelMediator.NAME = "GroupListPanel";
