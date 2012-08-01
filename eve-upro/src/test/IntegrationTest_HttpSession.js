var nconf = require('nconf');

// var webdriver = require('selenium-webdriverjs');

var ServiceControl = require('../components/ServiceControl.js');

var MongoDbComponentBuilder = require('../components/MongoDbComponentBuilder.js');
var HttpServerComponentBuilder = require('../http-server-component/HttpServerComponentBuilder.js');

function Fixture()
{
   this.controls = [];
   this.started = 0;

   // this.webClient = new webdriver.Builder().build();

   this.createHttpServerServiceControl = function(port)
   {
      var serviceControl = new ServiceControl();

      { // mongodb
         var builder = new MongoDbComponentBuilder();
         var options =
         {
            db: 'eve-upro_test_HttpSession',
            hostname: 'localhost',
         };

         builder.setOptions(options);
         serviceControl.setBuilder(builder);
      }
      {
         var builder = new HttpServerComponentBuilder();
         var storeOptions =
         {
            collection: 'httpSessions',
            reapInterval: 60 * 60 * 24 * 7
         };
         var options =
         {
            port: port,
            storeOptions: storeOptions
         };

         builder.setOptions(options);
         serviceControl.setBuilder(builder);
      }

      this.controls.push(serviceControl);
   };

   this.startControls = function(callback)
   {
      var self = this;

      this.started = 0;
      this.controls.forEach(function(control)
      {
         control.on('started', function()
         {
            self.onStartProgress(callback);
         });
         control.start();
      });
   };

   this.onStartProgress = function(callback)
   {
      this.started++;
      if (this.started == this.controls.length)
      {
         callback();
      }
   };

   this.stopControls = function()
   {
      this.controls.forEach(function(control)
      {
         control.tearDown();
      });
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   this.fixture.createHttpServerServiceControl(5000);
   this.fixture.createHttpServerServiceControl(5001);

   this.fixture.startControls(callback);
};

exports.tearDown = function(callback)
{
   this.fixture.stopControls();

   callback();
};

exports.testSomething = function(test)
{
   // ok... even selenium doesn't work here. - crashes with exceptions

   test.done();
};
