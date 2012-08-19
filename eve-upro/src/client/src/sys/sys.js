/**
 * The system namespace holds the access implementations to the system the application runs in - typically, the browser
 * window.
 */
upro.sys = {};

/**
 * Although IGB is based on WebKit, we need a dedicated flag for some quirks
 */
Prototype.Browser.EVE_IGB = typeof CCPEVE !== "undefined";

/**
 * @returns true if this application is running in the in-game-browser (IGB)
 */
upro.sys.isRunningInInGameBrowser = function()
{
   return typeof CCPEVE !== "undefined";
};

/**
 * Provides log output of given text defaults to console.log with date/time and a prefix
 * 
 * @param text to log
 */
upro.sys.log = function(text)
{
   console.log((new Date().toISOString()) + " upro: " + text);
};

/**
 * For some reason, at least the IGB fails to properly include the js-schema.
 */
if (typeof window.schema === "undefined")
{
   window.schema = function()
   {
      return function()
      {
         return true;
      };
   };

   Array.of = function()
   {
      return Array;
   };
   Number.min = function()
   {
      return Number;
   };
}
