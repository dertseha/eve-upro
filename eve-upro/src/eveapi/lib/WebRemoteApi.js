var https = require('https');
var url = require('url');
var util = require("util");

var RemoteApi = require('./RemoteApi.js');

/**
 * Web based remote api implementation. It defaults to use SSL (port 443), POST requests with URL encoded parameters in
 * the body.
 */
function WebRemoteApi(hostname)
{
   WebRemoteApi.super_.call(this);

   this.hostname = hostname;

   /** {@inheritDoc} */
   this.get = function(uri, parameters, callback)
   {
      var body = this.getRequestBody(parameters);
      var options = this.getRequestOptions(uri, body);
      var self = this;
      var req = https.request(options, function(res)
      {
         self.onResult(res, callback);
      });

      req.on('error', function(err)
      {
         callback(err);
      });
      req.end(body, "utf8");
   };

   /**
    * @param parameters the API parameters for the function
    * @returns the request body from given parameters
    */
   this.getRequestBody = function(parameters)
   {
      var body = url.format(
      {
         query: parameters
      });

      return body.substring(1);
   };

   /**
    * @param uri the request URI
    * @param body the body
    * @returns the options for the HTTP request
    */
   this.getRequestOptions = function(uri, body)
   {
      var options =
      {
         hostname: this.hostname,
         port: 443,
         path: uri,
         method: 'POST',
         headers:
         {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': body.length
         }
      };

      return options;
   };

   /**
    * The callback handler for a result
    * 
    * @param res the result object
    * @param callback the original user callback
    */
   this.onResult = function(res, callback)
   {
      var data = '';

      res.setEncoding('utf8');

      res.on('data', function(chunk)
      {
         data += chunk;
      });
      res.on('close', function(err)
      {
         callback(err, null);
      });
      if (res.statusCode == 200)
      {
         res.on('end', function()
         {
            callback(null, data);
         });
      }
      else
      {
         res.on('end', function()
         {
            callback(res.statusCode + ' info: ' + data, null);
         });
      }
   };
}
util.inherits(WebRemoteApi, RemoteApi);

module.exports = WebRemoteApi;
