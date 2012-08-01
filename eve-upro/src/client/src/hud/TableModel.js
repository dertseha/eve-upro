/**
 * A table model is the actual data backing a table display.
 */
upro.hud.TableModel = Class.create(
{
   initialize: function(table)
   {

   },

   /**
    * Returns the number of rows existing in the model
    * @return the number of rows
    */
   getRowCount: function()
   {
      return 0;
   },

   /**
    * Requests to update the contents of a cell, identified by
    * index and column key.
    * @param index 0 based index into the rows
    * @param columnKey key of the column
    * @param cell a upro.hud.Label instance for display
    */
   updateCell: function(index, columnKey, cell)
   {

   },

   /**
    * Returns the row index of the currently selected edit cell
    * @return the row index of the currently selected edit cell
    */
   getEditCellIndex: function()
   {
      return -1;
   },

   /**
    * Request to set an edit cell
    * @param index row index
    * @param columnKey column key
    */
   setEditCell: function(index, columnKey)
   {

   },

   /**
    * Returns true if the given cell key identifies the edit cell
    * @return true if the given cell key identifies the edit cell
    */
   isEditCell: function(index, columnKey)
   {
      return false;
   },

   /**
    * Requests to set the edit cell to the previous row
    */
   setEditCellPrevRow: function()
   {

   },

   /**
    * Requests to set the edit cell to the next row
    */
   setEditCellNextRow: function()
   {

   },

   editCellRemoveCharacter: function()
   {

   },

   editCellAddCharacter: function(charCode)
   {

   }

});

/** A NULL object that contains no data and ignores any edit requests */
upro.hud.TableModel.NULL = new upro.hud.TableModel();
