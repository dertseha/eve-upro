var mongodb = require('mongodb');
var util = require('util');

var Component = require("./Component.js");

function MongoDbComponent(options)
{
   MongoDbComponent.super_.call(this);

   this.options = options;

   this.db = null;

   /** {@inheritDoc} */
   this.start = function()
   {
      this.requestServer();
   };

   /** {@inheritDoc} */
   this.tearDown = function()
   {
      if (this.db)
      {
         this.db.close();
         this.db = null;
      }
   };

   this.requestServer = function()
   {
      var self = this;
      var port = this.options.port || mongodb.Connection.DEFAULT_PORT;
      var dbOptions = {};

      this.server = new mongodb.Server(this.options.hostname, port, this.options.serverOptions);

      var dbConnector = new mongodb.Db(this.options.db, this.server, dbOptions);

      dbConnector.open(function(err, db)
      {
         if (err)
         {
            throw new Error('failed to open: ' + err);
         }
         self.db = db;
         if (self.options.username)
         {
            db.authenticate(self.options.username, self.options.password, {}, function(err)
            {
               self.onStartProgress();
            });
         }
         else
         {
            self.onStartProgress();
         }
      });
   };

   this.onStartProgress = function()
   {
      if (this.db)
      {
         this.onStarted();
      }
   };

   this.onError = function(message)
   {
      this.emit('error', message);
   };

   this.getDatabase = function()
   {
      return this.db;
   };
}
util.inherits(MongoDbComponent, Component);

module.exports = MongoDbComponent;
