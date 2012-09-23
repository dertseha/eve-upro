function tableAdd()
{
   var index = testTable.getModel().rows.length;

   testTable.getModel().addRow(
   {
      col1: index,
      col2: 2,
      col3: 3
   });
}

function tableRem()
{
   testTable.getModel().removeRow(testTable.getModel().rows.length - 1);
}

function onInputChange(input)
{
   var result = [];

   upro.sys.log("searching [" + input + "]");
   if (input.length > 0)
   {
      var searchString = ((input.length <= 3) || (input.charAt(0).toUpperCase() == input.charAt(0))) ? "^" + input
            : input;
      var regexp = new RegExp(searchString, 'i');

      result = upro.res.eve.MapData[9].solarSystemData.filter(function(entry)
      {
         var name = entry[3];

         return regexp.test(name);
      });
   }

   var model = new upro.hud.SimpleTableModel(testTable);
   testTable.setModel(model);

   result = result.slice(0, 9);
   model.addRow(
   {
      col1: input
   });
   result.forEach(function(entry)
   {
      model.addRow(
      {
         col1: entry[3]
      });
      // upro.sys.log("found: " + entry);
   });
}

function setupKeyboard()
{
   var input = "";

   tableKeyboardHandler = new upro.sys.KeyboardHandler();
   tableKeyboardHandler.onDown = function(keyCode)
   {
      if (keyCode == 8)
      {
         if (input.length > 0)
         {
            input = input.substring(0, input.length - 1);
            onInputChange(input);
         }
      }
      // upro.sys.log("down: " + keyCode);
   };
   tableKeyboardHandler.onPress = function(charCode)
   {
      if (charCode == 13)
      {
         input = "";
      }
      else
      {
         input += String.fromCharCode(charCode);
      }
      // upro.sys.log("input: [" + input + "]");
      onInputChange(input);
   };

   hudSystem.getKeyboardHandler().addHandler(tableKeyboardHandler);
}

function testTables()
{
   tableButtonAdd = new upro.hud.Button(hudSystem, 950, 400, createIcon(upro.res.menu.IconData.Plus));
   tableButtonAdd.clickedCallback = tableAdd;
   tableButtonRem = new upro.hud.Button(hudSystem, 950, 450, createIcon(upro.res.menu.IconData.Minus));
   tableButtonRem.clickedCallback = tableRem;
   testTable = new upro.hud.Table(hudSystem, 1000, 400, 10, [
   {
      name: "col1",
      width: 100
   },
   {
      name: "col2",
      width: 200
   },
   {
      name: "col3",
      width: 40
   } ]);

   testTable.setModel(new upro.hud.SimpleTableModel(testTable));

   setupKeyboard();
}
