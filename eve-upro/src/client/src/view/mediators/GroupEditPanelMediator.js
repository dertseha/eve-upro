/**
 * This panel shows the edit controls for a group
 */
upro.view.mediators.GroupEditPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.GroupEditPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.searchTextField = null;
      this.searchButton = null;
      this.addInvitationButton = null;
      this.removeInvitationButton = null;
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
         id: 'groupEditPanel_base',
         childViews: [
         {
            view: 'TextField',
            rect: '0 0 ' + (halfWidth - 2) + ' ' + 25,
            anchors: 'left top width',
            background: 'theme(box)',
            id: 'groupEdit_searchEntity',
            placeholder: upro.res.text.Lang.format("panels.group.edit.searchEntity.hint")
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' 0 ' + (halfWidth - 2) + ' 25',
            anchors: 'top right width',
            text: upro.res.text.Lang.format("panels.group.edit.searchEntity.command"),
            id: 'groupEdit_searchEntities'
         },
         {
            view: 'ScrollPane',
            rect: '0 30 ' + (halfWidth - 6) + ' ' + (dimension.height - 60),
            anchors: 'left top width bottom',
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
               rect: '0 0 ' + (halfWidth - 6) + ' ' + (dimension.height - 60),
               anchors: 'top left right bottom',
               id: 'groupEdit_searchResultList',
               // background: 'rows(64, #FF0000)',
               style:
               {
                  fontSize: '12px',
                  lineHeight: '18px'
               },
               render:
               {
                  render: this.listRenderer.bind(this),
                  setSelected: this.setSelectedSearchList.bind(this)
               },
               multiselect: true
            } ]
         },
         {
            view: 'ScrollPane',
            rect: (halfWidth + 6) + ' 30 ' + (halfWidth - 6) + ' ' + (dimension.height - 60),
            anchors: 'right top width bottom',
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
               rect: '0 0 ' + (halfWidth - 6) + ' ' + (dimension.height - 60),
               anchors: 'top left right bottom',
               id: 'groupEdit_invitationList',
               style:
               {
                  fontSize: '12px',
                  lineHeight: '18px'
               },
               render:
               {
                  render: this.listRenderer.bind(this),
                  setSelected: this.setSelectedInvitationList.bind(this)
               }
            } ]
         },
         {
            view: 'Button',
            rect: '0 ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom left width',
            text: upro.res.text.Lang.format("panels.group.edit.addInvitation.command"),
            id: 'groupEdit_addInvitation'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom right width',
            text: upro.res.text.Lang.format("panels.group.edit.removeInvitation.command"),
            id: 'groupEdit_removeInvitation'
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#groupEditPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.GroupEdit,
            upro.res.text.Lang.format("panels.group.edit.menuLabel"), "groupEdit", base);

      this.searchTextField = uki('#groupEdit_searchEntity');
      this.searchTextField.bind('keydown keyup', this.onSearchTextChange.bind(this));
      this.searchButton = uki('#groupEdit_searchEntities');
      this.searchButton.disabled(true);
      this.searchButton.bind('click', this.onSearchButton.bind(this));
      this.addInvitationButton = uki('#groupEdit_addInvitation');
      // this.addInvitationButton.disabled(true);
      this.addInvitationButton.bind('click', this.onAddInvitationButton.bind(this));
      this.removeInvitationButton = uki('#groupEdit_removeInvitation');
      // this.removeInvitationButton.disabled(true);
      this.removeInvitationButton.bind('click', this.onRemoveInvitationButton.bind(this));
   },

   getImageForBody: function(listEntry)
   {
      var link = "";

      if (listEntry.type == "Character")
      {
         link = "http://image.eveonline.com/Character/" + listEntry.bodyName.getId() + "_32.jpg";
      }
      else if (listEntry.type == "Corporation")
      {
         link = "http://image.eveonline.com/Corporation/" + listEntry.bodyName.getId() + "_32.png";
      }

      return link;
   },

   listRenderer: function(data, rect, index)
   {
      var result = "";

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:32px;">' + '<div style="height:32px;">' + '<img style="height:32px;" src="'
            + this.getImageForBody(data) + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.bodyName.getName() + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelectedSearchList: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';
   },

   setSelectedInvitationList: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';
   },

   onSearchTextChange: function()
   {
      var value = this.searchTextField.value();
      var isValidForSearch = upro.model.proxies.BodyRegisterProxy.isValidNameSearchText(value);

      this.searchButton.disabled(!isValidForSearch);
   },

   onSearchButton: function()
   {
      if (!this.searchButton.disabled())
      {
         this.facade().sendNotification(upro.app.Notifications.FindBodyByNameRequest, this.searchTextField.value());
      }
   },

   onAddInvitationButton: function()
   {

   },

   onRemoveInvitationButton: function()
   {

   },

   onNotifyFindBodyResult: function(result)
   {
      var value = this.searchTextField.value();

      if (value == result.query.searchText)
      {
         var data = [];

         this.extractFindBodyResult(data, "Character", result.characters);
         this.extractFindBodyResult(data, "Corporation", result.corporations);

         var resultList = uki('#groupEdit_searchResultList');
         resultList.data(data);
      }
   },

   extractFindBodyResult: function(data, type, bodyNames)
   {
      bodyNames.forEach(function(bodyName)
      {
         var listEntry =
         {
            type: type,
            bodyName: bodyName
         };

         data.push(listEntry);
      });
   }

});

upro.view.mediators.GroupEditPanelMediator.NAME = "GroupEditPanel";
