/**
 * This panel shows the group member list
 */
upro.view.mediators.GroupMemberListPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.GroupMemberListPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;
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
         id: 'groupMemberListPanel_base',
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
               id: 'groupMemberList_list',
               rowHeight: 36,
               style:
               {
                  fontSize: '12px'
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

      var base = uki('#groupMemberListPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.GroupMembers,
            upro.res.text.Lang.format("panels.group.member.list.menuLabel"), "groupMemberList", base);
   },

   getImageForBody: function(listEntry)
   {
      var link = "http://image.eveonline.com/Character/" + listEntry.bodyName.getId() + "_32.jpg";

      return link;
   },

   getImageForOwnership: function(isOwner)
   {
      var image = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAEklEQVR42mNgGAWjYBSMAggAAAQQ"
            + "AAGvRYgsAAAAAElFTkSuQmCC";

      if (isOwner)
      {
         image = "iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAYklEQVR42mNgwAJ+/Pjh/+vXr/t/"
               + "/vz5D8IgNkiMgRgAUgjTiI6JMgTZZnQMkiNoAC7NMEx7Ayj2AsWBSHE0Ug0AbY3//v27PQiD2CQb"
               + "QHLoD1MDgIE3H4TJMgCkERsbHQAAwGZIIPOJWqUAAAAASUVORK5CYII=";
      }

      return image;
   },

   listRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:32px;">' + '<div style="height:32px;">' + '<img style="height:32px;" src="'
            + this.getImageForBody(data) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">'
            + '<img style="height:16px;" src="data:image/png;base64,' + this.getImageForOwnership(data.isOwner) + '">'
            + '</img></div>' + '</td>';
      result += '<td>' + data.bodyName.getName() + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelected: function(container, data, state, hasFocus)
   {

   },

   refillMemberList: function()
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var group = groupProxy.getSelectedGroup();
      var data = [];

      if (group)
      {
         var bodyRegisterProxy = this.facade().retrieveProxy(upro.model.proxies.BodyRegisterProxy.NAME);

         group.forEachMember(function(characterId)
         {
            var listEntry =
            {
               isOwner: group.isCharacterAllowedControl(characterId),
               bodyName: bodyRegisterProxy.getBodyName("Character", characterId)
            };

            data.push(listEntry);
         });
         data.sort(function(listEntryA, listEntryB)
         {
            return listEntryA.bodyName.getName().localeCompare(listEntryB.bodyName.getName());
         });
      }

      var memberList = uki('#groupMemberList_list');
      memberList.data(data);
      memberList.parent().layout();
   },

   onNotifyGroupSelected: function(group)
   {
      this.refillMemberList();
   },

   onNotifyKnownCharactersChanged: function()
   {
      // this could be made better: only refill if a character changed that is currently displayed...
      this.refillMemberList();
   }

});

upro.view.mediators.GroupMemberListPanelMediator.NAME = "GroupMemberListPanel";
