/**
 * This panel shows the controls for the routing rules
 */
upro.view.mediators.RoutingRulesPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.RoutingRulesPanelMediator.NAME, null);

      this.panelId = panelId;
      this.menuPath = menuPath;
      this.menuIndex = menuIndex;

      this.rulesList = null;
      this.onButton = null;
      this.offButton = null;
      this.upButton = null;
      this.downButton = null;
      this.increaseButton = null;
      this.decreaseButton = null;
      this.recalcButton = null;

      this.selectionTimer = upro.sys.Timer.getSingleTimer(this.onSelectionTimer.bind(this));
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
         id: 'routingRulesPanel_base',
         childViews: [
         {
            view: 'ScrollPane',
            rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height - 90),
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
               rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height - 90),
               anchors: 'top left right bottom',
               id: 'routingRulesPanel_list',
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
         },
         {
            view: 'Button',
            rect: '0 ' + (dimension.height - 85) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom left width',
            text: upro.res.text.Lang.format("routing.rules.up"),
            id: 'routingRulesPanel_up'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' ' + (dimension.height - 85) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom right width',
            text: upro.res.text.Lang.format("panels.routing.rules.increase.command"),
            id: 'routingRulesPanel_increase'
         },
         {
            view: 'Button',
            rect: '0 ' + (dimension.height - 55) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom left width',
            text: upro.res.text.Lang.format("routing.rules.down"),
            id: 'routingRulesPanel_down'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' ' + (dimension.height - 55) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom right width',
            text: upro.res.text.Lang.format("panels.routing.rules.decrease.command"),
            id: 'routingRulesPanel_decrease'
         },
         {
            view: 'Button',
            rect: '0 ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom left width',
            text: upro.res.text.Lang.format("panels.routing.rules.on.command"),
            id: 'routingRulesPanel_on'
         },
         {
            view: 'Button',
            rect: '0 ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom left width',
            text: upro.res.text.Lang.format("panels.routing.rules.off.command"),
            id: 'routingRulesPanel_off'
         },
         {
            view: 'Button',
            rect: (halfWidth + 2) + ' ' + (dimension.height - 25) + ' ' + (halfWidth - 2) + ' 25',
            anchors: 'bottom right width',
            text: upro.res.text.Lang.format("routing.recalculate"),
            id: 'routingRulesPanel_recalc'
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#routingRulesPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.List,
            upro.res.text.Lang.format("panels.routing.rules.menuLabel"), "routingRules", base);

      this.rulesList = uki('#routingRulesPanel_list');
      this.onButton = uki('#routingRulesPanel_on')[0];
      this.onButton.disabled(true);
      this.onButton.bind('click', this.onInUseButton.bind(this));
      this.offButton = uki('#routingRulesPanel_off')[0];
      this.offButton.disabled(true);
      this.offButton.visible(false);
      this.offButton.bind('click', this.onInUseButton.bind(this));
      this.offButton.bind('click', this.onInUseButton.bind(this));
      this.upButton = uki('#routingRulesPanel_up')[0];
      this.upButton.disabled(true);
      this.upButton.bind('click', this.onUpButton.bind(this));
      this.downButton = uki('#routingRulesPanel_down')[0];
      this.downButton.disabled(true);
      this.downButton.bind('click', this.onDownButton.bind(this));
      this.increaseButton = uki('#routingRulesPanel_increase')[0];
      this.increaseButton.disabled(true);
      this.increaseButton.bind('click', this.onIncreaseButton.bind(this));
      this.decreaseButton = uki('#routingRulesPanel_decrease')[0];
      this.decreaseButton.disabled(true);
      this.decreaseButton.bind('click', this.onDecreaseButton.bind(this));
      this.recalcButton = uki('#routingRulesPanel_recalc')[0];
      this.recalcButton.bind('click', this.onRecalcButton.bind(this));
   },

   getSelectedRule: function()
   {
      var row = this.rulesList.selectedRow();

      return row && row.routingRule;
   },

   refillList: function()
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);
      var data = [];
      var selectedRule = this.getSelectedRule();
      var selectedIndex = -1;
      var i = 0;

      rules = settingsProxy.getRoutingRules();

      rules.forEach(function(routingRule)
      {
         listEntry =
         {
            routingRule: routingRule
         };

         if (selectedRule && (routingRule.getRuleType() === selectedRule.getRuleType()))
         {
            selectedIndex = i;
         }
         i++;
         data.push(listEntry);
      });

      this.rulesList.data(data);
      this.rulesList.selectedIndex(selectedIndex);
      this.rulesList.parent().layout();
   },

   getImageForInUse: function(rule)
   {
      var image = upro.res.ImageData.Transparent;

      if (rule.getInUse())
      {
         image = upro.res.ImageData.Check;
      }

      return image;
   },

   getImageForRuleType: function(rule)
   {
      var typeImages =
      {
         minSecurity: upro.res.ImageData.MinSecurity,
         maxSecurity: upro.res.ImageData.MaxSecurity,
         jumps: upro.res.ImageData.Hash,
         jumpFuel: upro.res.ImageData.Fuel
      };
      var image = typeImages[rule.getRuleType()];

      return image || upro.res.ImageData.Transparent;
   },

   getTextForRule: function(rule)
   {
      var parameter = rule.getFixedParameter();

      return upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType() + "].paramLimit", parameter);
   },

   listRenderer: function(data, rect, index)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForInUse(data.routingRule) + '">' + '</img></div>' + '</td>';
      result += '<td style="width:16px;">' + '<div style="height:16px;">' + '<img style="height:16px;" src="'
            + this.getImageForRuleType(data.routingRule) + '">' + '</img></div>' + '</td>';
      result += '<td>' + this.getTextForRule(data.routingRule) + '</td>';
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
      var rule = this.getSelectedRule();

      if (rule)
      {
         this.upButton.disabled(rule.getIndex() < 1);
         this.downButton.disabled((rule.getIndex() + 1) >= this.rulesList.data().length);

         this.increaseButton.disabled(!rule.isBelowMaximum());
         this.decreaseButton.disabled(!rule.isAboveMinimum());

         this.onButton.disabled(rule.getInUse());
         this.onButton.visible(!rule.getInUse());
         this.onButton.parent().layout();
         this.offButton.disabled(!rule.getInUse());
         this.offButton.visible(rule.getInUse());
         this.offButton.parent().layout();
      }
      else
      {
         this.upButton.disabled(true);
         this.downButton.disabled(true);
         this.increaseButton.disabled(true);
         this.decreaseButton.disabled(true);
         this.onButton.disabled(true);
         this.offButton.disabled(true);
         this.onButton.visible(true);
         this.offButton.visible(false);
      }
   },

   onInUseButton: function()
   {
      var rule = this.getSelectedRule();

      if (rule)
      {
         this.facade().sendNotification(upro.app.Notifications.UserRoutingRuleToggle, rule.getRuleType());
      }
   },

   onUpButton: function()
   {
      var rule = this.getSelectedRule();

      if (!this.upButton.disabled())
      {
         this.facade().sendNotification(upro.app.Notifications.UserRoutingRuleUp, rule.getRuleType());
      }
   },

   onDownButton: function()
   {
      var rule = this.getSelectedRule();

      if (!this.downButton.disabled())
      {
         this.facade().sendNotification(upro.app.Notifications.UserRoutingRuleDown, rule.getRuleType());
      }
   },

   onIncreaseButton: function()
   {
      var rule = this.getSelectedRule();

      if (!this.increaseButton.disabled())
      {
         this.facade().sendNotification(upro.app.Notifications.UserRoutingRuleMore, rule.getRuleType());
      }
   },

   onDecreaseButton: function()
   {
      var rule = this.getSelectedRule();

      if (!this.decreaseButton.disabled())
      {
         this.facade().sendNotification(upro.app.Notifications.UserRoutingRuleLess, rule.getRuleType());
      }
   },

   onRecalcButton: function()
   {
      this.facade().sendNotification(upro.app.Notifications.ActiveRouteRecalculate);
   },

   onNotifyUserRoutingRulesChanged: function()
   {
      this.refillList();
   }
});

upro.view.mediators.RoutingRulesPanelMediator.NAME = "RoutingRulesPanel";
