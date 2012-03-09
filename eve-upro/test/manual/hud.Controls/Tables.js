function tableAdd()
{
   var index = testTable.getModel().rows.length;

   testTable.getModel().addRow({ col1: index, col2: 2, col3: 3});
}

function tableRem()
{
   testTable.getModel().removeRow(testTable.getModel().rows.length - 1);
}

function testTables()
{
   tableButtonAdd = new upro.hud.Button(hudSystem, 950, 400, createIcon(upro.res.menu.IconData.Plus));
   tableButtonAdd.clickedCallback = tableAdd;
   tableButtonRem = new upro.hud.Button(hudSystem, 950, 450, createIcon(upro.res.menu.IconData.Minus));
   tableButtonRem.clickedCallback = tableRem;
   testTable = new upro.hud.Table(hudSystem, 1000, 400, 4,
   [
      { name: "col1", width: 100 },
      { name: "col2", width: 200 },
      { name: "col3", width: 40 }
   ]);

   testTable.setModel(new upro.hud.SimpleTableModel(testTable));
}
