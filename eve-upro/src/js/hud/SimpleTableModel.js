/**
 * A simple table model is a linear list of rows containing
 * structures whose column keys are members.
 * 'Edit' cells are simple focus cells
 */
upro.hud.SimpleTableModel = Class.create(
{
   initialize: function(table)
   {
      this.table = table;

      this.rows = [];

      this.editIndex = -1;
      this.editColumnKey = null;
   },

   getRowCount: function()
   {
      return this.rows.length;
   },

   addRow: function(data)
   {
      this.rows.push(data);
      this.table.onModelChanged(this.rows.length - 1);
   },

   removeRow: function(index)
   {
      if ((index >= 0) && (index < this.rows.length))
      {
         this.rows.splice(index, 1);
         this.table.onModelChanged(index);
      }
   },

   updateCell: function(index, columnKey, cell)
   {
      cell.setText(this.rows[index][columnKey]);
   },

   getEditCellIndex: function()
   {
      return this.editIndex;
   },

   setEditCell: function(index, columnKey)
   {
      if ((this.editIndex != index) || (this.editColumnKey != columnKey))
      {
         var oldIndex = this.editIndex;

         this.editIndex = -1;
         this.editColumnKey = null;
         if (oldIndex >= 0)
         {  // notify of lost status
            this.table.onModelChanged(oldIndex);
         }
         this.editIndex = index;
         this.editColumnKey = columnKey;
         if (this.editIndex >= 0)
         {  // notify of new status
            this.table.onModelChanged(this.editIndex);
         }
      }
   },

   isEditCell: function(index, columnKey)
   {
      return (this.editIndex == index) && (this.editColumnKey == columnKey);
   },

   setEditCellPrevRow: function()
   {
      if (this.editIndex > 0)
      {
         this.editIndex--;
         this.table.onModelChanged(this.editIndex);
      }
   },

   setEditCellNextRow: function()
   {
      if (this.editIndex < (this.rows.length - 1))
      {
         this.editIndex++;
         this.table.onModelChanged(this.editIndex - 1);
      }
   }

});

