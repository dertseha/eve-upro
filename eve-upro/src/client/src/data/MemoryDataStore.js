/**
 * The memory data store holds the data in memory
 */
upro.data.MemoryDataStore = Class.create(upro.data.DataStore,
{
   initialize: function()
   {
      this.store = {};
      this.pendingActions = [];

      this.initializeStore();
   },

   /**
    * This creates a transaction for this store with which data can be modified after commit.
    * 
    * @return A DataStoreWriteTransaction object
    */
   createWriteTransaction: function()
   {
      return new upro.data.MemoryDataStoreWriteTransaction(this);
   },

   /**
    * Returns the entry for given id
    * 
    * @return the entry for given id
    */
   getEntry: function(infoId)
   {
      var typeMap = this.store[infoId.getType()];
      var entry = undefined;

      if (typeMap != undefined)
      {
         entry = typeMap[infoId.getId()];
      }

      return entry;
   },

   /**
    * Returns the reference between the given two entries
    * 
    * @return the reference between the given two entries { undefined, false, true }
    */
   getReference: function(infoId, parentId)
   {
      var entry = this.getEntry(infoId);
      var ref = undefined;

      if (entry !== undefined)
      {
         ref = entry.getReference(parentId);
      }

      return ref;
   },

   /**
    * Returns true if the info with given id exists
    * 
    * @param infoId the id to look for
    * @return true if the info with given id exists
    */
   containsEntry: function(infoId)
   {
      return this.getEntry(infoId) != undefined;
   },

   /**
    * Creates an entry for given id
    * 
    * @param infoId key to use
    * @return a registered entry object
    */
   createEntry: function(infoId)
   {
      var typeMap = this.store[infoId.getType()];
      var entry = new upro.data.MemoryDataStoreEntry(infoId, this);

      if (typeMap === undefined)
      {
         this.store[infoId.getType()] = typeMap = {};
      }
      typeMap[infoId.getId()] = entry;

      return entry;
   },

   /**
    * Deletes entry with given key
    * 
    * @param infoId key to look for
    */
   deleteEntry: function(infoId)
   {
      var entry = this.getEntry(infoId);

      if (entry !== undefined)
      {
         delete this.store[infoId.getType()][infoId.getId()];

         for ( var childIdString in entry.children)
         { // un-own all children (deletes them if orphaned)
            var child = entry.children[childIdString];

            this.setReference(child, entry, undefined);
         }
         for ( var parentIdString in entry.references)
         { // remove all parent references
            var parent = entry.references[parentIdString].entry;

            this.setReference(entry, parent, undefined);
         }

         entry.destruct();
      }
   },

   /**
    * Sets the reference between given entry and a parent Notifies the bound objects (if existing). If the reference is
    * removed and the entry has no owner, it is deleted
    * 
    * @param entry child entry
    * @param parent parent entry
    * @param owning true, false or undefined (which removes the reference)
    */
   setReference: function(entry, parent, owning)
   {
      var exists = parent.children[entry.infoId.toString()];

      if (owning === undefined)
      {
         if (exists)
         {
            delete parent.children[entry.infoId.toString()];
            delete entry.references[parent.infoId.toString()];
            parent.notifyReferenceRemoved(entry);
            entry.notifyReferenceRemoved(parent);
         }
      }
      else
      {
         parent.children[entry.infoId.toString()] = entry;
         entry.references[parent.infoId.toString()] =
         {
            "entry": parent,
            "owning": owning
         };
         if (!exists)
         {
            entry.notifyReferenceAdded(parent);
            parent.notifyReferenceAdded(entry);
         }
      }
      if (!entry.isOwned())
      {
         this.deleteEntry(entry.infoId);
      }
   },

   initializeStore: function()
   {
      // this.createEntry(upro.data.InfoId.System);
   },

   /**
    * Commits given list of actions (called from Transaction)
    * 
    * @param actions array of functions accepting a modifier as parameter
    */
   commit: function(actions)
   {
      this.pendingActions.push(actions);
      this.deferProcessPendingActions();
   },

   /**
    * Defers the processing of pending actions
    */
   deferProcessPendingActions: function()
   {
      // this.processPendingActions.bind(this).defer();
      this.processPendingActions();
   },

   /**
    * Processes the oldest entry of pending actions
    */
   processPendingActions: function()
   {
      if (this.pendingActions.length > 0)
      {
         var actions = this.pendingActions.pop();

         this.processActions(actions);
      }
   },

   /**
    * Processes the given list of actions
    * 
    * @param actions array of functions accepting a modifier as parameter
    */
   processActions: function(actions)
   {
      if (this.areActionsOk(actions))
      {
         var executor = new upro.data.MemoryDataStoreModifyExecutor(this);

         for ( var i = 0; i < actions.length; i++)
         {
            var action = actions[i];

            action(executor);
         }
      }
   },

   /**
    * Returns true if given list of actions (as part of a transactions) are OK
    * 
    * @return true if given list of actions (as part of a transactions) are OK
    */
   areActionsOk: function(actions)
   {
      var tester = new upro.data.MemoryDataStoreModifyTester(this);
      var ok = true;

      for ( var i = 0; ok && (i < actions.length); i++)
      {
         var action = actions[i];

         ok = action(tester);
      }

      return ok;
   }
});
