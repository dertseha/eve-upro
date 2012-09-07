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

      this.listUpdateTimer = upro.sys.Timer.getSingleTimer(this.onListUpdateTimer.bind(this));
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
            rowHeight: 38,
            style:
            {
               fontSize: '12px'
            },
            columns: [
            {
               view: 'table.CustomColumn',
               label: 'Solar System',
               width: 120,
               key: "solarSystem",
               sort: 'ASC',
               formatter: this.solarSystemFormatter.bind(this)
            },
            {
               view: 'table.CustomColumn',
               label: 'Pilot',
               resizable: true,
               minWidth: 100,
               width: 250,
               key: "bodyName",
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

      this.table.header().bind('columnClick', this.onColumnClick.bind(this));
      this.fillList();
   },

   onColumnClick: function(event)
   {
      var header = this.table.header();

      if (event.column.sort() == 'ASC')
      {
         event.column.sort('DESC');
      }
      else
      {
         event.column.sort('ASC');
      }
      header.redrawColumn(event.columnIndex);
      uki.each(header.columns(), function(i, col)
      {
         if ((col != event.column) && col.sort())
         {
            col.sort('');
            header.redrawColumn(i);
         }
      });
      this.prepareSort();
   },

   /**
    * Creates a cell entry for the table capable of providing both a basic value for UKIs internal sorting algorithm,
    * but also provide a backdoor to get to the original value.
    * 
    * If a key is specified in the column definition, UKI uses uki.attr() to access the cells data from the list entry.
    * If the entry itself is a function, it is called to retrieve the value. Internally, UKI uses this value for sorting
    * routines, so the sortValue is returned. But this sortValue is subclassed into another object that has a .data
    * member - pointing to the complete data object.
    * 
    * @param data the data to wrap
    * @param sortValue the sort value for UKI
    * @returns {Function} returning a wrapper
    */
   getCellEntry: function(data, sortValue)
   {
      var wrapper = Object.create(new String(sortValue));

      wrapper.data = data;
      wrapper.valueOf = function()
      {
         return sortValue;
      };
      wrapper.toString = function()
      {
         return sortValue;
      };
      var entry = function()
      {
         return wrapper;
      };

      return entry;
   },

   /**
    * Creates or updates a list entry.
    * 
    * @param template optional parameter referencing an existing list entry
    * @param solarSystem the solar system to set
    * @param bodyName the body name to set
    * @returns a list entry - either updated or created
    */
   getListEntry: function(template, solarSystem, bodyName)
   {
      var result = template || {};

      result.solarSystem = this.getCellEntry(solarSystem, solarSystem.name.toLowerCase());
      result.bodyName = this.getCellEntry(bodyName, bodyName.getName().toLowerCase());

      return result;
   },

   fillList: function()
   {
      var locationTrackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
      var bodyRegisterProxy = this.facade().retrieveProxy(upro.model.proxies.BodyRegisterProxy.NAME);
      var data = [];
      var that = this;

      locationTrackerProxy.forEachVisibleCharacter(function(charId)
      {
         var solarSystem = locationTrackerProxy.getLocation(charId);

         if (solarSystem)
         {
            var bodyName = bodyRegisterProxy.getBodyName("Character", charId);
            var listEntry = that.getListEntry(null, solarSystem, bodyName);

            data.push(listEntry);
         }
      });

      this.setData(data);
      this.prepareSort();
   },

   setData: function(data)
   {
      this.table.data(data);
      this.table.parent().layout();
   },

   prepareSort: function()
   {
      this.listUpdateTimer.start(50);
   },

   onListUpdateTimer: function()
   {
      var data = this.table.data();

      uki.each(this.table.header().columns(), function(i, col)
      {
         if (col.sort())
         {
            col.sortData(data);
         }
      });
      this.setData(data);
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

         var oldBodyName = listEntry.bodyName().data;
         if (oldBodyName.getId() == newBodyName.getId())
         {
            foundIndex = i;
         }
      }
      if (solarSystem && locationTrackerProxy.isCharacterVisible(characterId))
      {
         if (foundIndex < 0)
         {
            listEntry = this.getListEntry(null, solarSystem, newBodyName);
            this.table.addRow(0, listEntry);
            this.prepareSort();
         }
         else
         {
            this.getListEntry(listEntry, solarSystem, newBodyName);
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
      var bodyName = entry.data;

      result = '<table style="width:100%;height:100%"><tr style="height:32px;">';
      result += '<td style="width:32px;">' + '<div style="height:32px;">' + '<img style="height:32px;" src="'
            + this.getImageForCharacter(bodyName) + '">' + '</img></div>' + '</td>';
      result += '<td>' + bodyName.getName() + '</td>';
      result += '</tr></table>';

      return result;
   },

   solarSystemFormatter: function(entry)
   {
      var result = '';
      var solarSystem = entry.data;

      result = '<table style="width:100%;height:100%"><tr style="height:32px;">';
      result += '<td style="width:16px;">' + '<div style="height:16px;background:'
            + this.getColorBySecurityLevel(solarSystem) + ';"></div>' + '</td>';
      result += '<td>' + solarSystem.name + '</td>';
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
