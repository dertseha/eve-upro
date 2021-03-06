var util = require('util');
var http = require('http');
var path = require('path');
var fs = require('fs');

var winston = require('winston');
var logger = winston.loggers.get('root');
var express = require('express');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var RateLimiter = require('limiter').RateLimiter;

var clientEvents = require('../model/ClientEvents.js').clientEvents;
var Component = require('../components/Component.js');
var eveHeaders = require('../util/connect-eveheaders.js');
var ConnectRateLimiter = require('../util/connect-rate-limit.js');

var uglify = require('../util/connect-uglify.js');
var clientInfo = require('../client/ClientInfo.js');

var getMongoStore = require('../util/connect-sessionstore-mongodb.js');

passport.serializeUser(function(user, done)
{
   var data = user ? JSON.stringify(user) : null;

   done(null, data);
});

passport.deserializeUser(function(data, done)
{
   var user = data ? JSON.parse(data) : null;

   done(null, user);
});

/**
 * Creates a rate limiter info to be used for ConnectRateLimiter.
 * 
 * @param requestsPerSecond how many requests per second should be allowed
 * @returns { queue: [], limiter: RateLimiter() }
 */
function createRateLimiterInfo(requestsPerSecond)
{
   var info =
   {
      queue: [],
      limiter: new RateLimiter(requestsPerSecond, 'second')
   };

   return info;
}

/**
 * Returns shader info object used for the abstract client render
 * 
 * @param type the shader type. Should be either 'vertex' or 'fragment'
 * @param id ID of the shader - as referred by the client
 * @param fileName name of the file containing the shader code
 * @returns object used in absractClient.jade
 */
function getShaderInfo(type, id, fileName)
{
   var shaderPath = path.normalize(__dirname + '/../client/shader/' + fileName);
   var info =
   {
      type: type,
      id: id,
      content: fs.readFileSync(shaderPath)
   };

   return info;
}

/**
 * HTTP Server component
 * 
 * Using MongoDB as storage for session data.
 * 
 * Note: connect-mongodb (which we are using here) is a bit better than connect-mongo: - It allows passing an existing
 * DB object, which can be opened already - When the database is closed, the internal reap interval is cleared
 * 
 * Info Links:
 * <ul>
 * <li>http://jade-lang.com/</li>
 * <li>https://github.com/visionmedia/jade</li>
 * <li>http://expressjs.com/</li>
 * </ul>
 */
