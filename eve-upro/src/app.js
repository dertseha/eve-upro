var path = require('path');

var winston = require('winston');
var logger = winston.loggers.add('root', {});
var nconf = require('nconf');

logger.remove(winston.transports.Console);
logger.setLevels(winston.config.cli.levels);
logger.add(winston.transports.Console,
{
   level: 'verbose',
   colorize: true,
   timestamp: true
});

logger.info('Initializing application...');

var ServiceControl = require('./components/ServiceControl.js');
var ComponentBuilder = require("./components/ComponentBuilder.js");

var AmqpComponentBuilder = require('./components/AmqpComponentBuilder.js');
var MongoDbComponentBuilder = require('./components/MongoDbComponentBuilder.js');

var EveApiMsgComponentBuilder = require('./eveapi-msg-component/EveApiMsgComponentBuilder.js');
var EveApiComponentBuilder = require('./eveapi-component/EveApiComponentBuilder.js');
var HttpServerComponentBuilder = require('./http-server-component/HttpServerComponentBuilder.js');
var BodyRegisterComponentBuilder = require('./bodyregister-service-component/BodyRegisterServiceComponentBuilder.js');
var CharacterAgentComponentBuilder = require('./character-agent-component/CharacterAgentComponentBuilder.js');
var ClientSessionComponentBuilder = require('./client-session-component/ClientSessionComponentBuilder.js');
var GroupServiceComponentBuilder = require('./group-service-component/GroupServiceComponentBuilder.js');
var LocationServiceComponentBuilder = require('./location-service-component/LocationServiceComponentBuilder.js');
var CharacterServiceComponentBuilder = require('./character-service-component/CharacterServiceComponentBuilder.js');
var AutopilotServiceComponentBuilder = require('./autopilot-service-component/AutopilotServiceComponentBuilder.js');
var JumpCorridorServiceComponentBuilder = require('./jumpcorridor-service-component/JumpCorridorServiceComponentBuilder.js');
var RouteServiceComponentBuilder = require('./route-service-component/RouteServiceComponentBuilder.js');

var cloudMongo = null;
var cloudRabbit = null;

function extractCloudConfiguration()
{
   if (process.env.VCAP_SERVICES)
   {
      var env = JSON.parse(process.env.VCAP_SERVICES);

      cloudMongo = env['mongodb-1.8'][0]['credentials'];
      cloudRabbit = env['rabbitmq-2.4'][0]['credentials'];

      logger.remove(winston.transports.Console);
      logger.add(winston.add(winston.transports.File, options),
      {
         level: 'info',
         timestamp: true,
         maxsize: 1024 * 1024 * 2,
         maxFiles: 10
      });
   }
}
extractCloudConfiguration();

nconf.use('memory');
nconf.file(__dirname + '/upro-config.json');
nconf.env();
nconf.argv();
nconf.defaults(
{
   'amqp':
   {
      url: cloudRabbit ? cloudRabbit.url : 'amqp://localhost'
   },

   'mongodb':
   {
      host: cloudMongo ? cloudMongo.hostname : 'localhost',
      port: cloudMongo ? cloudMongo.port : 27017,
      db: cloudMongo ? cloudMongo.db : 'eve-upro_live',
      username: cloudMongo ? cloudMongo.username : null,
      password: cloudMongo ? cloudMongo.password : null
   },

   'http':
   {
      host: nconf.get('VCAP_APP_HOST') || 'localhost',
      port: nconf.get('VMC_APP_PORT') || 3000,
      cookieSecret: null,
      sessionSecret: null
   },

   'upro':
   {
      validateBroadcasts: cloudRabbit ? false : true,
      security:
      {
         allowed:
         {
            characterIds: [],
            corporationIds: []
         },
         denied:
         {
            characterIds: [],
            corporationIds: []
         }
      }
   },
   'client': {

   }
});

var serviceControl = new ServiceControl();

{ // amqp
   var builder = new AmqpComponentBuilder();
   var options =
   {
      url: nconf.get('amqp').url,
      validateBroadcasts: nconf.get('upro').validateBroadcasts
   };

   builder.setOptions(options);
   serviceControl.setBuilder(builder);
}
{ // mongodb
   var builder = new MongoDbComponentBuilder();
   var options =
   {
      hostname: nconf.get('mongodb').host,
      port: nconf.get('mongodb').port,
      db: nconf.get('mongodb').db,
      username: nconf.get('mongodb').username,
      password: nconf.get('mongodb').password
   };

   builder.setOptions(options);
   serviceControl.setBuilder(builder);
}
{ // http-server
   var builder = new HttpServerComponentBuilder();
   var storeOptions =
   {
      db: nconf.get('mongodb').db,
      collection: 'httpSessions',
      host: nconf.get('mongodb').host,
      port: nconf.get('mongodb').port,
      username: nconf.get('mongodb').username,
      password: nconf.get('mongodb').password,

      auto_reconnect: true,
      clear_interval: 60 * 60 * 24 * 7
   };
   var options =
   {
      port: nconf.get('http').port,
      cookieSecret: nconf.get('http').cookieSecret,
      sessionSecret: nconf.get('http').sessionSecret,

      storeOptions: storeOptions,

      clientOptions: nconf.get('client')
   };

   builder.setOptions(options);
   serviceControl.setBuilder(builder);
}
{ // eveapi-msg
   var builder = new EveApiMsgComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // eveapi
   var builder = new EveApiComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // bodyregister
   var builder = new BodyRegisterComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // character-agent
   var builder = new CharacterAgentComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // client-session
   var builder = new ClientSessionComponentBuilder();
   var options =
   {
      security: nconf.get('upro').security
   };

   builder.options = options;
   serviceControl.setBuilder(builder);
}
{ // group-service
   var builder = new GroupServiceComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // location-service
   var builder = new LocationServiceComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // character-service
   var builder = new CharacterServiceComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // autopilot-service
   var builder = new AutopilotServiceComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // jumpcorridor-service
   var builder = new JumpCorridorServiceComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // route-service
   var builder = new RouteServiceComponentBuilder();

   serviceControl.setBuilder(builder);
}

serviceControl.on('started', function()
{
   logger.info('Started.');
});

logger.info('Starting components...');
serviceControl.start();
