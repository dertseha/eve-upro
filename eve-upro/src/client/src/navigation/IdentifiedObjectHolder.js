/**
 * This class is basically a map of objects that have an ID. It furthermore provides functionality to both listen to
 * changes of the map and to wait for specific additions.
 */
upro.nav.IdentifiedObjectHolder = Class.create(
{
   initialize: function(owner)
   {
      this.owner = owner;
      this.position = this.owner.position;

      this.objects = {};
      this.listeners = [];
      this.waiters = {};
   },

   toString: function()
   {
      return "ObjectHolder for " + this.owner.toString();
   },

   /**
    * Iterates through all objects and passes them one by one to given callback
    * 
    * @param callback the function to call; signature: function(object) { }
    */
   forEachObject: function(callback)
   {
      for ( var id in this.objects)
      {
         callback(this.objects[id]);
      }
   },

   /**
    * Adds the given object to the map. First all listeners are informed, then all waiters.
    * 
    * @param object the object to add
    */
   add: function(object)
   {
      var waiterList = this.waiters[object.id];
      var i;

      this.objects[object.id] = object;

      for (i = this.listeners.length - 1; i >= 0; i--)
      {
         this.listeners[i].onAdded(object);
      }
      if (waiterList !== undefined)
      {
         for (i = waiterList.length - 1; i >= 0; i--)
         {
            var waiter = waiterList[i];

            waiter(object);
         }
         delete this.waiters[object.id];
      }
   },

   /**
    * Removes the object with given ID
    * 
    * @param id of the object to remove
    */
   remove: function(id)
   {
      var object = this.objects[id];

      if (object !== undefined)
      {
         delete this.objects[id];

         for ( var i = this.listeners.length - 1; i >= 0; i--)
         {
            this.listeners[i].onRemoved(object);
         }
      }
   },

   /**
    * Retrieves the object with given ID. Returns undefined if not found
    * 
    * @param id to look for
    * @return the object with given ID.
    */
   get: function(id)
   {
      return this.objects[id];
   },

   /**
    * Tries to find all objects of which the name contains the given name part, case insenstitive.
    * 
    * @param namePart to be found.
    * @return an array of the found objects
    */
   find: function(namePart)
   {
      var result = [];
      var namePartLower = namePart.toLowerCase();

      for (objectId in this.objects)
      {
         var object = this.objects[objectId];
         var nameLower = object.name.toLowerCase();

         if (nameLower.indexOf(namePartLower) >= 0)
         {
            result.push(object);
         }
      }

      return result;
   },

   /**
    * Returns the object that has the given name (case insensitive)
    * 
    * @param searchName the name of the object to look for
    * @return the object that has the given name
    */
   findExact: function(searchName)
   {
      var result = null;
      var searchNameLower = searchName.toLowerCase();

      for (objectId in this.objects)
      {
         var object = this.objects[objectId];
         var nameLower = object.name.toLowerCase();

         if (nameLower == searchNameLower)
         {
            result = object;
         }
      }

      return result;
   },

   /**
    * Registers the given listener for any changes
    * 
    * @param listener to register
    */
   register: function(listener)
   {
      var index = this.listeners.indexOf(listener);

      if (index < 0)
      {
         this.listeners.push(listener);
      }
   },

   /**
    * Unregisters the given listener
    * 
    * @param listener to unregister
    */
   unregister: function(listener)
   {
      var index = this.listeners.indexOf(listener);

      if (index >= 0)
      {
         this.listeners.splice(index, 1);
      }
   },

   /**
    * Requests to wait for an object with given ID. If the object is already contained, the waiter function will be
    * called immediately. Otherwise, it will be stored and called when the object is added. The waiter will be removed
    * automatically when it is called
    * 
    * @param id to look for
    * @param waiter to call as soon as the object with given ID is added
    */
   waitFor: function(id, waiter)
   {
      var object = this.get(id);

      if (object !== undefined)
      {
         waiter(object);
      }
      else
      {
         var waiterList = this.waiters[id];

         if (waiterList === undefined)
         {
            this.waiters[id] = waiterList = [];
         }
         waiterList.push(waiter);
      }
   },

   /**
    * Stops waiting for an object
    * 
    * @param id to look for
    * @param waiter to unregister
    */
   stopWaitingFor: function(id, waiter)
   {
      var waiterList = this.waiters[id];

      if (waiterList !== undefined)
      {
         var index = waiterList.indexOf(waiter);

         if (index >= 0)
         {
            waiterList.splice(index, 1);
            if (waiterList.length == 0)
            {
               delete this.waiters[id];
            }
         }
      }
   }
});
