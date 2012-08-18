(function(namespace)
{
   namespace.RoutingCapabilities =
   {
      jumpDrive:
      {
         rangeMinimum: 0.25,
         rangeMaximum: 20.0,
         rangeStep: 0.25,

         defaultValue: 5.0,
         defaultInUse: false
      }
   };

})((typeof module !== 'undefined') ? module.exports : upro.model);
