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

})((typeof module !== 'undefined') ?
{
   namespace: module.exports,
   schema: require('js-schema')
} :
{
   namespace: upro.data,
   schema: schema
});
