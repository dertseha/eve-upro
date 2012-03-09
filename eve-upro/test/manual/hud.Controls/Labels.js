function createHudLabel(y, text, icon)
{
   var temp = new upro.hud.Label(hudSystem, 500, y, 250, 20);

   temp.setIcon(icon);
   temp.setText(text);
}

function testLabels()
{
   createHudLabel(400, "Testing Labels.");
   createHudLabel(430, "This is a very long text to test clipping of the actual characters which should happen. Really.");
   createHudLabel(460, "Second", createIcon(upro.res.menu.IconData.Power));
}
