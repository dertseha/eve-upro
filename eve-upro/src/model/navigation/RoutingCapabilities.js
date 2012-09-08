(function(namespace)
{
   namespace.RoutingCapabilities =
   {
      jumpDrive:
      {
         rangeMinimum: 0.25,
         /** The maximum must be kept in sync with upro.nav.Constants.MaxJumpDistanceLightYears */
         rangeMaximum: 17.0,
         rangeStep: 0.25,

         defaultValue: 5.0,
         defaultInUse: false
      }
   };

})((typeof module !== 'undefined') ? module.exports : upro.model);
