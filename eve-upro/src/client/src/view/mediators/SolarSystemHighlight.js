/**
 * This helper class for mediators handles a solar systme highlight. It creates a bracket around a specific solar system
 * and adds some text next to it. 3D to 2D tracking is set up as well.
 */
upro.view.mediators.SolarSystemHighlight = Class.create(
{
   initialize: function(sceneMediator, hudSystem, key, textOptions, bracketOptions)
   {
      this.sceneMediator = sceneMediator;
      this.hudSystem = hudSystem;
      this.key = key || upro.Uuid.newV4();

      this.visible = false;
      this.inView = false;

      this.solarSystem = null;
      this.bracketOptions =
      {
         size: upro.hud.Button.Scale,
         fillColor: "#FFFFFF",
         fillOpacity: 0.1,
         strokeColor: "#FFFFFF",
         strokeOpacity: 0.2
      };
      this.bracketOptionMappings =
      {
         fillColor: [ "fill" ],
         fillOpacity: [ "fill-opacity" ],
         strokeColor: [ "stroke" ],
         strokeOpacity: [ "stroke-opacity" ]
      };
      if (bracketOptions)
      {
         this.setOptions(bracketOptions, this.bracketOptions);
      }
      this.bracket = this.hudSystem.createHexagon(this.bracketOptions.size).hide();
      this.bracket.attr(this.getAttributes(this.bracketOptions, this.bracketOptionMappings));
      this.textOptions =
      {
         value: "",
         color: "#FFFFFF",
         height: upro.view.mediators.SolarSystemHighlight.DEFAULT_TEXT_HEIGHT,
         bracketSide: 0,
         bracketPadding: 5,
         textAnchor: "start"
      };
      this.textOptionMappings =
      {
         value: [ "text" ],
         color: [ "fill" ],
         height: [ "font-size" ],
         textAnchor: [ "text-anchor" ]
      };
      if (textOptions)
      {
         this.setOptions(textOptions, this.textOptions);
      }
      this.info = this.hudSystem.paper.text(0, 0, "").hide();
      this.info.attr(this.getAttributes(this.textOptions, this.textOptionMappings));
   },

   /**
    * Removes the highlight and frees bound resources
    */
   dispose: function()
   {
      this.setSolarSystem(null);
      if (this.bracket)
      {
         this.bracket.remove();
         this.bracket = null;
      }
      if (this.info)
      {
         this.info.remove();
         this.info = null;
      }
   },

   /**
    * Sets bracket options
    * 
    * @param options object containing the options
    */
   setBracketOptions: function(options)
   {
      this.setOptions(options, this.bracketOptions);
      this.bracket.attr(this.getAttributes(options, this.bracketOptionMappings));
   },

   /**
    * @param optionName the name of the option to return
    * @returns the option value of given name
    */
   getTextOption: function(optionName)
   {
      return this.textOptions[optionName];
   },

   /**
    * Sets text options
    * 
    * @param options object containing the options
    */
   setTextOptions: function(options)
   {
      this.setOptions(options, this.textOptions);
      this.info.attr(this.getAttributes(options, this.textOptionMappings));
   },

   /**
    * Processes options and moves them over to some base options
    * 
    * @param options the options to set
    * @param baseOptions generic options container
    */
   setOptions: function(options, baseOptions)
   {
      var optionName = null;

      for (optionName in options)
      {
         var value = options[optionName];

         if (baseOptions[optionName] !== undefined)
         {
            baseOptions[optionName] = value;
         }
      }
   },

   /**
    * Retrives an object containing attributes for the component, mapped via some associations
    * 
    * @param options the options to extract
    * @param attrMappings object containing mappings from given options to component attributes
    * @returns object containing the to-be-set attibutes
    */
   getAttributes: function(options, attrMappings)
   {
      var attr = {};
      var optionName = null;

      for (optionName in options)
      {
         var value = options[optionName];
         var mappings = attrMappings[optionName];

         if (mappings)
         {
            mappings.forEach(function(attrName)
            {
               attr[attrName] = value;
            });
         }
      }

      return attr;
   },

   /**
    * Sets the solar system and starts tracking if not yet started
    * 
    * @param solarSystem the solar system to track. null shuts down tracking
    */
   setSolarSystem: function(solarSystem)
   {
      if (this.sceneMediator)
      {
         if (this.solarSystem)
         {
            this.sceneMediator.removeSolarSystemTrack(this.key, this.solarSystem);
            this.solarSystem = null;
         }
         this.solarSystem = solarSystem;
         if (this.solarSystem)
         {
            this.sceneMediator.addSolarSystemTrack(this.key, solarSystem, this.onProjectionChanged.bind(this));
         }
      }
   },

   /**
    * Will make the highlight visible
    */
   show: function()
   {
      this.visible = true;
      if (this.inView)
      {
         this.bracket.show();
         this.info.show();
      }
   },

   /**
    * Hides the highlight - will not be visible
    */
   hide: function()
   {
      this.visible = false;
      this.bracket.hide();
      this.info.hide();
   },

   /**
    * Callback for a change in a projection
    * 
    * @param tracker running the projection
    * @param valid whether the projection is confirmed
    */
   onProjectionChanged: function(tracker, confirmed)
   {
      var realPos = tracker.getProjectedPosition();

      if (realPos)
      {
         var pixel = this.hudSystem.realToViewCoordinates(realPos);
         var offset = upro.hud.Button.getOffset[this.textOptions.bracketSide](this.textOptions.bracketPadding);

         this.bracket.attr(
         {
            "transform": "T" + pixel.x + "," + pixel.y
         });
         this.info.attr(
         {
            "x": pixel.x + offset.x,
            "y": pixel.y + offset.y
         });
         this.inView = true;
         if (this.visible)
         {
            this.bracket.show();
            this.info.show();
         }
      }
      else
      {
         this.inView = false;
         this.bracket.hide();
         this.info.hide();
      }
   }
});

upro.view.mediators.SolarSystemHighlight.DEFAULT_TEXT_HEIGHT = 15;
