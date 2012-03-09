/**
 * The Util container holds utility functions
 */
upro.eve.Util =
{
   /** The regular expression to support isValidName() */
   REGEX_NAME: /([a-z]|[A-Z]|[0-9])+([-'\x2E\x20]?([a-z]|[A-Z]|[0-9])+)*/,

   /** The regular expression to support isValidNameInput() */
   REGEX_NAME_INPUT: /(([a-z]|[A-Z]|[0-9])+([-'\x2E\x20])?)*/,

   /**
    * Returns true if the given text is a valid name by EVE standards;
    * Although not 1:1 translated.
    * Also, essentially restricts to roman (ASCII) letters.
    *
    * Rules:
    * - Must start and end with alphanumeric char
    * - May contain one of: a single quotation, a blank or a dash in between at a time
    *
    * Ignored from EVE standards (http://www.eveonline.com/pnp/namepolicy.asp)
    * - Length: 4-24 characters
    * - dash/dot only allowed for corp names
    *
    * @param text to test
    * @return true if given text is a valid name
    */
   isValidName: function(text)
   {
      var result = upro.eve.Util.REGEX_NAME.exec(text);

      //upro.sys.log("Test (" + text + ") - result: (" + result + ")");

      return (result != null) && (result.indexOf(text) >= 0);
   },

   /**
    * This method is a more lenient variant of isValidName(), as it doesn't
    * check any proper endings. This one only wants an alphanumeric start.
    * Allowed Non-Alphanumeric chars still may not appear more than once in a row
    *
    * @param text to test
    * @return true if given text is a valid name (for input)
    */
   isValidNameInput: function(text)
   {
      var result = upro.eve.Util.REGEX_NAME_INPUT.exec(text);

      return (result != null) && (result.indexOf(text) >= 0);
   }
};
