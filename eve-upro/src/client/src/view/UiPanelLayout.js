/**
 * The UI panel layout creates a layout with some panels, autoscaling to the available space in the given context.
 */
upro.view.UiPanelLayout = Class.create(
{
   initialize: function(context)
   {
      this.knownCells = {};
      this.baseTable = this.createTableBase(context);

      this.baseTable.show();
      $(context.getHolderName()).insert(this.baseTable);

      this.theme = new upro.view.UiTheme();
      this.registerTheme();
   },

   registerTheme: function()
   {
      this.theme.registerTheme();
   },

   setBaseBlur: function()
   {
      this.baseTable.setStyle(
      {
         "background": "rgba(128, 128, 128, 0.4)"
      });
   },

   createTableBase: function()
   {
      var baseTable = this.createSimpleTable();
      var defaultStyle =
      {
         height: "100%"
      };
      var verticalBarStyle =
      {
         height: "100%",
         width: upro.view.UiPanelLayout.SIDE_BAR_WIDTH
      };

      baseRow = new Element("tr");
      baseRow.setStyle(defaultStyle);
      baseTable.appendChild(baseRow);

      baseRow.appendChild(this.createTableCell("westBar", {}, verticalBarStyle));
      baseRow.appendChild(this.createTableCell(null, {}, defaultStyle).appendChild(this.createNestedTable()));
      baseRow.appendChild(this.createTableCell("eastBar", {}, verticalBarStyle));

      return baseTable;
   },

   createSimpleTable: function()
   {
      var table = new Element("table",
      {
         cellspacing: 0
      });
      var style =
      {
         "border-style": "solid",
         "border-width": "0px",
         "border-color": "black",
         "border-spacing": "0px",
         "padding": "0px",
         "margin": "0px",
         "width": "100%",
         "height": "100%",
         "background-color": "rgba(0, 0, 0, 0.0)"
      };

      table.setStyle(style);

      return table;
   },

   createTableCell: function(id, attr, extraStyle)
   {
      var cell = new Element("td", attr);
      var style =
      {
         padding: "0px",
         margin: "0px"
      };

      if (extraStyle)
      {
         for ( var styleName in extraStyle)
         {
            style[styleName] = extraStyle[styleName];
         }
      }
      cell.setStyle(style);

      if (id)
      {
         var div = new Element("div");
         var divStyle =
         {
            width: "100%",
            height: "100%",
            padding: "0px",
            margin: "0px"
         };

         div.setStyle(divStyle);
         cell.appendChild(div);

         div.setAttribute("id", id);
         this.knownCells[id] = div;
      }
      else
      {
         cell.update("&nbsp;");
      }

      return cell;
   },

   createNestedTable: function()
   {
      var table = this.createSimpleTable();
      var row = null;
      var horizontalBarAttr =
      {
         rowspan: 1,
         colspan: 4
      };
      var horizontalBarStyle =
      {
         height: upro.view.UiPanelLayout.SIDE_BAR_WIDTH
      };
      var sidePanelAttr =
      {
         rowspan: 3,
         colspan: 1
      };
      var sidePanelStyle =
      {
         width: "18.75%",
         height: "100%"
      };
      var controlPanelAttr =
      {
         rowspan: 1,
         colspan: 1
      };
      var controlPanelStyle =
      {
         height: "30%",
         width: "25%"
      };
      var centerAttr =
      {
         colspan: 2
      };

      {
         row = new Element("tr");
         table.appendChild(row);

         row.appendChild(this.createTableCell("northBar", horizontalBarAttr, horizontalBarStyle));
      }
      {
         row = new Element("tr");
         table.appendChild(row);

         row.appendChild(this.createTableCell("wList", sidePanelAttr, sidePanelStyle));
         row.appendChild(this.createTableCell("nwCtrl", controlPanelAttr, controlPanelStyle));
         row.appendChild(this.createTableCell("neCtrl", controlPanelAttr, controlPanelStyle));
         row.appendChild(this.createTableCell("eList", sidePanelAttr, sidePanelStyle));
      }
      {
         row = new Element("tr");
         table.appendChild(row);
         var center = this.createTableCell("center", centerAttr);

         row.appendChild(center);
         center.hide();
      }
      {
         row = new Element("tr");
         table.appendChild(row);

         row.appendChild(this.createTableCell("swCtrl", controlPanelAttr, controlPanelStyle));
         row.appendChild(this.createTableCell("seCtrl", controlPanelAttr, controlPanelStyle));
      }
      {
         row = new Element("tr");
         table.appendChild(row);

         row.appendChild(this.createTableCell("southBar", horizontalBarAttr, horizontalBarStyle));
      }

      return table;
   }

});

/** the width (or height) of a side bar. Should be capable of holding a standard hexagonal button */
upro.view.UiPanelLayout.SIDE_BAR_WIDTH = "40px";
