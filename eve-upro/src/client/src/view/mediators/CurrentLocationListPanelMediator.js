/**
 * This panel shows the list of all pilots and their location
 */
upro.view.mediators.CurrentLocationListPanelMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, panelId, menuPath, menuIndex)
   {
      $super(upro.view.mediators.CurrentLocationListPanelMediator.NAME, null);

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
         view: 'ScrollPane',
         rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
         anchors: 'left top right bottom',
         id: 'currentLocationListPanel_base',
         textSelectable: false,
         style:
         {
            'border-style': 'solid',
            'border-width': '2px',
            'border-color': '#704010'
         },
         childViews: [
         {
            view: 'Table',
            rect: '0 0 ' + (dimension.width) + ' ' + (dimension.height),
            anchors: 'top left right bottom',
            id: 'currentLocationList',
            rowHeight: 36,
            style:
            {
               fontSize: '12px'
            },
            columns: [
            {
               view: 'table.CustomColumn',
               label: 'Solar System',
               width: 120,
               // sort: 'ASC',
               formatter: this.solarSystemFormatter.bind(this)
            },
            {
               view: 'table.CustomColumn',
               label: 'Pilot',
               resizable: true,
               minWidth: 100,
               width: 250,
               formatter: this.pilotFormatter.bind(this)
            } ]
         } ]
      });
      this.uiBase.attachTo(panel);

      var base = uki('#currentLocationListPanel_base');

      uiMediator.setBaseView(this.panelId, this.menuPath, this.menuIndex, upro.res.menu.IconData.CurrentLocation,
            upro.res.text.Lang.format("panels.currentLocation.list.menuLabel"), "currentLocationList", base);

      this.table = uki('#currentLocationList')[0];
      this.table.list().render(new upro.view.mediators.CurrentLocationListPanelMediator.TableRender(this.table));
      this.fillList();
   },

   fillList: function()
   {
      var locationTrackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
      var bodyRegisterProxy = this.facade().retrieveProxy(upro.model.proxies.BodyRegisterProxy.NAME);
      var data = [];

      locationTrackerProxy.forEachVisibleCharacter(function(charId)
      {
         var solarSystem = locationTrackerProxy.getLocation(charId);

         if (solarSystem)
         {
            var listEntry = [ solarSystem, bodyRegisterProxy.getBodyName("Character", charId) ];

            data.push(listEntry);
         }
      });

      this.table.data(data);
      this.table.parent().layout();
   },

   updateListForCharacter: function(characterId, bodyName)
   {
      var locationTrackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
      var bodyRegisterProxy = this.facade().retrieveProxy(upro.model.proxies.BodyRegisterProxy.NAME);
      var newBodyName = bodyName || bodyRegisterProxy.getBodyName("Character", characterId);
      var solarSystem = locationTrackerProxy.getLocation(characterId);
      var data = this.table.data();
      var listEntry = null;
      var foundIndex = -1;

      for ( var i = 0; (foundIndex < 0) && (i < data.length); i++)
      {
         listEntry = data[i];
         if (listEntry[1].getId() == newBodyName.getId())
         {
            foundIndex = i;
         }
      }
      if (solarSystem && locationTrackerProxy.isCharacterVisible(characterId))
      {
         if (!listEntry)
         {
            listEntry = [ solarSystem, newBodyName ];
            this.table.addRow(0, listEntry);
         }
         else
         {
            listEntry[0] = solarSystem;
            listEntry[1] = newBodyName;
            this.table.redrawRow(foundIndex);
         }
      }
      else if (foundIndex >= 0)
      {
         this.table.removeRow(foundIndex);
      }
      this.table.parent().layout();
   },

   getColorBySecurityLevel: function(solarSystem)
   {
      var colors = [ 'F00000', 'D73000', 'F04800', 'F06000', 'D77700', 'EFEF00', '8FEF2F', '00F000', '00EF47',
            '48F0C0', '2FEFEF' ];
      var index = (solarSystem.security * 10).toFixed(0);

      return '#' + colors[index];
   },

   getImageForCharacter: function(bodyName)
   {
      var link = "";

      link = "http://image.eveonline.com/Character/" + bodyName.getId() + "_32.jpg";

      return link;
   },

   pilotFormatter: function(entry)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:32px;">' + '<div style="height:32px;">' + '<img style="height:32px;" src="'
            + this.getImageForCharacter(entry) + '">' + '</img></div>' + '</td>';
      result += '<td>' + entry.getName() + '</td>';
      result += '</tr></table>';

      return result;
   },

   solarSystemFormatter: function(entry)
   {
      var result = '';

      result = '<table style="width:100%;height:100%"><tr>';
      result += '<td style="width:16px;">' + '<div style="height:16px;background:'
            + this.getColorBySecurityLevel(entry) + ';"></div>' + '</td>';
      result += '<td>' + entry.name + '</td>';
      result += '</tr></table>';

      return result;
   },

   onNotifyLocationStatusDisplayListChanged: function()
   {
      this.fillList();
   },

   onNotifyCharacterLocationStatus: function(characterId)
   {
      this.updateListForCharacter(characterId, null);
   },

   onNotifyKnownCharactersChanged: function(bodyNameList)
   {
      var that = this;

      bodyNameList.forEach(function(bodyName)
      {
         that.updateListForCharacter(bodyName.getId(), bodyName);
      });
   }
});

upro.view.mediators.CurrentLocationListPanelMediator.NAME = "CurrentLocationList";

upro.view.mediators.CurrentLocationListPanelMediator.TableRender = uki.newClass(uki.view.table.Render, new function()
{
   this.setSelected = function(item, data, state, hasFocus)
   {

   };
});
