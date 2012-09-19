/**
 * A stored route
 */
upro.model.RouteInfo = Class.create(upro.model.AbstractSharedObjectInfo,
{
   initialize: function($super, id, controller, interestChecker, solarSystemResolver)
   {
      $super(id, "Route", controller, interestChecker);

      this.data = {};
      this.solarSystemResolver = solarSystemResolver;
   },

   /**
    * @returns its name
    */
   getName: function()
   {
      return this.data.name;
   },

   /**
    * @returns an array of SystemRouteEntry objects describing the route
    */
   getRoute: function()
   {
      return this.data.route;
   },

   /**
    * Updates the data
    * 
    * @param data data object to extract from
    */
   updateData: function(data)
   {
      this.data.name = data.name;
      this.setRoute(data.route);
   },

   /**
    * Sets the route from given raw data list
    * 
    * @param rawDataList array of raw data entries
    */
   setRoute: function(rawDataList)
   {
      var that = this;

      this.data.route = [];
      rawDataList.forEach(function(rawData)
      {
         that.data.route.push(new upro.nav.SystemRouteEntry(that.solarSystemResolver
               .findSolarSystemById(rawData.solarSystemId), rawData.entryType, rawData.nextJumpType));
      });
   }
});
