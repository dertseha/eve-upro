
var EventNames =
{
   /**
    * Sent periodically, this event ensures the connection stays alive. Timers are sent regardless of session state.
    * 
    * Data: new Date().getTime()
    */
   Timer: 0,

   /**
    * Notifies the accepted start of a session. Each request the client sents to the server needs to have the sessionId
    * set from this event.
    * 
    * Data: { sessionId: integer user: object containing user information }
    */
   Session: 0,

   /**
    * A broadcast that the client has some interest in
    * 
    * Data: { header: { type: type as per broadcast } body: { ... as per broadcast } }
    */
   Broadcast: 0
};

function staticInit()
{
   for ( var name in EventNames)
   {
      if (EventNames[name] === 0)
      {
         EventNames[name] = name;
      }
   }
}

staticInit();

module.exports.EventNames = EventNames;
