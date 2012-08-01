/**
 * The Language container provides helper for localisation
 */
upro.res.text.Lang =
{
   /** The default language upro uses */
   defaultLang: "en",

   /** Internal map for all currently available texts */
   texts: {},

   /**
    * Sets the current language.
    * @param langId an identifier available in the text templates
    */
   setCurrentLanguage: function(langId)
   {
      var templates = upro.res.text.templates;
      var rCode = true;

      upro.sys.log("Setting language to: [" + langId + "]");
      upro.res.text.Lang.texts = {}; // reset
      if (!upro.res.text.Lang.copyMissingTextsFrom(templates[langId], false))
      {
         rCode = false;
      }
      {  // copy from base set if existing
         var delim = langId.indexOf("-");

         if (delim > 0)
         {
            if (!upro.res.text.Lang.copyMissingTextsFrom(templates[langId.substr(0, delim)], false))
            {
               rCode = false;
            }
         }
      }
      if (!upro.res.text.Lang.copyMissingTextsFrom(templates[upro.res.text.Lang.defaultLang], true))
      {  // fill and check with default language
         rCode = false;
      }
      if (!rCode)
      {
         upro.sys.log("Some errors occured while setting language");
      }

      return rCode;
   },

   /**
    * Copies missing text strings into the main container and performs some error checks
    * @param source source template to copy from
    * @param errIfMissing whether an error should be logged if an entry was missing
    */
   copyMissingTextsFrom: function(source, errIfMissing)
   {
      var defaultTexts = upro.res.text.templates[upro.res.text.Lang.defaultLang];
      var rCode = false;

      if (source)
      {  // check whether the template exists at all
         var dest = upro.res.text.Lang.texts;

         rCode = true;
         for (var entry in source)
         {
            if (!defaultTexts[entry])
            {  // the template contains a key that is not in the default language.
               rCode = false;
               upro.sys.log("Container has an entry the default language has not: [" + entry + "]");
            }
            if (!dest[entry])
            {
               if (errIfMissing)
               {  // An entry had to be copied although not expected
                  rCode = false;
                  upro.sys.log("Container is missing entry for [" + entry + "]");
               }
               dest[entry] = source[entry];
            }
         }
      }

      return rCode;
   },

   /**
    * Retrieves the translated string for given key and applies a
    * upro.res.text.Util.format() on it, passing along any further
    * parameters after key. See format() for details.
    * The result is then returned.
    *
    * @param key to look for in the texts
    * @return the translated and formatted string.
    */
   format: function(key)
   {
      var result;
      var text = this.texts[key];

      if (text)
      {
         var temp = [ text ];

         for (var i = 1; i < arguments.length; i++)
         {
            temp.push(arguments[i]);
         }
         result = upro.res.text.Util.format.apply(this, temp);
      }
      else
      {
         upro.sys.log("Unknown key [" + key + "] specified for text");
         result = "ERROR: Missing Text for [" + key + "]";
      }

      return result;
   }
};
