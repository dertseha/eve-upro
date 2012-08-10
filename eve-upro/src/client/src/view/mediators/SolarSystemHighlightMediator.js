/**
 * A mediator to highlight solar systems
 */
upro.view.mediators.SolarSystemHighlightMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.SolarSystemHighlightMediator.NAME, null);

      this.entries = {};
   },

   onRegister: function()
   {

   },

   /**
    * Adds a highlight identified by given key and given initial options
    * 
    * @param key key under which the highlight is accessible
    * @param textOptions initial text options
    * @param bracketOptions initial bracket options
    * @returns {upro.view.mediators.SolarSystemHighlight} the created highlight object
    */
   addHighlight: function(key, textOptions, bracketOptions)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var highlight = new upro.view.mediators.SolarSystemHighlight(sceneMediator, hudSystem, key, textOptions,
            bracketOptions);

      this.entries[highlight.key] = highlight;

      return highlight;
   },

   /**
    * @param key id of the highlight
    * @returns the highlight associated with given key
    */
   getHighlight: function(key)
   {
      return this.entries[key];
   },

   /**
    * Removes the highlight of given key
    * 
    * @param key id of the highlight
    */
   removeHighlight: function(key)
   {
      var highlight = this.entries[key];

      delete this.entries[key];
      highlight.dispose();
   },

   /**
    * Commonly used shortcut for setting/changing the solar system of a highlight. If the solar system is given, it is
    * applied. If not, then the highlight is hidden.
    * 
    * @param key id of the highlight
    * @param solarSystem the new solarSystem to track
    */
   setHighlightSolarSystem: function(key, solarSystem)
   {
      var highlight = this.entries[key];

      highlight.hide();
      highlight.setSolarSystem(solarSystem);
      if (solarSystem)
      {
         highlight.setTextOptions(
         {
            value: solarSystem.name
         });
         highlight.show();
      }
   }
});

upro.view.mediators.SolarSystemHighlightMediator.NAME = "SolarSystemHighlight";
upro.view.mediators.SolarSystemHighlightMediator.TEXT_HEIGHT = 20;
