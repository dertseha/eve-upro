
upro.model.proxies.UserViewDataProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UserViewDataProxy.NAME);

      this.highlightedObject = undefined;
   },

   onRemove: function()
   {
      if (this.highlightedObject !== undefined)
      {
         this.notifyHighlightedObjectChanged(undefined);
      }
   },

   notifyHighlightedObjectChanged: function(object)
   {
      this.facade().sendNotification(upro.app.Notifications.HighlightedObjectChanged, object);
   },

   setHighlightedObject: function(object)
   {
      if (this.highlightedObject !== object)
      {
         this.highlightedObject = object;
         this.notifyHighlightedObjectChanged(object);
      }
   }

});

upro.model.proxies.UserViewDataProxy.NAME = "UserViewData";
