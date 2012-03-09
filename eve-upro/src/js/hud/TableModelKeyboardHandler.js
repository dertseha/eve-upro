/**
 * This is a keyboard handler for table models
 * It converts key strokes to specific table model commands
 *
 * TODO: This is actually a HudSystemKeyboardFocusHandler, because of the additional onFocusLost()
 */
upro.hud.TableModelKeyboardHandler = Class.create(upro.sys.KeyboardHandler,
{
   initialize: function(model)
   {
      this.model = model;
   },

   setModel: function(model)
   {
      this.model = model;
   },

   onFocusLost: function()
   {
      this.model.setEditCell(-1, null);
   },

   /** {@inheritDoc} */
   onDown: function(keyCode)
   {
      if (keyCode == Event.KEY_RETURN)
      {
         this.model.setEditCell(-1, null);
      }
      else if (keyCode == Event.KEY_UP)
      {
         this.model.setEditCellPrevRow();
      }
      else if (keyCode == Event.KEY_DOWN)
      {
         this.model.setEditCellNextRow();
      }
      else if (keyCode == Event.KEY_BACKSPACE)
      {
         this.model.editCellRemoveCharacter();
      }

      return true;
   },

   /** {@inheritDoc} */
   onUp: function(keyCode)
   {
      return true;
   },

   /** {@inheritDoc} */
   onPress: function(charCode)
   {
      this.model.editCellAddCharacter(charCode);

      return true;
   }

});
