/**
 * A tracked projection is for having software-tracked positions in a scene
 *
 * The projection keeps a confirmation counter. This appears to be a nasty hack:
 * Apparently, shortly, after finishing a mouse operation, a projection result
 * is simply wrong. I have no idea why this is happening;
 * Perhaps the code is querying not-yet verified mvMatrix values - i.e., some that
 * were based on an old mouse data.
 */
upro.scene.TrackedProjection = Class.create(
{
   /**
    * Initializes the object
    * @param id to identify the tracking with
    * @param position to project
    * @param callback to call on confirmation changes. Parameters: this and isConfirmed
    */
   initialize: function(id, position, callback)
   {
      this.id = id;
      this.position = position;
      this.callback = callback;

      this.projectedPositon = null;
      this.confirmed = 0;
   },

   /**
    * Returns the id
    * @return the id
    */
   getId: function()
   {
      return this.id;
   },

   /**
    * Returns the position
    * @return the position
    */
   getPosition: function()
   {
      return this.position;
   },

   /**
    * Returns the projected position. May be null.
    * @return the projected position. May be null.
    */
   getProjectedPosition: function()
   {
      return this.projectedPosition;
   },

   /**
    * Returns true if the projection has been confirmed
    * @return true if the projection has been confirmed
    */
   isProjectionConfirmed: function()
   {
      return this.confirmed == upro.scene.TrackedProjection.CONFIRMATION_LIMIT;
   },

   /**
    * Resets the projection
    * @param doCallback whether the callback should be invoked if becoming unconfirmed
    */
   reset: function(doCallback)
   {
      var wasConfirmed = this.isProjectionConfirmed();

      this.projectedPosition = null;
      this.confirmed = 0;
      if (wasConfirmed && doCallback)
      {
         this.callback(this);
      }
   },

   /**
    * Sets the projected position. If the projection is set with identical
    * values enough times, the callback will be called.
    * If the projection changes, the callback is called as well the first time.
    * @param realPos a structure with 'x' and 'y' members
    */
   setProjectedPosition: function(realPos)
   {
      var wasConfirmed = this.isProjectionConfirmed();

      if (!this.projectedPosition && !realPos)
      {  // item stays unprojected
         if (!wasConfirmed)
         {
            this.onConfirmation();
         }
      }
      else if (!this.projectedPosition || !realPos ||
         (this.projectedPosition.x != realPos.x) || (this.projectedPosition.y != realPos.y))
      {  // change of values
         this.projectedPosition = !realPos ? null :
         {
            "x": realPos.x,
            "y": realPos.y
         };
         this.confirmed = 1;
//         if (wasConfirmed)
         {
            this.callback(this, false); // false here assumes the limit is greater than 1
         }
      }
      else if (!wasConfirmed)
      {  // values stayed identical
         this.onConfirmation();
      }
   },

   /**
    * Internal helper for handling a confirmed situation. Adds one to the
    * confirmation counter and calls the callback if satisfied.
    */
   onConfirmation: function()
   {
      this.confirmed++;

      var isConfirmed = this.isProjectionConfirmed();
//      if (isConfirmed)
      {
         this.callback(this, isConfirmed);
      }
   }
});

/** How many times a projection must be done until it is confirmed. */
upro.scene.TrackedProjection.CONFIRMATION_LIMIT = 5;
