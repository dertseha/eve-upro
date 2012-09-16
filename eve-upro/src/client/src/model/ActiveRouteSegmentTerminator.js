/**
 * A Null object terminating the list of next segments
 */
upro.model.ActiveRouteSegmentTerminator = Class.create(upro.model.AbstractActiveRouteSegment,
{
   initialize: function($super)
   {
      $super(upro.model.ActiveRouteSegmentTerminator.INSTANCE || this);
   }
});

upro.model.ActiveRouteSegmentTerminator.INSTANCE = new upro.model.ActiveRouteSegmentTerminator();
