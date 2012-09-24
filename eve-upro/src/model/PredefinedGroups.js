(function(context)
{
   context.namespace.predefinedGroupIdNamespace = '6c7599b0e34b4dfab0e8b646164e8c6d';

   // Predefined group IDs for the 'groups' a character is always in.
   // Created based on UuidFactory.v5(predefinedGroupIdNamespace, name)
   context.namespace.predefinedGroupIds =
   {
      'Corporation': '48cf12d7dabd5f5e97e43a98258aaa78',
      'Alliance': '77662cfa2c345ea39ffcea905332c8be'
   };

   // Reverse lookup of the group type by its predefined ID
   context.namespace.predefinedGroupTypes = {};
   for ( var type in context.namespace.predefinedGroupIds)
   {
      context.namespace.predefinedGroupTypes[context.namespace.predefinedGroupIds[type]] = type;
   }

})((typeof module !== 'undefined') ?
{
   namespace: module.exports
} :
{
   namespace: upro.model
});
