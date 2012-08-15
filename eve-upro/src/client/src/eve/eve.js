/**
 * The eve namespace contains code very much EVE specific.
 */
upro.eve = {};

/**
 * Determines whether the IGB functions are available
 * 
 * @return true if possible
 */
upro.eve.areInGameBrowserFunctionsAvailable = function()
{
   var rCode = false;

   if (typeof CCPEVE !== "undefined")
   {
      rCode = true; // TODO: Work out with some global set via server whether trusted or not
   }

   return rCode;
};

/**
 * @return an interface to the IGB. Might return a null object if not available
 */
upro.eve.getInGameBrowser = function()
{
   var igb = null;

   if (upro.eve.areInGameBrowserFunctionsAvailable())
   {
      igb = new upro.eve.RealInGameBrowser();
      igb = new upro.eve.ThrottledInGameBrowser(igb, upro.eve.IGB_FUNCTION_DELAY_MSEC);
   }
   else
   {
      igb = new upro.eve.NullInGameBrowser();
   }

   return igb;
};

/**
 * Delay time between two IGB function calls. Set to 'a bit' more than 1000 msec; client says 1 second, but without
 * callback or event that's tricky. Even 1050 was rejected a few times.
 */
upro.eve.IGB_FUNCTION_DELAY_MSEC = 1100;
