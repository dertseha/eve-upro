/**
 * The rate limiter creates a connect middleware that refers to a RateLimiter which throttles requests per second. The
 * provider returns an object containing a RateLimiter object based on the request and a queue to put pending requests
 * into.
 * 
 * options:
 * <ul>
 * <li>hardLimit: Integer. If given, this marks the hard limit for the queue size. If the queue has reached this limit,
 * further requests will be rejected with 429 (Too many requests). 0 or not present specifies no queue limit.</li>
 * <li>callbackDeferrer: Defaults to process.nextTick; Used for test injection</li>
 * </ul>
 * 
 * @param limiterProvider function(req) { return { queue: [], limiter: {...} } }
 * @param options optional object of options
 * @returns a connect middleware function
 */
function ConnectRateLimiter(limiterProvider, options)
{
   var callbackDeferrer = process.nextTick;
   var hardLimit = 0;

   if (options)
   {
      if (options.callbackDeferrer)
      {
         callbackDeferrer = options.callbackDeferrer;
      }
      if (options.hardLimit && (options.hardLimit > 0))
      {
         hardLimit = options.hardLimit;
      }
   }

   function connectHandler(req, res, next)
   {
      var limiterInfo = limiterProvider(req);

      if ((hardLimit == 0) || (limiterInfo.queue.length < hardLimit))
      {
         var callbackHandler = function(callback)
         {
            var queuedNext = limiterInfo.queue[0];

            limiterInfo.queue = limiterInfo.queue.slice(1);
            queuedNext();
            if (limiterInfo.queue.length > 0)
            {
               callbackDeferrer(function()
               {
                  limiterInfo.limiter.removeTokens(1, function()
                  {
                     callback(callback);
                  });
               });
            }
         };

         limiterInfo.queue.push(next);
         if (limiterInfo.queue.length == 1)
         {
            limiterInfo.limiter.removeTokens(1, function()
            {
               callbackHandler(callbackHandler);
            });
         }
      }
      else
      {
         var statusTooManyRequests = 429;

         res.send(statusTooManyRequests);
      }
   }

   return connectHandler;
}

module.exports = ConnectRateLimiter;
