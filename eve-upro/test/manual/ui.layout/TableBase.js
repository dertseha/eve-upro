var knownCells = {};

function createSimpleTable()
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
}

function getCellStyle()
{
   var style =
   {
      padding: "0px",
      margin: "0px"
   };

   return style;
}

function createTableCell(id, attr, extraStyle)
{
   var cell = new Element("td", attr);
   var style = getCellStyle();

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
      knownCells[id] = div;
   }
   else
   {
      cell.update("&nbsp;");
   }

   return cell;
}

function createNestedTable()
{
   var table = createSimpleTable();
   var row = null;
   var horizontalBarAttr =
   {
      rowspan: 1,
      colspan: 4
   };
   var horizontalBarStyle =
   {
      height: "30px"
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

      row.appendChild(createTableCell("northBar", horizontalBarAttr, horizontalBarStyle));
   }
   {
      row = new Element("tr");
      table.appendChild(row);

      row.appendChild(createTableCell("wList", sidePanelAttr, sidePanelStyle));
      row.appendChild(createTableCell("nwCtrl", controlPanelAttr, controlPanelStyle));
      row.appendChild(createTableCell("neCtrl", controlPanelAttr, controlPanelStyle));
      row.appendChild(createTableCell("eList", sidePanelAttr, sidePanelStyle));
   }
   {
      row = new Element("tr");
      table.appendChild(row);
      var center = createTableCell(null, centerAttr);

      row.appendChild(center);
      center.hide();
   }
   {
      row = new Element("tr");
      table.appendChild(row);

      row.appendChild(createTableCell("swCtrl", controlPanelAttr, controlPanelStyle));
      row.appendChild(createTableCell("seCtrl", controlPanelAttr, controlPanelStyle));
   }
   {
      row = new Element("tr");
      table.appendChild(row);

      row.appendChild(createTableCell("southBar", horizontalBarAttr, horizontalBarStyle));
   }

   return table;
}

function createTableBase()
{
   var baseTable = createSimpleTable();
   var defaultStyle =
   {
      height: "100%"
   };
   var verticalBarStyle =
   {
      height: "100%",
      width: "40px"
   };

   baseRow = new Element("tr");
   baseRow.setStyle(defaultStyle);
   baseTable.appendChild(baseRow);

   baseRow.appendChild(createTableCell("westBar", {}, verticalBarStyle));
   baseRow.appendChild(createTableCell(null, {}, defaultStyle).appendChild(createNestedTable()));
   baseRow.appendChild(createTableCell("eastBar", {}, verticalBarStyle));

   $(document.body).insert(baseTable);
}
