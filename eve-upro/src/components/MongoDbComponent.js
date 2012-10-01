var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');
var mongodb = require('mongodb');

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

      mongodb.connect(this.options.url, function(err, db)
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

   this.collections = {};

   /**
    * Defines a collection - ensures its existence
    */
   this.defineCollection = function(collectionName, indexDef, callback)
   {
      var options = {};
      var self = this;

      this.db.collection(collectionName, options, function(err, collection)
      {
         if (err)
         {
            callback(err);
         }
         else
         {
            logger.info('Defined collection [' + collectionName + ']');
            indexDef.forEach(function(def)
            {
               collection.ensureIndex(def, function(err)
               {
                  logger.info('Ensured index for [' + collectionName + ']: ' + JSON.stringify(def),
                  {
                     error: err
                  });
               });
            });
            self.onCollection(collection, callback);
         }
      });
   };

   /**
    * Sets data in a collection
    */
   this.setData = function(collectionName, id, data, callback)
   {
      var collection = this.collections[collectionName];

      if (collection)
      {
         var document =
         {
            _id: id,
            entryTime: new mongodb.Timestamp(),
            data: data
         };

         collection.save(document,
         {
            safe: 1
         }, function(err, updated)
         {
            callback(err);
         });
      }
      else
      {
         process.nextTick(function()
         {
            callback('Collection <' + collectionName + '> not initialized');
         });
      }
   };

   this.delData = function(collectionName, criteria, callback)
   {
      var collection = this.collections[collectionName];

      if (collection)
      {
         var sort = {};
         var update = {};

         collection.findAndModify(criteria, sort, update,
         {
            remove: true
         }, function(err, updated)
         {
            if (err)
            {
               logger.error('Could not delete data from ' + collectionName + ': ' + JSON.stringify(err));
            }
            if (callback)
            {
               callback(err);
            }
         });
      }
      else
      {
         var message = 'Could not delete data from ' + collectionName + ': Collection not initialized';

         logger.error(message);
         throw new Error(message);
      }
   };

   /**
    * Retrieves data from a collection
    */
   this.getData = function(collectionName, filter, callback, fields, options)
   {
      var collection = this.collections[collectionName];

      if (collection)
      {
         var self = this;
         var finalOptions = {};

         if (options)
         {
            for ( var optionName in options)
            {
               finalOptions[optionName] = options[optionName];
            }
         }
         var cursor = collection.find(filter, fields, finalOptions);

         cursor.each(function(err, document)
         {
            self.onDocument(collection, document, callback);
         });
      }
      else
      {
         process.nextTick(function()
         {
            callback('Collection <' + collectionName + '> not initialized');
         });
      }
   };

   /**
    * Callback handler for ensuring existence of a collection.
    * 
    * @param collection the collection object
    * @param callback the user callback to call
    */
   this.onCollection = function(collection, callback)
   {
      this.collections[collection.collectionName] = collection;

      callback(null);
   };

   /**
    * Callback handler for a found document
    * 
    * @param collection the original collection
    * @param document the found document
    * @param callback the user callback
    */
   this.onDocument = function(collection, document, callback)
   {
      process.nextTick(function()
      {
         if (document)
         {
            callback(null, document._id, document.data);
         }
         else
         {
            callback(null, null, null);
         }
      });
   };

   /**
    * Deletes the document with given id in given collection
    * 
    * @param collection the collection to work in
    * @param id id of the document to delete
    */
   this.deleteDocument = function(collection, id)
   {
      collection.findAndModify(
      {
         _id: id
      }, {}, null,
      {
         remove: true
      }, function(err, document)
      {
         if (err)
         {
            logger.error('Failed to delete document ID [' + id + '] from [' + collection.collectionName + ']: ' + err);
         }
      });
   };

}
util.inherits(MongoDbComponent, Component);

module.exports = MongoDbComponent;
