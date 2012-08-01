/**
 * Identification of a solar system ignored by the user (for route planning)
 */
upro.model.UserIgnoredSolarSystem = Class.create(upro.data.DataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.solarSystemId = null;
   },

   /**
    * Returns the solar system id
    * @return the solar system id
    */
   getSolarSystemId: function()
   {
      return this.solarSystemId;
   },

   /** {@inheritDoc} */
   onUpdated: function(properties)
   {
      this.solarSystemId = properties[upro.model.UserIgnoredSolarSystem.PROPERTY_SOLAR_SYSTEM_ID];
   }

});

upro.model.UserIgnoredSolarSystem.TYPE = "UserIgnoredSolarSystem";
upro.model.UserIgnoredSolarSystem.PROPERTY_SOLAR_SYSTEM_ID = "solarSystemId";
