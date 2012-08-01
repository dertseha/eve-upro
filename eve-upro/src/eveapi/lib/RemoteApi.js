/**
 * This interface is for accessing the remote API of CCP
 */
function RemoteApi()
{
   this.get = function(uri, parameters, callback)
   {
      process.nextTick(function()
      {
         callback('Not Implemented');
      });
   };
}

module.exports = RemoteApi;
