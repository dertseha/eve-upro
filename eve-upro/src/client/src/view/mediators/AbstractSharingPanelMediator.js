/**
 * This panel is the abstract implementation of a sharing panel
 */
upro.view.mediators.AbstractSharingPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, name, uiKeyPrefix, panelId, menuPath, menuIndex)
   {
      $super(name, null);

      this.sharedObject = null;

      this.uiKeyPrefix = uiKeyPrefix;
      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.nameTextField = null;
      this.searchTextField = null;
      this.searchButton = null;
      this.addShareButton = null;
      this.removeShareButton = null;
      this.addOwnerButton = null;
      this.removeOwnerButton = null;

      this.searchResultList = null;
      this.memberList = null;
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
         id: this.uiKeyPrefix + '_base',
         childViews: [
         {
            view: 'TextField',
            rect: '0 0 ' + (dimension.width) + ' ' + 25,
            anchors: 'left top right',
            background: 'theme(box)',
            id: this.uiKeyPrefix + '_name',
            placeholder: ""
         },
         {
            view: 'TextField',
            rect: '0 30 ' + (halfWidth - 2) + ' ' + 25,
            anchors: 'left top width',
            background: 'theme(box)',
            id: this.uiKeyPrefix + '_searchEntity',
            placeholder: upro.res.text.Lang.format("panels.sharedObject.edit.searchEntity.hint")
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' 30 ' + (halfWidth - 2) + ' 25',
            anchors: 'top right width',
            text: upro.res.text.Lang.format("panels.sharedObject.edit.searchEntity.command"),
            id: this.uiKeyPrefix + '_searchEntities'
         },
         {
            view: 'ScrollPane',
            rect: '0 60 ' + (halfWidth - 6) + ' ' + (dimension.height - 120),
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
               rect: '0 0 ' + (halfWidth - 6) + ' ' + (dimension.height - 120),
               anchors: 'top left right bottom',
               id: this.uiKeyPrefix + '_searchResultList',
               rowHeight: 36,
               style:
               {
                  fontSize: '12px'
               },
               render:
               {
                  render: this.renderSearchResultList.bind(this),
                  setSelected: this.setSelectedSearchResultList.bind(this)
               },
               multiselect: true
            } ]
         },
         {
            view: 'ScrollPane',
            rect: (halfWidth + 6) + ' 60 ' + (halfWidth - 6) + ' ' + (dimension.height - 120),
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
               rect: '0 0 ' + (halfWidth - 6) + ' ' + (dimension.height - 120),
               anchors: 'top left right bottom',
               id: this.uiKeyPrefix + '_memberList',
               rowHeight: 36,
               style:
               {
                  fontSize: '12px'
               },
               render:
               {
                  render: this.renderMemberList.bind(this),
                  setSelected: this.setSelectedMemberList.bind(this)
               },
               multiselect: true
            } ]
         },
         {
            view: 'Button',
            rect: '0 ' + (dimension.height - 55) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom left width',
            text: upro.res.text.Lang.format("panels.sharedObject.edit.addShare.command"),
            id: this.uiKeyPrefix + '_addShare'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' ' + (dimension.height - 55) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom right width',
            text: upro.res.text.Lang.format("panels.sharedObject.edit.removeShare.command"),
            id: this.uiKeyPrefix + '_removeShare'
         },
         {
            view: 'Button',
            rect: '0 ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom left width',
            text: upro.res.text.Lang.format("panels.sharedObject.edit.addOwner.command"),
            id: this.uiKeyPrefix + '_addOwner'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom right width',
            text: upro.res.text.Lang.format("panels.sharedObject.edit.removeOwner.command"),
            id: this.uiKeyPrefix + '_removeOwner'
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki("#" + this.uiKeyPrefix + "_base");
      var baseViewInfo = this.getBaseViewInfo();

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, baseViewInfo.icon, baseViewInfo.menuLabel,
            baseViewInfo.viewId, base);

      this.nameTextField = uki("#" + this.uiKeyPrefix + "_name")[0];
      this.nameTextField._input.readOnly = true;
      this.searchTextField = uki("#" + this.uiKeyPrefix + "_searchEntity");
      this.searchTextField.bind('keydown keyup', this.onSearchTextChange.bind(this));
      this.searchTextField.bind('keyup', this.onSearchTextKeyUp.bind(this));
      this.searchButton = uki("#" + this.uiKeyPrefix + "_searchEntities");
      this.searchButton.disabled(true);
      this.searchButton.bind('click', this.onSearchButton.bind(this));
      this.addShareButton = uki("#" + this.uiKeyPrefix + "_addShare");
      this.addShareButton.disabled(true);
      this.addShareButton.bind('click', this.onAddShareButton.bind(this));
      this.removeShareButton = uki("#" + this.uiKeyPrefix + "_removeShare");
      this.removeShareButton.disabled(true);
      this.removeShareButton.bind('click', this.onRemoveShareButton.bind(this));
      this.addOwnerButton = uki("#" + this.uiKeyPrefix + "_addOwner");
      this.addOwnerButton.disabled(true);
      this.addOwnerButton.bind('click', this.onAddOwnerButton.bind(this));
      this.removeOwnerButton = uki("#" + this.uiKeyPrefix + "_removeOwner");
      this.removeOwnerButton.disabled(true);
      this.removeOwnerButton.bind('click', this.onRemoveOwnerButton.bind(this));
      this.memberList = uki("'#" + this.uiKeyPrefix + "_memberList")[0];
      this.memberList.parent().layout();
      this.searchResultList = uki("#" + this.uiKeyPrefix + "_searchResultList")[0];
      this.searchResultList.parent().layout();

      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      this.characterInfo = sessionProxy.getCharacterInfo();
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
      else if (listEntry.type == "Alliance")
      {
         link = "http://image.eveonline.com/Alliance/" + listEntry.bodyName.getId() + "_32.png";
      }
      else if (listEntry.type == "Group")
      {
         link = upro.res.ImageData.Group;
      }

      return link;
   },

   getImageForOwner: function(listEntry)
   {
      var link = upro.res.ImageData.Transparent;
      var interestList = listEntry.getInterestAsArray();
      var that = this;

      interestList.forEach(function(interest)
      {
         if (that.sharedObject.isInterestAllowedControl(interest))
         {
            link = upro.res.ImageData.Owner;
         }
      });

      return link;
   },

   renderSearchResultList: function(data, rect, index)
   {
      var result = "";

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:32px;">' + '<div style="height:32px;">' + '<img style="height:32px;" src="'
            + this.getImageForBody(data) + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.bodyName.getName() + '</td>';
      result += '</tr></table>';

      return result;
   },

   renderMemberList: function(data, rect, index)
   {
      var result = "";

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:32px;">' + '<div style="height:32px;">' + '<img style="height:32px;" src="'
            + this.getImageForBody(data) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForOwner(data) + '">' + '</img></div>' + '</td>';
      result += '<td>' + data.bodyName.getName() + '</td>';
      result += '</tr></table>';

      return result;
   },

   setSelectedSearchResultList: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';

      if (state)
      {
         this.memberList.selectedIndexes([]);
      }
      this.updateControllerControls.bind(this).defer();
   },

   setSelectedMemberList: function(container, data, state, hasFocus)
   {
      container.style['font-weight'] = state ? 'bold' : 'normal';
      container.style['background'] = state ? '#704010' : '';

      if (state)
      {
         this.searchResultList.selectedIndexes([]);
      }
      this.updateControllerControls.bind(this).defer();
   },

   /**
    * Creates a list entry based on a body name. Its interest will resolve to the body itself
    * 
    * @param type type (scope) of the body
    * @param bodyName BodyName object
    * @returns list entry object
    */
   getBodyNameBasedListEntry: function(type, bodyName)
   {
      var interest =
      {
         scope: type,
         id: bodyName.getId()
      };
      var listEntry =
      {
         type: type,
         bodyName: bodyName,
         getInterestAsArray: function()
         {
            return [ interest ];
         }
      };

      return listEntry;
   },

   onSearchTextKeyUp: function(event)
   {
      var key = event.which || event.keyCode;

      if (key == 13)
      {
         this.onSearchButton();
      }
   },

   onSearchTextChange: function(event)
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

   onAddShareButton: function()
   {
      var notifyBody = this.getSelectedInterestNotificationBody(this.searchResultList);

      this.requestAddShares(notifyBody);
   },

   onRemoveShareButton: function()
   {
      var notifyBody = this.getSelectedInterestNotificationBody(this.memberList);

      this.requestRemoveShares(notifyBody);
   },

   onAddOwnerButton: function()
   {
      var notifyBody = this.getSelectedInterestNotificationBody(this.searchResultList);

      this.requestAddOwner(notifyBody);
   },

   onRemoveOwnerButton: function()
   {
      var notifyBody = this.getSelectedInterestNotificationBody(this.memberList);

      this.requestRemoveOwner(notifyBody);
   },

   getSelectedInterestNotificationBody: function(uiList)
   {
      var listEntries = uiList.selectedRows();
      var notifyBody =
      {
         sharedObject: this.getSharedObject(),
         interest: this.getSelectedInterest(listEntries)
      };

      return notifyBody;
   },

   getSelectedInterest: function(listEntries)
   {
      var interest = [];

      listEntries.forEach(function(listEntry)
      {
         var entryInterest = listEntry.getInterestAsArray();

         interest = interest.concat(entryInterest);
      });

      return interest;
   },

   isValidCharacterForSharing: function(bodyName)
   {
      return bodyName.getId() == this.characterInfo.characterId;
   },

   isValidCorporationForSharing: function(bodyName)
   {
      return bodyName.getId() == this.characterInfo.corporationId;
   },

   isValidAllianceForSharing: function(bodyName)
   {
      return this.characterInfo.allianceId && (bodyName.getId() == this.characterInfo.allianceId);
   },

   isValidGroupForSharing: function(group)
   {
      return group.isClientMember();
   },

   onNotifyFindBodyResult: function(result)
   {
      var value = this.searchTextField.value();

      if (value == result.query.searchText)
      {
         var data = [];

         this.addMatchingGroupsToResultList(value, data);
         this.extractFindBodyResult(data, "Character", result.characters.filter(this.isValidCharacterForSharing
               .bind(this)));
         this.extractFindBodyResult(data, "Corporation", result.corporations.filter(this.isValidCorporationForSharing
               .bind(this)));
         this.extractFindBodyResult(data, "Alliance", result.alliances
               .filter(this.isValidAllianceForSharing.bind(this)));

         this.sortListData(data);

         this.searchResultList.data(data);
         this.searchResultList.parent().layout();
      }
   },

   addMatchingGroupsToResultList: function(searchText, data)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var regexp = new RegExp(searchText, 'i');
      var that = this;

      groupProxy.forEachGroup(function(group)
      {
         if (that.isValidGroupForSharing(group) && regexp.test(group.getName()))
         {
            var listEntry = that.getBodyNameBasedListEntry("Group", new upro.model.ResolvedBodyName(group.getId(),
                  group.getName().escapeHTML()));

            data.push(listEntry);
         }
      });
   },

   extractFindBodyResult: function(data, type, bodyNames)
   {
      var that = this;

      bodyNames.forEach(function(bodyName)
      {
         var listEntry = that.getBodyNameBasedListEntry(type, bodyName);

         data.push(listEntry);
      });
   },

   sortListData: function(data)
   {
      data.sort(function(listEntryA, listEntryB)
      {
         return listEntryA.bodyName.getName().toLowerCase().localeCompare(listEntryB.bodyName.getName().toLowerCase());
      });
   },

   setSharedObject: function(sharedObject)
   {
      this.sharedObject = sharedObject;
      if (sharedObject)
      {
         this.nameTextField.value(sharedObject.getName());
      }
      else
      {
         this.nameTextField.value("");
      }
      this.fillMemberList();
      this.updateControllerControls();
   },

   getSharedObject: function()
   {
      return this.sharedObject;
   },

   updateControllerControls: function()
   {
      if (this.sharedObject)
      {
         var isController = this.sharedObject.isClientAllowedControl();
         var resultSelected = this.searchResultList.selectedRows().length > 0;
         var memberSelected = this.memberList.selectedRows().length > 0;

         this.addShareButton.disabled(!isController || !resultSelected);
         this.removeShareButton.disabled(!isController || !memberSelected);
         this.addOwnerButton.disabled(!isController || !resultSelected);
         this.removeOwnerButton.disabled(!isController || !memberSelected);
      }
      else
      {
         this.addShareButton.disabled(true);
         this.removeShareButton.disabled(true);
         this.addOwnerButton.disabled(true);
         this.removeOwnerButton.disabled(true);
      }
   },

   fillMemberList: function()
   {
      var data = [];
      var that = this;

      if (this.sharedObject)
      {
         this.forEachMember(function(member)
         {
            var bodyName = that.getBodyName(member.scope, member.id);
            var listEntry = that.getBodyNameBasedListEntry(member.scope, bodyName);

            data.push(listEntry);
         });
         this.sortListData(data);
      }
      this.memberList.data(data);
      this.memberList.parent().layout();
   },

   forEachMember: function(callback)
   {
      if (this.sharedObject.isClientAllowedControl())
      {
         this.sharedObject.forEachShare(callback);
      }
      else
      {
         this.sharedObject.forEachOwner(callback);
      }
   },

   getBodyName: function(scope, id)
   {
      var bodyRegisterProxy = this.facade().retrieveProxy(upro.model.proxies.BodyRegisterProxy.NAME);
      var bodyName = null;

      if (bodyRegisterProxy.isTypeSupported(scope))
      {
         bodyName = bodyRegisterProxy.getBodyName(scope, id);
      }
      else if (scope == "Group")
      {
         var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
         var group = groupProxy.getGroup(id);

         if (group)
         {
            bodyName = new upro.model.ResolvedBodyName(id, group.getName().escapeHTML());
         }
      }

      if (!bodyName)
      {
         bodyName = new upro.model.ResolvedBodyName(id, '<strong style="color:#FF0000">'
               + upro.res.text.Lang.format("panels.sharedObject.edit.restrictedBody") + "</string>");
      }

      return bodyName;
   },

   onNotifyKnownCharactersChanged: function()
   {
      this.fillMemberList();
   },

   onNotifyKnownCorporationsChanged: function()
   {
      this.fillMemberList();
   },

   onNotifyKnownAlliancesChanged: function()
   {
      this.fillMemberList();
   },

   onNotifyGroupListChanged: function()
   {
      this.fillMemberList();
   },

   onNotifySharedObjectDataChanged: function(sharedObject)
   {
      if (this.sharedObject && (this.sharedObject.getId() == sharedObject.getId()))
      {
         this.setSharedObject(sharedObject);
      }
   }

});
