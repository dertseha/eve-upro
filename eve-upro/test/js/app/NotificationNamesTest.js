NotificationNamesTest = TestCase("NotificationNamesTest");

NotificationNamesTest.prototype.testNameOfStartup = function()
{
   assertEquals("Startup", upro.app.Notifications.Startup);
};

NotificationNamesTest.prototype.testValuesUnique = function()
{
   var tempMap = {};

   for ( var notificationName in upro.app.Notifications)
   {
      var value = upro.app.Notifications[notificationName];
      var valueLower = ("" + value).toLowerCase();

      if (!tempMap[valueLower])
      {
         tempMap[valueLower] = notificationName;
      }
      else
      {
         fail("Notifications[" + notificationName + "] = \"" + value + "\" is not unique, previous Entry: "
               + tempMap[valueLower]);
      }
   }
};

NotificationNamesTest.prototype.testCommandMappings = function()
{
   var names = upro.ctrl.cmd.getAllNotified();

   for ( var notificationName in names)
   {
      assertNotUndefined("Notification not found: \"" + notificationName + "\"",
            upro.app.Notifications[notificationName]);
   }
};

NotificationNamesTest.prototype.testMediatorNotifications = function()
{
   var suffix = "Mediator";

   for ( var mediatorName in upro.view.mediators)
   {
      if ((mediatorName.length > suffix.length) && (mediatorName.substr(mediatorName.length - suffix.length) == suffix))
      {
         var temp = new upro.view.mediators[mediatorName];
         var notifications = temp.listNotificationInterests();

         for ( var i = 0; i < notifications.length; i++)
         {
            var notificationName = notifications[i];

            assertNotUndefined("Notification not found: \"" + notificationName + "\" for " + mediatorName,
                  upro.app.Notifications[notificationName]);
         }
      }
   }
};
