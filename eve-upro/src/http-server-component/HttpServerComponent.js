var util = require('util');
var http = require('http');
var path = require('path');

var log4js = require('log4js');
var logger = log4js.getLogger();
var express = require('express');
var MongoStore = require('connect-mongodb');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var clientEvents = require('../model/ClientEvents.js');

var Component = require('../components/Component.js');
var eveHeaders = require('../util/connect-eveheaders.js');

var uglify = require('../util/connect-uglify.js');
var clientInfo = require('../client/ClientInfo.js');

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
 * HTTP Server component
 * 
 * Using MongoDB as storage for session data.
 * 
 * Note: connect-mongodb (which we are using here) is a bit better than connect-mongo: - It allows passing an existing
 * DB object, which can be opened already - When the database is closed, the internal reap interval is cleared
 * 
 * Info Links: - http://jade-lang.com/ - https://github.com/visionmedia/jade - http://expressjs.com/
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

      this.expressServer = expressServer;
      this.sessionStore = new MongoStore(
      {
         db: this.mongodb.getDatabase(),

         reapInterval: this.options.reapInterval,
         collection: this.options.collection
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

         expressServer.use(express.limit('100kb'));
         expressServer.use(express.favicon(path.normalize(__dirname + '/public/images/favicon.ico')));
         expressServer.use(log4js.connectLogger(logger,
         {
            level: log4js.levels.DEBUG
         }));
         expressServer.use(express.bodyParser());
         expressServer.use(express.methodOverride());
         expressServer.use(express.cookieParser(self.options.cookieSecret || 'Some special secret'));

         expressServer.use(express.session(
         {
            key: 'upro.sid',
            secret: self.options.sessionSecret || 'Some other secret',
            store: self.sessionStore
         }));
         expressServer.use(passport.initialize());
         expressServer.use(passport.session());
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

      expressServer.get('/login', function(req, res)
      {
         self.onGetLogin(req, res);
      });
      expressServer.post('/login', passport.authenticate('local',
      {
         successRedirect: '/',
         failureRedirect: '/login?message=loginFailed'
      }));

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

      var httpServer = http.createServer(expressServer);
      var usedPort = expressServer.get('port');

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

   this.onGetIndex = function(req, res)
   {
      if (req.user)
      {
         var session = req.session;

         if (!session.views)
         {
            session.views = 0;
         }
         session.views++;

         res.setHeader('Content-Type', 'text/html');
         res.write('<p>hi, views: ' + session.views + '</p>');
         if (req.user)
         {
            res.write('<p>' + JSON.stringify(req.user) + '</p>');
         }
         res.end();
      }
      else
      {
         res.redirect('/login');
      }
   };

   this.onGetLogin = function(req, res)
   {
      if (req.user)
      {
         res.redirect('/');
      }
      else
      {
         var message = req.query.message;

         res.render('login.jade',
         {
            message: message
         });
      }
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
               if (!clientEvents.EventNames[event])
               {
                  logger.warn('WARN: unregistered client event [' + event + ']');
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
         sendFunction(new Date().getTime(), clientEvents.EventNames.Timer, Array(2049).join(' '));

         { // start keep-alive timer
            var timer = setInterval(function()
            {
               sendFunction(new Date().getTime(), clientEvents.EventNames.Timer, 'timer');
            }, 10000);
            res.on('close', function()
            {
               clearInterval(timer);
            });
         }

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
               header: req.body.params.header,
               body: req.body.params.body
            };
            var resultObj =
            {
               jsonrpc: '2.0',
               id: req.body.id,
               result: null
            };

            resultObj.result = this.sessionHandler.onClientRequest(clientRequest);

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
      this.sessionHandler.onLogInRequest(req.eveHeaders, keyId, vCode, done);
   };
}
util.inherits(HttpServerComponent, Component);

module.exports = HttpServerComponent;
