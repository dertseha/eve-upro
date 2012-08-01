/**
 * A table element displays structured data in rows and columns.
 * The data is stored in a TableModel, which can (and must) be set externally.
 */
upro.hud.Table = Class.create(
{
   initialize: function(hudSystem, x, y, maxRows, colData)
   {
      var i;

      this.hudSystem = hudSystem;
      this.x = x;
      this.y = y;
      this.maxRows = maxRows;
      this.colData = colData;

      this.viewIndex = 0;
      this.model = new upro.hud.TableModel(this);
      this.keyHandler = new upro.hud.TableModelKeyboardHandler(this.model);

      this.width = 0;
      for (i = 0; i < colData.length; i++)
      {
         this.width += colData[i].width;
      }

      this.background = this.hudSystem.paper.rect(x, y, this.width, upro.hud.Table.ROW_HEIGHT);
      this.background.attr(
      {
         "fill": "#423f22",
         "fill-opacity": 0.5,
         "stroke": "#000000",
         "stroke-opacity": 0.0,
         "stroke-width": 0
      });
      this.editground = this.hudSystem.paper.rect(x, y, 0, upro.hud.Table.ROW_HEIGHT).hide();
      this.editground.attr(
      {
         "stroke-width": 0,
         "stroke-opacity": 0.0,
         "fill": "#FFFFFF",
         "fill-opacity": 0.2
      });
      this.foreground = this.hudSystem.paper.rect(x, y, this.width, upro.hud.Table.ROW_HEIGHT);
      this.foreground.attr(
      {
         "fill": "#000000",
         "fill-opacity": 0.1,
         "stroke": "#741",
         "stroke-opacity": 0.8,
         "stroke-width": 1
      });
      {  // set up pointer handler
         var pointerHandler = new upro.sys.PointerHandler();
         var realThis = this;
         var extended = Element.extend(this.foreground[0]);

         pointerHandler.onRotate = function(position, buttonStates, rotation)
         {
            if (rotation[1] != 0)
            {
               realThis.setViewIndex(realThis.viewIndex + (rotation[1] / -120));
            }
         };
         pointerHandler.onMove = this.onPointerMove.bind(this);
         pointerHandler.onDown = this.onPointerDown.bind(this);
         new upro.sys.MouseListener(pointerHandler, extended);
      }
      {  // set up keyboard handler
         var keyboardHandler = null;

         new upro.sys.KeyboardListener(keyboardHandler, extended);
      }

      this.viewRows = [];
   },

   destroy: function()
   {
      this.hudSystem.removeKeyFocus(this.keyHandler);
      this.cleanViewRows(0);
      this.background.remove();
      this.foreground.remove();
   },

   getModel: function()
   {
      return this.model;
   },

   setModel: function(model)
   {
      this.model = model;
      this.keyHandler.setModel(model);
      this.onModelChanged(0);
   },

   /**
    * Callback from model to notify of a change in the row constellation.
    * @param startIndex the first index that may have changed data
    */
   onModelChanged: function(startIndex)
   {
      {  // ensure the current edit index is visible
         var editIndex = this.model.getEditCellIndex();

         if (editIndex >= 0)
         {
            this.hudSystem.setKeyFocus(this.keyHandler);
            if (editIndex < this.viewIndex)
            {
               this.viewIndex = editIndex;
            }
            else if (editIndex >= (this.viewIndex + this.maxRows))
            {
               this.viewIndex += editIndex - (this.viewIndex + this.maxRows) + 1;
            }
         }
         else
         {
            this.hudSystem.removeKeyFocus(this.keyHandler);
         }
      }

      if ((startIndex >= this.viewIndex) && (startIndex < (this.viewIndex + this.maxRows)))
      {  // change is visible
         var rowCount = this.model.getRowCount(), viewAmount = rowCount;

         if (viewAmount > this.maxRows)
         {
            viewAmount = this.maxRows;
         }
         this.cleanViewRows(viewAmount); // remove rows not visible anymore

         if (viewAmount == 0)
         {
            viewAmount = 1;
         }
         this.background.attr({"height": viewAmount * upro.hud.Table.ROW_HEIGHT});
         this.foreground.attr({"height": viewAmount * upro.hud.Table.ROW_HEIGHT});

         if (this.viewIndex > (rowCount - this.maxRows))
         {  // one of the last entries was removed, have to scroll up
            startIndex = this.viewIndex = (rowCount - this.maxRows);
            if (startIndex < 0)
            {
               startIndex = this.viewIndex = 0;
            }
         }

         this.updateCells(startIndex);
      }
   },

   /**
    * Updates the visible cells starting with given model row index
    * @param startIndex index into model rows to start with
    */
   updateCells: function(startIndex)
   {
      var viewRowOffset = 0, colData, viewRow, i, cell, x, y,
         endIndex = this.model.getRowCount() - this.viewIndex, editSeen = false;

      if (endIndex > this.maxRows)
      {
         endIndex = this.maxRows;
      }
      y = this.y + (upro.hud.Table.ROW_HEIGHT * viewRowOffset);
      while (viewRowOffset < endIndex)
      {
         if (viewRowOffset >= this.viewRows.length)
         {
            viewRow = [];
            this.viewRows.push(viewRow);
         }
         else
         {
            viewRow = this.viewRows[viewRowOffset];
         }
         x = this.x;
         for (i = 0; i < this.colData.length; i++)
         {
            colData = this.colData[i];

            if (i < viewRow.length)
            {
               cell = viewRow[i];
            }
            else
            {
               cell = new upro.hud.Label(this.hudSystem, x, y, colData.width, upro.hud.Table.ROW_HEIGHT);
               cell.setElementsBefore(this.foreground);
               viewRow.push(cell);
            }
            this.model.updateCell(this.viewIndex + viewRowOffset, colData.name, cell);
            if (this.model.isEditCell(this.viewIndex + viewRowOffset, colData.name))
            {
               this.editground.attr({ "x": x, "y": y, "width": colData.width });
               this.editground.show();
               editSeen = true;
            }

            x += colData.width;
         }
         y += upro.hud.Table.ROW_HEIGHT;
         viewRowOffset++;
      }
      if (!editSeen)
      {
         this.editground.hide();
      }
   },

   /**
    * Cleans up view rows until a given target amount is reached.
    * @param targetAmount Not more than this given amount of rows shall exist.
    */
   cleanViewRows: function(targetAmount)
   {
      var viewRow = null, i, j;

      for (i = this.viewRows.length - 1; i >= targetAmount; i--)
      {
         viewRow = this.viewRows[i];
         this.viewRows.pop();
         for (j = 0; j < viewRow.length; j++)
         {
            viewRow[j].destroy();
         }
      }
   },

   /**
    * Returns the view index
    * @return the view index
    */
   getViewIndex: function()
   {
      return this.viewIndex;
   },

   /**
    * Sets the new view index. The function clips internally.
    * @param value to set to
    */
   setViewIndex: function(value)
   {
      var rowCount = this.model.getRowCount();

      this.viewIndex = value;
      if (this.viewIndex > (rowCount - this.maxRows))
      {  // clip at end
         this.viewIndex = rowCount - this.maxRows;
      }
      if (this.viewIndex < 0)
      {  // clip at beginning
         this.viewIndex = 0;
      }
      this.updateCells(this.viewIndex);
   },

   onPointerMove: function(position, buttonStates)
   {
      // TODO: model highlighting
   },

   onPointerDown: function(position, buttonStates)
   {
      var realPos = this.hudSystem.pixelToReal(position.x, position.y);
      var viewPos = this.hudSystem.realToViewCoordinates(realPos);
      var offset = Math.floor((viewPos.y - this.y) / upro.hud.Table.ROW_HEIGHT);
      var columnKey = null, x = this.x;

      for (var i = 0; (columnKey == null) && (i < this.colData.length); i++)
      {
         var colData = this.colData[i];

         if ((viewPos.x >= x) && (viewPos.x < (x + colData.width)))
         {
            columnKey = colData.name;
         }
         x += colData.width;
      }

      this.model.setEditCell(this.viewIndex + offset, columnKey);
   }

});

upro.hud.Table.ROW_HEIGHT = 20;
