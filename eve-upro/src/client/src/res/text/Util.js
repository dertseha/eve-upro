/**
 * The Util container has a few text utilities
 */
upro.res.text.Util =
{
   /**
    * Formats a text and replaces placeholders with additional parameters.
    * Placeholder: "{" (index) "}" -- index: 0 based starting with the first after text
    * @param text: The text to format.
    * @return a formatted text
    */
   format: function(text)
   {
      var originalArg = arguments;
      var result = text;
      var replacer = function(index)
      {
         return originalArg[new Number(index.substr(1, index.length - 2)) + 1];
      };

      return result.replace(/[{]\d+[}]/g, replacer);
   }
};
