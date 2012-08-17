var Broadcasts =
{
   /**
    * Sent for each new client connection
    */
   ClientConnected: 0,

   /**
    * Sent for each lost client connection
    */
   ClientDisconnected: 0,

   /**
    * Selects amongst all connected (and trusted) IGB connections one to control the client
    */
   CharacterClientControlSelection: 0,

   /**
    * Caused periodically by EVE data related clients, based on IGB header data. Can come more than once with the same
    * data when there are several IGB tabs open.
    */
   EveStatusUpdateRequest: 0,

   /**
    * Sent by the location service when the currently known location of a character changed (becomes known)
    */
   CharacterLocationStatus: 0,

   /**
    * Client Request
    */
   ClientRequestSetActiveGalaxy: 0,

   /**
    * Sent when the currently active galaxy has been changed.
    */
   CharacterActiveGalaxy: 0,

   /**
    * Client Request
    */
   ClientRequestSetAutopilotRoute: 0,

   /**
    * Notifies the current autopilot route of the character
    */
   CharacterAutopilotRoute: 0,

   /**
    * Which route index the character is next
    */
   CharacterAutopilotRouteIndex: 0,

   /**
    * Client Request
    */
   ClientRequestSetIgnoredSolarSystem: 0,

   /**
    * The list of currently ignored solar systems for a character
    */
   CharacterIgnoredSolarSystems: 0,

   /**
    * The current routing capabilities of a character
    */
   CharacterRoutingCapabilities: 0,

   /**
    * Client request for setting routing capabilities for jump gates
    */
   ClientRequestSetRoutingCapabilityJumpGates: 0,

   /**
    * Client request for setting routing capabilities for jump drives
    */
   ClientRequestSetRoutingCapabilityJumpDrive: 0,

   /**
    * The current routing rules of a character
    */
   CharacterRoutingRules: 0,

   /**
    * Sets data of a routing rule
    */
   ClientRequestSetRoutingRuleData: 0,

   /**
    * Sets the index of a routing rule (priority)
    */
   ClientRequestSetRoutingRuleIndex: 0
};

function staticInit()
{
   for ( var name in Broadcasts)
   {
      if (Broadcasts[name] === 0)
      {
         Broadcasts[name] = name;
      }
   }
}

staticInit();

module.exports.Broadcasts = Broadcasts;
