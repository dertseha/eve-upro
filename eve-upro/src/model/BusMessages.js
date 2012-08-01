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
    * Caused periodically by EVE data related clients, based on IGB header data. Can come more than once with the same
    * data when there are several IGB tabs open.
    */
   EveStatusUpdateRequest: 0,

   /**
    * Sent by the location service when the currently known location of a character changed (becomes known)
    */
   CharacterLocationStatus: 0
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
