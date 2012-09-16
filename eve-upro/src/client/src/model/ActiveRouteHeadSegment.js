/**
 * The abstract base class for a route segment entry of the active route
 */
upro.model.ActiveRouteHeadSegment = Class.create(upro.model.AbstractActiveRouteSegment,
{
   initialize: function($super)
   {
      $super(upro.model.ActiveRouteSegmentTerminator.INSTANCE);
   },

   /** {@inheritDoc} */
   addCheckpoint: function(solarSystem, jumpType)
   {
      this.nextSegment = upro.model.ActiveRouteSegment.createSegment(solarSystem, jumpType);

      return this.nextSegment;
   }
});
