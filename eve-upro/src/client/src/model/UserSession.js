/**
 *
 */
upro.model.UserSession = Class.create(upro.model.AbstractProxiedDataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.corridorPrepSystemId = null;
      this.corridorPrepJumpType = null;
      this.corridorPreparationChanged = null;
   },

   /**
    * Returns the prepared system id for a new corridor
    * @return the prepared system id for a new corridor
    */
   getCorridorPrepSystemId: function()
   {
      return this.corridorPrepSystemId;
   },

   /**
    * Returns the prepared jump type for a new corridor
    * @return the prepared jump type for a new corridor
    */
   getCorridorPrepJumpType: function()
   {
      return this.corridorPrepJumpType;
   },

   /** {@inheritDoc} */
   onUpdated: function(properties)
   {
      var changed = false;

      {  // corridor preparation
         changed = false;
         if (this.decodeNumberMember(properties, upro.model.UserSession.PROPERTY_CORRIDOR_PREP_SYSTEM_ID))
         {
            changed = true;
         }
         if (this.decodeStringMember(properties, upro.model.UserSession.PROPERTY_CORRIDOR_PREP_JUMP_TYPE))
         {
            changed = true;
         }
         if (changed && this.corridorPreparationChanged)
         {
            this.corridorPreparationChanged();
         }
      }
   }
});

upro.model.UserSession.TYPE = "UserSession";
upro.model.UserSession.PROPERTY_CORRIDOR_PREP_SYSTEM_ID = "corridorPrepSystemId";
upro.model.UserSession.PROPERTY_CORRIDOR_PREP_JUMP_TYPE = "corridorPrepJumpType";
