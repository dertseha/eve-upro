/**
 * This is the jump corridor edit panel
 */
upro.view.mediators.JumpCorridorEditPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.JumpCorridorEditPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.displayedId = null;

      this.nameText = null;
      this.jumpTypeText = null;
      this.entryText = null;
      this.exitText = null;

      this.updateButton = null;
      this.destroyButton = null;
   },

   onRegister: function()
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);
      var panel = $(this.panelId);
      var dimension = panel.getDimensions();
      var halfWidth = dimension.width / 2;

      this.uiBase = uki(
      {
         view: 'Box',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'left top right bottom',
         id: 'jumpCorridorEditPanel_base',
         background: 'theme(simpleFrame)',
         childViews: [
               upro.view.UiHelper.getLabelView(5, 5, 90, 25, upro.res.text.Lang.format("general.labels.itemName")),
               {
                  view: 'TextField',
                  rect: '100 5 ' + (dimension.width - 105) + ' ' + 25,
                  anchors: 'left top right',
                  background: 'theme(box)',
                  id: 'jumpCorridorEdit_name'
               },
               upro.view.UiHelper.getLabelView(5, 35, 90, 25, upro.res.text.Lang.format("jumpCorridor.jumpTypeLabel")),
               {
                  view: 'TextField',
                  rect: '100 35 ' + (dimension.width - 105) + ' ' + 25,
                  anchors: 'left top right',
                  background: 'theme(box)',
                  id: 'jumpCorridorEdit_jumpType',
                  disabled: true
               }, upro.view.UiHelper.getLabelView(5, 65, 90, 25, upro.res.text.Lang.format("jumpCorridor.entryLabel")),
               {
                  view: 'TextField',
                  rect: '100 65 ' + (dimension.width - 105) + ' ' + 25,
                  anchors: 'left top right',
                  background: 'theme(box)',
                  id: 'jumpCorridorEdit_entry',
                  disabled: true
               }, upro.view.UiHelper.getLabelView(5, 95, 90, 25, upro.res.text.Lang.format("jumpCorridor.exitLabel")),
               {
                  view: 'TextField',
                  rect: '100 95 ' + (dimension.width - 105) + ' ' + 25,
                  anchors: 'left top right',
                  background: 'theme(box)',
                  id: 'jumpCorridorEdit_exit',
                  disabled: true
               },
               {
                  view: 'Button',
                  rect: '100 125 ' + 100 + ' ' + 25,
                  anchors: 'left top',
                  id: 'jumpCorridorEdit_updateButton',
                  text: upro.res.text.Lang.format("panels.jumpCorridor.edit.updateButton")
               },
               {
                  view: 'Button',
                  rect: '100 155 ' + 100 + ' ' + 25,
                  anchors: 'left top',
                  id: 'jumpCorridorEdit_destroyButton',
                  text: upro.res.text.Lang.format("panels.jumpCorridor.edit.destroyButton")
               } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#jumpCorridorEditPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.WormholeOut,
            upro.res.text.Lang.format("panels.jumpCorridor.edit.menuLabel"), "jumpCorridorEdit", base);

      this.nameText = uki("#jumpCorridorEdit_name")[0];
      this.jumpTypeText = uki("#jumpCorridorEdit_jumpType")[0];
      this.entryText = uki("#jumpCorridorEdit_entry")[0];
      this.exitText = uki("#jumpCorridorEdit_exit")[0];

      uki("#jumpCorridorEdit_jumpType")[0]._input.readOnly = true;
      uki("#jumpCorridorEdit_entry")[0]._input.readOnly = true;
      uki("#jumpCorridorEdit_exit")[0]._input.readOnly = true;

      this.updateButton = uki('#jumpCorridorEdit_updateButton')[0];
      this.updateButton.bind('click', this.onUpdateButton.bind(this));
      this.updateButton.disabled(true);
      this.destroyButton = uki('#jumpCorridorEdit_destroyButton')[0];
      this.destroyButton.bind('click', this.onDestroyButton.bind(this));
      this.destroyButton.disabled(true);
   },

   showJumpCorridor: function(jumpCorridor)
   {
      if (jumpCorridor)
      {
         var isOwner = jumpCorridor.isClientOwner();

         this.displayedId = jumpCorridor.getId();
         this.nameText.value(jumpCorridor.getName());
         this.jumpTypeText.value(upro.res.text.Lang.format("jumpCorridor.typeName." + jumpCorridor.getJumpType()));
         this.entryText.value(jumpCorridor.getEntrySolarSystem().name);
         this.exitText.value(jumpCorridor.getExitSolarSystem().name);

         this.updateButton.disabled(!isOwner);
         this.destroyButton.disabled(!isOwner);
      }
      else
      {
         this.displayedId = null;
         this.nameText.value('');
         this.jumpTypeText.value('');
         this.entryText.value('');
         this.exitText.value('');

         this.updateButton.disabled(true);
         this.destroyButton.disabled(true);
      }
   },

   onUpdateButton: function()
   {
      if (!this.updateButton.disabled())
      {
         var notifyBody =
         {
            id: this.displayedId,
            data:
            {
               name: upro.model.proxies.JumpCorridorProxy.filterName(this.nameText.value(), this.entryText.value(),
                     this.exitText.value())
            }
         };

         this.facade().sendNotification(upro.app.Notifications.UpdateJumpCorridorRequest, notifyBody);
      }
   },

   onDestroyButton: function()
   {
      if (!this.destroyButton.disabled())
      {
         this.facade().sendNotification(upro.app.Notifications.DestroyJumpCorridorRequest, this.displayedId);
      }
   },

   onNotifyJumpCorridorDataChanged: function(info)
   {
      if (this.displayedId == info.getId())
      {
         this.showJumpCorridor(info);
      }
   }
});

upro.view.mediators.JumpCorridorEditPanelMediator.NAME = "JumpCorridorEditPanel";
