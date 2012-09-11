(function(context)
{
   context.namespace.uuidSchema = /^([a-f]|[0-9]){32}$/;

   context.namespace.userSchema =
   {
      characterId: Number,
      characterName: String,
      corporationId: Number,
      corporationName: String
   };

   context.namespace.routeSchema =
   {
      entryType: [ 'Transit', 'Waypoint', 'Checkpoint' ],
      solarSystemId: Number,
      nextJumpType: [ null, 'None', 'JumpGate', 'JumpDrive', 'JumpBridge', 'StaticWormhole', 'DynamicWormhole' ]
   };

   context.namespace.groupIdType = context.namespace.uuidSchema;
   context.namespace.groupOwnerSchema = Array.of(Number);
   context.namespace.groupAdvertisementInterestSchema = [
   {
      scope: 'Character',
      id: Number
   },
   {
      scope: 'Corporation',
      id: Number
   } ];

   context.namespace.sharingInterestSchema = [
   {
      scope: 'Character',
      id: Number
   },
   {
      scope: 'Corporation',
      id: Number
   },
   {
      scope: 'Group',
      id: context.namespace.groupIdType
   } ];

   var standardSharingBodyDefinition =
   {
      schema:
      {
         id: context.namespace.uuidSchema,
         interest: Array.of(context.namespace.sharingInterestSchema)
      },
      isValid: null
   };

   /**
    * @returns a standard header definition
    */
   context.namespace.getStandardSharingBodyDefinition = function()
   {
      return standardSharingBodyDefinition;
   };

   context.namespace.jumpCorridorSchema =
   {
      name: String,
      entrySolarSystemId: Number,
      exitSolarSystemId: Number,
      jumpType: String
   };

})((typeof module !== 'undefined') ?
{
   namespace: module.exports,
   schema: require('js-schema')
} :
{
   namespace: upro.data,
   schema: schema
});
