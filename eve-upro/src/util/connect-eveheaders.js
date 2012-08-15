/**
 * Parses all the headers, looking for those set by the IGB of EVE. These headers start with "eve_", which will be
 * removed. Header names are all lowercase. e.g.: eve_shipname -> shipname
 * 
 * If EVE headers are identified, the request object receives another member named "eveHeaders".
 * 
 * @param req the request, extended with "eveHeaders" object
 * @param res the result (untouched)
 * @param next the next handler function
 */
module.exports = function(req, res, next)
{
   var result = {};
   var headerName = null;
   var found = false;

   for (headerName in req.headers)
   {
      if (headerName.substring(0, 4) === 'eve_')
      {
         var extractedName = headerName.substring(4);

         result[extractedName] = req.headers[headerName];
         found = true;
      }
   }
   if (found)
   {
      req.eveHeaders = result;
   }

   next();
};
