/**
 * The command namespace contains all the puremvc commands
 */
upro.ctrl.cmd = {};

/** A class that has this suffix in its name is a command */
upro.ctrl.cmd.NAME_SUFFIX = "Command";

/** A command that has this prefix in its name is notification based */
upro.ctrl.cmd.NOTIFIED_NAME_PREFIX = "Notified";

/**
 * This function returns all commands known to be notified
 * @return map of notification name to class
 */
upro.ctrl.cmd.getAllNotified = function()
{
   var result = {};
   var prefix = upro.ctrl.cmd.NOTIFIED_NAME_PREFIX;
   var suffix = upro.ctrl.cmd.NAME_SUFFIX;

   for (var entryName in upro.ctrl.cmd)
   {
      if ((entryName.length > suffix.length) && (entryName.substr(entryName.length - suffix.length) == suffix) &&
         (entryName.length > prefix.length) && (entryName.substr(0, prefix.length) == prefix))
      {
         result[entryName.substr(prefix.length, entryName.length - (suffix.length + prefix.length))] = upro.ctrl.cmd[entryName];
      }
   }

   return result;
};
