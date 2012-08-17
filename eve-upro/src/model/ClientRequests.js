var RequestNames =
{
   /**
    * Sent periodically by a connected client, this request serves as a keep-alive message and also lets the system know
    * of the current IGB headers (such as location, ...)
    */
   Status: 0,

   /**
    * Set the currently active galaxy (for the view). Body: { galaxyId: int }
    */
   SetActiveGalaxy: 0,

   /**
    * Sets the route of the autopilot.
    */
   SetAutopilotRoute: 0,

   /**
    * Changes an ignored solar system
    */
   SetIgnoredSolarSystem: 0,

   /**
    * Set the jump gates routing capability
    */
   SetRoutingCapabilityJumpGates: 0
};

function staticInit()
{
   for ( var name in RequestNames)
   {
      if (RequestNames[name] === 0)
      {
         RequestNames[name] = name;
      }
   }
}

staticInit();

module.exports.RequestNames = RequestNames;
