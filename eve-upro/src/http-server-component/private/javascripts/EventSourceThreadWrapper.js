(function(context)
{
   var eventSource = null;

   function registerEventHandler(name)
   {
      eventSource.addEventListener(name, function(event)
      {
         context.postMessage(
         {
            name: name,
            data: event.data
         });
      }, false);
   }

   context.addEventListener("message", function(event)
   {
      if (event.data.type == "start")
      {
         eventSource = new EventSource(event.data.eventSourceUrl);
         event.data.eventNames.forEach(function(eventName)
         {
            registerEventHandler(eventName);
         });
      }
   }, false);

})(self);
