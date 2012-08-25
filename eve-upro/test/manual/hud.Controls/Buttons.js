function testSimpleButton()
{
   createLabel(300, "Simple Button");

   var button = new upro.hud.Button(hudSystem, 300, 300, createIcon(upro.res.eve.IconData.Minmatar));

   button.clickedCallback = function()
   {
      hudSystem.debugMessage("Simple Button clicked");
   };
}

function createDestroyButton(index)
{
   var offset = upro.hud.Button.getOffset[index](5);
   var iconPath = (index == 1) ? upro.res.eve.IconData.Caldari : upro.res.eve.IconData.Gallente;
   var icon = hudSystem.paper.path(iconPath);

   icon.attr("fill", "#FFF");

   var button = new upro.hud.Button(hudSystem, offset.x + 300, offset.y + 340, icon);
   button.clickedCallback = function()
   {
      button.destroy();
      createDestroyButton((index + 3) % 6);
   };
}

function testButtonDestroy()
{
   createLabel(340, "Button Destruction");
   createDestroyButton(1);
}

function createOffsetButton(x, y, index, padding)
{
   var offset = upro.hud.Button.getOffset[index](padding);

   return new upro.hud.Button(hudSystem, x + offset.x, y + offset.y);
}

function createContextMenu(event)
{
   var real = hudSystem.pixelToReal(event.pointerX(), event.pointerY());
   var viewCoord = hudSystem.realToViewCoordinates(real);
   var context = new upro.hud.RadialMenuContext(mainContextMenu, hudSystem, viewCoord);

   hudSystem.setActiveContextMenu(context);
   context.show();
}

function createIconMinmatar()
{
   return createIcon(upro.res.eve.IconData.Minmatar);
}

function createIconCaldari()
{
   return createIcon(upro.res.eve.IconData.Caldari);
}

function onCancelContextMenu()
{
   hudSystem.debugMessage("Context Menu Cancelled");
}

function onContextMenu0()
{
   hudSystem.debugMessage("Context Menu 0");
   commandContextMenu0.setActive(!commandContextMenu0.isCommandActive());
   commandContextMenu0.setLabel(commandContextMenu0.isCommandActive() ? "Inactivate Me!" : "Click again!");
   commandContextMenu1.setPossible(!commandContextMenu0.isCommandActive());
}

function onContextMenu1()
{
   hudSystem.debugMessage("Context Menu 1");
}

function testContextMenu()
{
   contextMenuPadding = 5;

   createLabel(380, "Context Menu (click anywhere)");
   document.observe('click', createContextMenu);

   mainContextMenu = new upro.hud.RadialMenu(null, onCancelContextMenu);
   commandContextMenu0 = new upro.hud.SimpleCommandAdapter(onContextMenu0, "Disable SubMenu 1");
   mainContextMenu.setCommand(0, createIconMinmatar, commandContextMenu0);

   var subMenu = mainContextMenu.setSubMenu(2, createIconCaldari);
   commandContextMenu1 = new upro.hud.SimpleCommandAdapter(function()
   {
      onContextMenu1();
      subMenu.cancel();
   });
   subMenu.setCommand(5, createIconMinmatar, commandContextMenu1);
}

function testButtonOffsets()
{
   var padding = 5;

   createLabel(500, "Button Offsets");
   new upro.hud.Button(hudSystem, 300, 500);
   for ( var i = 0; i < 6; i++)
   {
      createOffsetButton(300, 500, i, padding);
   }
}

function onActiveButton()
{
   activeButton.setActive(!activeButton.isActive());
   disabledButton.setEnabled(!activeButton.isActive());
}

function testActiveButton()
{
   createLabel(580, "Active Button");

   activeButton = new upro.hud.Button(hudSystem, 300, 580, createIcon(upro.res.menu.IconData.Power), true, true);
   activeButton.clickedCallback = onActiveButton;
}

function onDisabledButton()
{
   hudSystem.debugMessage("Disabled Button clicked");
}

function testDisabledButton()
{
   createLabel(630, "Disabled Button");

   disabledButton = new upro.hud.Button(hudSystem, 300, 630, createIcon(upro.res.menu.IconData.Denied), false);
   disabledButton.clickedCallback = onDisabledButton;
}

function testActiveDisabledButton()
{
   createLabel(680, "ActiveDisabled Button");

   activeDisabledButton = new upro.hud.Button(hudSystem, 300, 680, createIcon(upro.res.menu.IconData.No), false, true);
}

function testIcons()
{
   var i = 0, x, y;

   for ( var pathName in upro.res.menu.IconData)
   {
      x = 500 + (i % 16) * 40;
      y = 200 + Math.floor(i / 16) * 40;
      i++;
      var button = new upro.hud.Button(hudSystem, x, y, createIcon(upro.res.menu.IconData[pathName]));
      button.setLabel(pathName);
   }
}

function testButtons()
{
   testSimpleButton();
   testButtonDestroy();
   testContextMenu();
   testButtonOffsets();
   testActiveButton();
   testDisabledButton();
   testActiveDisabledButton();
   testIcons();
}
