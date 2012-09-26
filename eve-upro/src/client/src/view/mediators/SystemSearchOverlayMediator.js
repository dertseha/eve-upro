/**
 * A mediator for search-as-you-type system finding
 */
upro.view.mediators.SystemSearchOverlayMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.SystemSearchOverlayMediator.NAME, null);

      this.keyHandler = null;
      this.galaxy = null;

      this.input = "";
      this.resultLines = [];
   },

   onRegister: function()
   {
      this.setupKeyHandler();

   },

   setupKeyHandler: function()
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var dispatcher = hudSystem.getKeyboardHandler();

      this.keyHandler = new upro.sys.KeyboardHandler();
      this.keyHandler.onDown = this.onKeyDown.bind(this);
      this.keyHandler.onPress = this.onKeyPress.bind(this);

      dispatcher.addHandler(this.keyHandler);
   },

   clearResultLines: function()
   {
      this.resultLines.forEach(function(line)
      {
         line.element.remove();
      });
      this.resultLines = [];
   },

   /**
    * Finds solar systems by their name and given (regex) search string
    * 
    * @param searchString the regular expression to apply
    * @returns {Array} containing the matching systems
    */
   findSolarSystems: function(searchString)
   {
      var regexp = new RegExp(searchString, 'i');
      var result = [];

      this.galaxy.solarSystems.forEachObject(function(solarSystem)
      {
         if (regexp.test(solarSystem.name))
         {
            result.push(solarSystem);
         }
      });

      return result;
   },

   /**
    * Searches the known solar systems for given fragment in their name
    * 
    * @param fragment to look for
    * @returns {Boolean} true if it searched something
    */
   handleSearchString: function(fragment)
   {
      var result = [];
      var that = this;
      var rCode = false;

      if (this.galaxy && (fragment.length > 0))
      {
         var startChar = fragment.charAt(0);
         var startsWithDash = startChar === "-";
         var startsWithUpperCase = startChar.match(/[A-Z]/);
         var isShort = (fragment.length <= 3);

         rCode = true;
         if (!startsWithDash && (isShort || startsWithUpperCase))
         {
            result = this.findSolarSystems("\\b" + fragment);
         }
         if (!startsWithUpperCase && (result.length == 0))
         {
            result = this.findSolarSystems(fragment);
         }
         result.sort(function(solarSystemA, solarSystemB)
         {
            return solarSystemA.name.localeCompare(solarSystemB.name);
         });
         result = result.slice(0, upro.view.mediators.SystemSearchOverlayMediator.MAX_RESULTS);
      }

      this.clearResultLines();
      result.forEach(function(solarSystem)
      {
         that.addResultLine(solarSystem);
      });
      this.selectLine(0);

      return rCode;
   },

   addResultLine: function(solarSystem)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var paper = hudSystem.paper;
      var offset = this.resultLines.length;
      var viewCoord = hudSystem.realToViewCoordinates(
      {
         x: 0,
         y: 0
      });
      var entry =
      {
         solarSystem: solarSystem,
         selected: false,
         background: null,
         element: paper.set()
      };
      var lineHeight = upro.view.mediators.SystemSearchOverlayMediator.LINE_HEIGHT;

      viewCoord.y += lineHeight * offset;

      entry.background = paper.rect(viewCoord.x, viewCoord.y,
            upro.view.mediators.SystemSearchOverlayMediator.LINE_WIDTH, lineHeight);
      entry.background.attr(
      {
         "fill": "#423f22",
         "opacity": 0.8,
         "stroke-width": 0
      });
      entry.element.push(entry.background);

      var text = paper.text(viewCoord.x, viewCoord.y + (lineHeight / 2), solarSystem.name);
      text.attr(
      {
         "fill": "#FFF",
         "opacity": 0.8,
         "font-size": upro.view.mediators.SystemSearchOverlayMediator.TEXT_HEIGHT,
         "text-anchor": "start"
      });
      entry.element.push(text);

      var pointerHandler = new upro.sys.PointerHandler();

      pointerHandler.onUp = this.onResultLineSelect.bind(this, solarSystem);
      pointerHandler.onMove = this.onResultLineHighlight.bind(this, entry);
      entry.element.forEach(function(element)
      {
         new upro.sys.MouseListener(pointerHandler, Element.extend(element[0]));

         return true;
      });

      this.resultLines.push(entry);
   },

   getSelectedIndex: function()
   {
      var result = -1;

      if (this.resultLines.length > 0)
      {
         result = 0;
      }
      for ( var i = 0; i < this.resultLines.length; i++)
      {
         if (this.resultLines[i].selected)
         {
            result = i;
         }
      }

      return result;
   },

   selectLine: function(index)
   {
      if ((index >= 0) && (index < this.resultLines.length))
      {
         this.onResultLineHighlight(this.resultLines[index]);
      }
   },

   onKeyDown: function(keyCode)
   {
      if ((keyCode == Event.KEY_DELETE) || (keyCode == Event.KEY_BACKSPACE))
      {
         if (this.input.length > 0)
         {
            this.input = "";
            this.handleSearchString(this.input);
         }
      }
      else if (keyCode == Event.KEY_DOWN)
      {
         this.selectLine(this.getSelectedIndex() + 1);
      }
      else if (keyCode == Event.KEY_UP)
      {
         this.selectLine(this.getSelectedIndex() - 1);
      }
   },

   onKeyPress: function(charCode)
   {
      if ((charCode == 13) && (this.resultLines.length > 0))
      {
         var selected = this.getSelectedIndex();

         this.onResultLineSelect(this.resultLines[selected].solarSystem);
      }
      if ((charCode >= 32) && (this.input.length < 20))
      {
         this.input += String.fromCharCode(charCode);
         if (this.handleSearchString(this.input) && (this.resultLines.length == 0))
         {
            this.input = "";
         }
      }
   },

   onResultLineHighlight: function(highlightEntry)
   {
      if (!highlightEntry.selected)
      {
         this.resultLines.forEach(function(entry)
         {
            var isMatch = (entry === highlightEntry);
            var attr =
            {
               "fill": isMatch ? "#704010" : "#423f22",
               "opacity": isMatch ? 0.9 : 0.8
            };

            entry.background.animate(attr, 200, ">");
            entry.selected = isMatch;
         });
      }
   },

   onResultLineSelect: function(solarSystem)
   {
      this.input = "";
      this.handleSearchString("");

      this.facade().sendNotification(upro.app.Notifications.SelectSolarSystem, solarSystem);
   },

   onNotifyActiveGalaxyChanged: function(galaxyId)
   {
      this.galaxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME).getGalaxy(galaxyId);
      this.input = "";
      this.handleSearchString(this.input);
   }
});

upro.view.mediators.SystemSearchOverlayMediator.NAME = "SystemSearchOverlay";

upro.view.mediators.SystemSearchOverlayMediator.LINE_WIDTH = 200;
upro.view.mediators.SystemSearchOverlayMediator.LINE_HEIGHT = 20;
upro.view.mediators.SystemSearchOverlayMediator.TEXT_HEIGHT = 18;
upro.view.mediators.SystemSearchOverlayMediator.MAX_RESULTS = 10;
