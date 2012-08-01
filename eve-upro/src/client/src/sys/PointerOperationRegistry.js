/**
 * This registry contains a list of pointer operations that are
 * triggered based on received pointer events.
 *
 * Operations are registered based on a certain button combination.
 *
 * Button presses are routed to the current active state, but
 * if the pointer is moved beyond a certain threshold AND the
 * button combination matches a differet operation, the current
 * one will be stopped and the new matching made active.
 *
 * PointerOperation.onUp() will NOT be received by any operation if
 * the active one changed - only onStop() is called for the old one.
 *
 * Pointer rotation does not affect anything and will always be
 * forwarded to the currently active operation.
 */
upro.sys.PointerOperationRegistry = Class.create(upro.sys.PointerHandler,
{
   initialize: function()
   {
      this.nullEntry = { "buttonStates": [], "operation": upro.sys.PointerOperationRegistry.NullOperation };

      this.operations = [];
      this.activeEntry = this.nullEntry;

      this.lastDivergingPosition = null;
   },

   /**
    * Registers given operation at given combination of button states.
    * Operations are ordered, with earlier operations having higher priority than later ones.
    * This is important regarding button combinations - The operation without any active button
    * should always go last!
    *
    * Note: The newly registered operation will not be called immediately, even if
    * the current state would match. During startup, the pointer position is unknown,
    * and defaulting to 0|0|0 would result in undesired situations. After all, the system
    * is meant to be re-active, so waiting for a first action is the best.
    *
    * @param buttonStates boolean array of buttons to match
    * @param operation the PointerOperation to register
    */
   registerOperation: function(buttonStates, operation)
   {
      this.operations.push({ "buttonStates": buttonStates.slice(0), "operation": operation });
   },

   /** {@inheritDoc} */
   onDown: function(position, buttonStates, changeMask)
   {
      this.updateActiveOperation(position, buttonStates);
      this.activeEntry.operation.onDown(position, buttonStates, changeMask);
   },

   /** {@inheritDoc} */
   onUp: function(position, buttonStates, changeMask)
   {
      var newStateEntry = this.findMatchingOperationForStates(buttonStates);

      this.lastDivergingPosition = null;
      if ((this.activeEntry != newStateEntry) &&
         !this.doesStateMatchMask(this.activeEntry.buttonStates, newStateEntry.buttonStates))
      {
         this.setActiveOperationEntry(newStateEntry, position, buttonStates);
      }
      else
      {
         this.activeEntry.operation.onUp(position, buttonStates, changeMask);
      }
   },

   /** {@inheritDoc} */
   onMove: function(position, buttonStates)
   {
      this.updateActiveOperation(position, buttonStates);
      this.activeEntry.operation.onMove(position, buttonStates);
   },

   /** {@inheritDoc} */
   onRotate: function(position, buttonStates, rotation)
   {
      var newStateEntry = this.findMatchingOperationForStates(buttonStates);

      if (this.activeEntry != newStateEntry)
      {
         this.setActiveOperationEntry(newStateEntry, position, buttonStates);
      }
      this.activeEntry.operation.onRotate(position, buttonStates, rotation);
   },

   /**
    * Updates the activate operation according to current button states.
    * Also considers some threshold regarding movement between button down/up
    * @param position the current pointer position
    * @param buttonStates the current button states
    */
   updateActiveOperation: function(position, buttonStates)
   {
      var newStateEntry = this.findMatchingOperationForStates(buttonStates);

      if (this.activeEntry != newStateEntry)
      {
         var vecPos = vec3.create([position.x, position.y, position.z]);

         if (!this.lastDivergingPosition)
         {
            this.lastDivergingPosition = vecPos;
         }
         else if (vec3.length(vec3.subtract(vecPos, this.lastDivergingPosition)) >=
            upro.sys.PointerOperationRegistry.MoveThreshold)
         {
            this.setActiveOperationEntry(newStateEntry, position, buttonStates);
         }
      }
   },

   /**
    * Checks whether a state is contained within a given mask
    * @param state array of booleans to check if included in mask
    * @param mask array of booleans to check against
    * @return true if state is within mask
    */
   doesStateMatchMask: function(state, mask)
   {
      var rCode = true;

      for (var i = 0; rCode && (i < state.length); i++)
      {
         if (state[i] && !mask[i])
         {
            rCode = false;
         }
      }

      return rCode;
   },

   /**
    * Returns the operation that fits best (highest priority) for given
    * combination of button states
    * @param buttonStates to filter for
    * @return an operation entry matching the button states
    */
   findMatchingOperationForStates: function(buttonStates)
   {
      var foundStateEntry = null;

      for (var i = 0; (foundStateEntry == null) && (i < this.operations.length); i++)
      {
         var entry = this.operations[i];

         if (this.doesStateMatchMask(entry.buttonStates, buttonStates))
         {
            foundStateEntry = entry;
         }
      }

      return (foundStateEntry != null) ? foundStateEntry : this.nullEntry;
   },

   /**
    * Sets the active operation entry; Calls Stop on previous and Start on new
    * @param entry the entry to activate
    * @param position the current position
    * @param buttonStates the current button states
    */
   setActiveOperationEntry: function(entry, position, buttonStates)
   {
      this.activeEntry.operation.onStop(position);
      this.activeEntry = entry;
      if (this.lastDivergingPosition != null)
      {
         this.activeEntry.operation.onStart(
            {"x": this.lastDivergingPosition[0], "y": this.lastDivergingPosition[1], "z": this.lastDivergingPosition[2]},
            buttonStates);
         this.lastDivergingPosition = null;
      }
      else
      {
         this.activeEntry.operation.onStart(position, buttonStates);
      }
   }

});

/** A null operation not doing anything */
upro.sys.PointerOperationRegistry.NullOperation = new upro.sys.PointerOperation();

/** Threshold for movement during a click */
upro.sys.PointerOperationRegistry.MoveThreshold = 5;
