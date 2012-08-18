(function(context)
{
   context.namespace.routeSchema =
   {
      entryType: [ 'Transit', 'Waypoint', 'Checkpoint' ],
      solarSystemId: Number,
      nextJumpType: [ null, 'None', 'JumpGate', 'JumpDrive', 'JumpBridge', 'StaticWormhole', 'DynamicWormhole' ]
   };

})((typeof module !== 'undefined') ?
{
   namespace: module.exports
} :
{
   namespace: upro.data
});
