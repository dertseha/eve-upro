var path = require('path');

var log4js = require('log4js');
var logger = log4js.getLogger();
var nconf = require('nconf');

logger.info('Initializing application...');

var ServiceControl = require('./components/ServiceControl.js');
var ComponentBuilder = require("./components/ComponentBuilder.js");

var AmqpComponentBuilder = require('./components/AmqpComponentBuilder.js');
var MongoDbComponentBuilder = require('./components/MongoDbComponentBuilder.js');

var EveApiMsgComponentBuilder = require('./eveapi-msg-component/EveApiMsgComponentBuilder.js');
var EveApiComponentBuilder = require('./eveapi-component/EveApiComponentBuilder.js');
var HttpServerComponentBuilder = require('./http-server-component/HttpServerComponentBuilder.js');
var CharacterAgentComponentBuilder = require('./character-agent-component/CharacterAgentComponentBuilder.js');
var ClientSessionComponentBuilder = require('./client-session-component/ClientSessionComponentBuilder.js');
var LocationServiceComponentBuilder = require('./location-service-component/LocationServiceComponentBuilder.js');
var CharacterServiceComponentBuilder = require('./character-service-component/CharacterServiceComponentBuilder.js');

var cloudMongo = null;
var cloudRabbit = null;

logger.setLevel(log4js.levels.DEBUG);

function extractCloudConfiguration()
{
   if (process.env.VCAP_SERVICES)
   {
      var env = JSON.parse(process.env.VCAP_SERVICES);

      cloudMongo = env['mongodb-1.8'][0]['credentials'];
      cloudRabbit = env['rabbitmq-2.4'][0]['credentials'];

      logger.setLevel(log4js.levels.INFO);
      log4js.loadAppender('file');
      log4js.clearAppenders();
      log4js.addAppender(log4js.appenders.file(path.normalize(__dirname + '/../logs/upro.log'), null, 1024 * 1024 * 2));
      // log4js.addAppender(log4js.appenders.console(log4js.layouts.basicLayout));
      log4js.replaceConsole(logger);
   }
}
extractCloudConfiguration();

nconf.use('memory');
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
      cookieSecret: 'The unknown cookie secret',
      sessionSecret: 'The also unknown session secret'
   },

   'upro':
   {
      profiles: [ 'http-client', 'eveapi' ]
   }
});

var serviceControl = new ServiceControl();

{ // amqp
   var builder = new AmqpComponentBuilder();
   var options =
   {
      url: nconf.get('amqp').url
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

      storeOptions: storeOptions
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
{ // client-session
   var builder = new ClientSessionComponentBuilder();

   serviceControl.setBuilder(builder);
}
{ // character-agent
   var builder = new CharacterAgentComponentBuilder();

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

serviceControl.on('started', function()
{
   logger.info('Started.');
});

logger.info('Starting components...');
serviceControl.start();
