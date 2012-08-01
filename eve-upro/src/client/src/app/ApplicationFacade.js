/**
 * The application facade is the main entry point for the whole
 * application.
 */
upro.app.ApplicationFacade = Class.create(Facade,
{
   initialize: function($super)
   {
      $super(upro.app.ApplicationFacade.NAME);

      var notifiedCommands = upro.ctrl.cmd.getAllNotified();

      for (var notificationName in notifiedCommands)
      {
         this.registerCommand(notificationName, notifiedCommands[notificationName]);
      }
   },

   /**
    * Sends the Startup notification to start the application logic.
    */
   start: function()
   {
      /*
       * To the interested programmer who tries to figure out how this all
       * works: You'll need some knowledge about puremvc but you should be
       * able to continue using these pointers:
       * - Notifications result in view actions (mediators listen to them)
       *   and/or commands are executed.
       * - Instead of manually registering every command, commands are bound
       *   to notifications if they have the name pattern
       *   "Notified" (notification-name) "Command" - So, to continue,
       *   look at the NotifiedStartupCommand class.
       */
      this.sendNotification(upro.app.Notifications.Startup);
   }
});

upro.app.ApplicationFacade.NAME = "upro";
