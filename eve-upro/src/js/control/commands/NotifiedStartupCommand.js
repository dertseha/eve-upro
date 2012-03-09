
upro.ctrl.cmd.NotifiedStartupCommand = Class.create(MacroCommand,
{
   initializeMacroCommand: function()
   {
      upro.res.text.Lang.setCurrentLanguage(upro.res.text.Lang.defaultLang);

      this.addSubCommand(upro.ctrl.cmd.SetupModelCommand);
      this.addSubCommand(upro.ctrl.cmd.SetupViewCommand);

      this.addSubCommand(upro.ctrl.cmd.InitApplicationCommand);
   }
});