function HttpServerComponent(services, options)
{
   HttpServerComponent.super_.call(this);

   this.mongodb = services.mongodb;

   this.options = options;
   this.expressServer = null;
   this.sessionStore = null;
   this.httpServer = null;
   this.sessionHandler = null;

   this.globalLimiter = createRateLimiterInfo(options.requestsPerSecondGlobalLimit || 10000);
   this.loggedOffLimiter = createRateLimiterInfo(options.requestsPerSecondLoggedOff || 100);
   this.corpLimiter = {};
   this.corpLimiterRate = options.requestsPerSecondCorporation || 1000;
   this.stayLoggedInAge = 1000 * 60 * 60 * 24 * 32;

   this.setSessionHandler = function(handler)
   {
      this.sessionHandler = handler;
   };

   /** {@inheritDoc} */
   this.start = function()
   {
      this.setupPassport();
      this.setupExpress();
   };

   /** {@inheritDoc} */
   this.tearDown = function()
   {
      if (this.httpServer)
      {
         this.httpServer.close();
         this.httpServer = null;
      }
      if (this.sessionStore)
      {
         this.sessionStore = null;
      }
      if (this.expressServer)
      {
         this.expressServer = null;
      }
   };

   this.setupPassport = function()
   {
      var self = this;
      var options =
      {
         usernameField: 'keyId',
         passwordField: 'vCode',
         passReqToCallback: true
      };

      passport.use(new LocalStrategy(options, function(req, keyId, vCode, done)
      {
         self.onApiUserAuthentication(req, keyId, vCode, done);
      }));
   };

   this.setupExpress = function()
   {
      var expressServer = express();
      var self = this;
      var defaultCookieSecret = 'Some special secret';
      var cookieSecret = this.options.cookieSecret || defaultCookieSecret;
      var defaultSessionSecret = 'Some other secret';
      var sessionSecret = self.options.sessionSecret || defaultSessionSecret;

      if ((cookieSecret == defaultCookieSecret) || (sessionSecret == defaultSessionSecret))
      {
         logger.warn('HTTP configuration uses some defaults that should not be used');
      }

      this.expressServer = expressServer;
      this.sessionStore = getMongoStore(
      {
         db: this.mongodb.getDatabase(),

         collectionName: this.options.collection,
         ttlSec: 60 * 10
      }, function()
      {
      });

      expressServer.configure(function()
      {
         expressServer.set('port', self.options.port || 3000);
         expressServer.set('views', __dirname + '/views');
         expressServer.set('view engine', 'jade');
         expressServer.set('view options',
         {
            layout: false
         });

         expressServer.use(new ConnectRateLimiter(function()
         {
            return self.globalLimiter;
         },
         {
            hardLimit: 1
         }));
         expressServer.use(express.limit('100kb'));
         expressServer.use(express.favicon(path.normalize(__dirname + '/public/images/favicon.ico')));
         expressServer.use(express.bodyParser());
         expressServer.use(express.methodOverride());
         expressServer.use(express.cookieParser(cookieSecret));

         expressServer.use(express.session(
         {
            key: 'upro.sid',
            secret: sessionSecret,
            store: self.sessionStore
         }));

         expressServer.use(passport.initialize());
         expressServer.use(passport.session());
         expressServer.use(new ConnectRateLimiter(function(req)
         {
            return self.getSessionLimiter(req);
         }));
         expressServer.use(new uglify('/javascripts/ThreadedEventSource.js', [
               path.normalize(__dirname + '/public/javascripts/EventSource.js'),
               path.normalize(__dirname + '/private/javascripts/EventSourceThreadWrapper.js') ],
               "/** Threaded EventSource. Based on /public/javascripts/EventSource.js but wrapped in a worker */\n"));
         expressServer.use(new uglify('/javascripts/upro.js', clientInfo.sourceFiles, clientInfo.header));
         expressServer.use(new uglify('/javascripts/upro-full.js', clientInfo.sourceFiles, clientInfo.header,
         {
            debug: true
         }));
         expressServer.use(eveHeaders);
         expressServer.use(expressServer.router);
         expressServer.use(express.static(path.normalize(path.join(__dirname, 'public'))));
      });

      expressServer.configure('development', function()
      {
         expressServer.use(express.errorHandler());
      });

      expressServer.get('/', function(req, res)
      {
         self.onGetIndex(req, res);
      });

      expressServer.get('/deadEnd', function(req, res)
      {
         self.onGetDeadEnd(req, res);
      });

      expressServer.get('/login', function(req, res)
      {
         self.onGetLogin(req, res);
      });
      expressServer.post('/login', passport.authenticate('local',
      {
         successRedirect: '/',
         failureRedirect: '/login?message=loginFailed'
      }));
      expressServer.get('/logout', function(req, res)
      {
         self.onGetLogout(req, res);
      });

      expressServer.get('/eventSource', function(req, res)
      {
         self.onRequestEventSource(req, res);
      });
      expressServer.post('/eventSource', function(req, res)
      {
         self.onRequestEventSource(req, res);
      });
      expressServer.post('/requestSink', function(req, res)
      {
         self.onRequestRequestSink(req, res);
      });

      expressServer.get('/testBasicScene', function(req, res)
      {
         self.serveClient(req, res, 'testBasicScene.jade',
         {
            characterName: 'Test',
            corporationName: 'BasicScene'
         });
      });
      expressServer.get('/testMouse', function(req, res)
      {
         self.serveClient(req, res, 'testMouse.jade',
         {
            characterName: 'Test',
            corporationName: 'Mouse'
         });
      });
      expressServer.get('/life', function(req, res)
      {
         self.serveClient(req, res, 'life.jade',
         {
            characterName: 'Test',
            corporationName: 'Life'
         });
      });

      this.startHttpServer();
   };

   this.startHttpServer = function()
   {
      var httpServer = http.createServer(this.expressServer);
      var usedPort = this.expressServer.get('port');
      var self = this;

      httpServer.on('error', function(err)
      {
         logger.warn('Error on HTTP server; Restarting after timeout.',
         {
            error: err
         });
         setTimeout(function()
         {
            self.startHttpServer();
         }, 5000);
      });
      httpServer.listen(usedPort, this.options.host, function()
      {
         logger.info('HTTP server started on port ' + usedPort);
         self.onServerStarted(httpServer);
      });
   };

   this.onServerStarted = function(httpServer)
   {
      this.httpServer = httpServer;
      this.onStartProgress();
   };

   this.onStartProgress = function()
   {
      if (this.expressServer && this.httpServer)
      {
         this.onStarted();
      }
   };

   /**
    * Returns the rate limiter info for the session as identified by given request.
    * 
    * @param req the Request object
    * @returns a limiter info object for ConnectRateLimiter
    */
   this.getSessionLimiter = function(req)
   {
      var limiter = this.loggedOffLimiter;

      if (req.user)
      {
         limiter = this.corpLimiter[req.user.corporationId];
         if (!limiter)
         {
            this.corpLimiter[req.user.corporationId] = limiter = createRateLimiterInfo(this.corpLimiterRate);
         }
      }

      return limiter;
   };

   this.serveClient = function(req, res, clientJade, user)
   {
      var renderArguments =
      {
         user: user,
         runtime: req.query.runtime ? req.query.runtime : 'release',
         shaders: [ getShaderInfo('vertex', 'basic-vertex-shader', 'basicVertexShader.c'),
               getShaderInfo('fragment', 'basic-fragment-shader', 'basicFragmentShader.c'),
               getShaderInfo('vertex', 'system-vertex-shader', 'solarSystemVertexShader.c'),
               getShaderInfo('fragment', 'system-fragment-shader', 'solarSystemFragmentShader.c') ],
         clientConfig: JSON.stringify(this.options.clientOptions)
      };

      res.render(clientJade, renderArguments);
   },

   this.onGetIndex = function(req, res)
   {
      if (req.user)
      {
         if (req.session.cookie.maxAge > 0)
         {
            logger.verbose('Resetting maxAge of session cookie');
            req.session.cookie.maxAge = this.stayLoggedInAge;
         }

         this.serveClient(req, res, 'mainClient.jade', req.user);
      }
      else
      {
         res.redirect('/login');
      }
   };

   this.onGetDeadEnd = function(req, res)
   {
      var message = req.query.message;

      res.render('deadEnd.jade',
      {
         message: message
      });
   };

   this.onGetLogin = function(req, res)
   {
      var userAgent = req.headers['user-agent'];
      var isInGameBrowser = userAgent && (userAgent.indexOf('EVE-IGB') >= 0);
      var isInternetExplorer = userAgent && (userAgent.indexOf('MSIE') >= 0);

      if (req.user)
      {
         res.redirect('/');
      }
      else if (isInternetExplorer)
      {
         res.redirect('/deadEnd?message=unsupportedBrowser');
      }
      else
      {
         var message = req.query.message;
         var hasInGameBrowserTrust = req.eveHeaders && (req.eveHeaders['trusted'] == 'Yes');
         var isSslConnection = !!req.headers['sslsessionid'] || (req.headers['x-forwarded-proto'] === 'https');

         if (!message && !isSslConnection)
         {
            message = 'noSsl';
         }
         else if (!message && isInGameBrowser && !hasInGameBrowserTrust)
         {
            message = 'notTrusted';
         }
         res.render('login.jade',
         {
            message: message
         });
      }
   };

   this.onGetLogout = function(req, res)
   {
      var param = '';

      if (req.user)
      {
         req.logout();
         param = '?message=loggedOut';
      }
      req.session.cookie.maxAge = null;
      req.session.cookie.expires = false;
      res.redirect('/login' + param);
   };

   this.onRequestEventSource = function(req, res)
   {
      if (req.user)
      {
         res.charset = 'UTF-8';
         res.header('Content-Type', 'text/event-stream');
         res.header('Cache-Control', 'no-cache');
         res.header('Access-Control-Allow-Origin', '*');

         function sendFunction(data, event, comment)
         {
            var block = '';

            if (comment)
            {
               block += ': ' + comment + '\n';
            }
            if (event)
            {
               if (!clientEvents[event])
               {
                  logger.error('Unregistered client event [' + event + ']');
               }
               block += 'event: ' + event + '\n';
            }
            if (data)
            {
               block += 'data: ' + data + '\n';
            }

            res.write(block + '\n');
         }

         // send first message, including a 2KB padding comment for IE
         sendFunction(new Date().getTime(), clientEvents.Timer.name, Array(2049).join(' '));

         { // start keep-alive timer
            var timer = setInterval(function()
            {
               sendFunction(new Date().getTime(), clientEvents.Timer.name, 'timer');
            }, 10000);
            res.on('close', function()
            {
               clearInterval(timer);
            });
         }
         req.on('close', function()
         {
            res.end();
         });

         this.sessionHandler.onDataPortOpened(req.user, res, sendFunction);
      }
      else
      {
         res.send(401);
      }
   };

   this.onRequestRequestSink = function(req, res, next)
   {
      if (req.user)
      {
         var contentType = req.headers['content-type'] || '';

         if (req.method === 'POST' && (contentType.indexOf('application/json') >= 0) && req.body
               && (req.body.jsonrpc === '2.0') && (req.body.method === 'clientRequest') && (req.body.params))
         {
            var clientRequest =
            {
               eveHeaders: req.eveHeaders,
               user: req.user,
               header: req.body.params.header,
               body: req.body.params.body
            };
            var resultObj =
            {
               jsonrpc: '2.0',
               id: req.body.id,
               result:
               {
                  eveHeadersPresence: !!req.eveHeaders,
                  returnCode: null
               }
            };

            resultObj.result.returnCode = this.sessionHandler.onClientRequest(clientRequest);

            { // send result
               var body = JSON.stringify(resultObj);

               res.writeHead(200,
               {
                  'Content-Type': 'application/json',
                  'Content-Length': Buffer.byteLength(body)
               });
               res.end(body);
            }
         }
         else
         {
            next();
         }
      }
      else
      {
         res.send(401);
      }
   };

   /**
    * Callback from passport regarding user authentication. Delegates to the session handler.
    */
   this.onApiUserAuthentication = function(req, keyId, vCode, done)
   {
      if (req.user)
      {
         logger.info('Handling already logged in case');
         done("Already logged in. Go to main page.");
      }
      else
      {
         if (req.body.stayLoggedIn == 'true')
         {
            logger.verbose("KeyId " + req.body.keyId + " requests to stay logged in...");
            req.session.cookie.maxAge = this.stayLoggedInAge;
         }
         this.sessionHandler.onLogInRequest(keyId, vCode, done);
      }
   };
}
util.inherits(HttpServerComponent, Component);

module.exports = HttpServerComponent;
