(function(context)
{

   var clientEvents =
   {
      /**
       * Sent periodically, this event ensures the connection stays alive. Timers are sent regardless of session state.
       * 
       * Data: new Date().getTime()
       */
      Timer:
      {
         name: 0,
         schema: Number,
         isValid: null
      },

      /**
       * Notifies the accepted start of a session. Each request the client sends to the server needs to have the
       * sessionId set from this event.
       */
      Session:
      {
         name: 0,
         schema:
         {
            sessionId: String,
            user: context.commonSchemata.userSchema
         },
         isValid: null
      },

      /**
       * A broadcast that the client has some interest in. The header contains the type identification which then
       * defines the body. See ClientBroadcastEvents.js for details.
       */
      Broadcast:
      {
         name: 0,
         schema:
         {
            header:
            {
               type: String
            },
            body: undefined
         },
         isValid: null
      }
   };

   for ( var name in clientEvents)
   {
      var event = clientEvents[name];

      event.name = name;
      event.isValid = context.schema(event.schema);
   }

   context.namespace.clientEvents = clientEvents;

})((typeof module !== 'undefined') ?
{
   namespace: module.exports,
   commonSchemata: require('./CommonSchemata.js'),
   schema: require('js-schema')
} :
{
   namespace: upro.data,
   commonSchemata: upro.data,
   schema: schema
});
