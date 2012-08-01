var mongo = require('mongodb');
var util = require('util');

var eveapi = require('../../eveapi');

/**
 * An API storage based on Mongo DB
 * 
 * See also https://github.com/christkv/node-mongodb-native/tree/master/docs
 */
function MongoDbEveApiStorage(db)
{
   MongoDbEveApiStorage.super_.call(this);

   this.db = db;
   this.collections = {};

   /** {@inheritDoc} */
   this.defineCollection = function(collectionName, callback)
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
            self.onCollection(collection, callback);
         }
      });
   };

   /** {@inheritDoc} */
   this.set = function(collectionName, key, ttlSeconds, data, callback)
   {
      var collection = this.collections[collectionName];

      if (collection)
      {
         var document =
         {
            _id: new mongo.ObjectID(key),
            entryTime: new mongo.Timestamp(),
            saveTime: this.getCorrectedTimestamp(),
            ttlSeconds: ttlSeconds,
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

   /** {@inheritDoc} */
   this.get = function(collectionName, key, callback)
   {
      var collection = this.collections[collectionName];

      if (collection)
      {
         var self = this;

         collection.findOne(
         {
            _id: new mongo.ObjectID(key)
         }, function(err, document)
         {
            if (err)
            {
               callback(err);
            }
            else if (!document)
            {
               callback('Not found');
            }
            else
            {
               self.onDocument(collection, document, callback);
            }
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
    * Calculates the current timestamp in UTC seconds since epoch, rounded up
    * 
    * @returns the next full second since UTC epoch
    */
   this.getCorrectedTimestamp = function()
   {
      var nowUtcString = this.getCurrentDate().toUTCString();
      var nowNextSecond = (new Date(nowUtcString).getTime() + 999) / 1000;

      return nowNextSecond | 0;
   };

   /**
    * @returns the current system time as a Date object
    */
   this.getCurrentDate = function()
   {
      return new Date();
   };

   /**
    * Callback handler for ensuring existence of a collection. It also ensures an index for deleting timed-out data
    * based on 'entryTime' column
    * 
    * @param collection the collection object
    * @param callback the user callback to call
    */
   this.onCollection = function(collection, callback)
   {
      var secondsPerFourWeeks = 60 * 60 * 24 * 7 * 4;

      this.collections[collection.collectionName] = collection;

      // http://docs.mongodb.org/manual/tutorial/expire-data/
      collection.ensureIndex(
      {
         'entryTime': 1
      },
      {
         expireAfterSeconds: secondsPerFourWeeks
      }, function(err, indexName)
      {
         callback(err);
      });
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
      var now = this.getCorrectedTimestamp();

      if ((document.saveTime + document.ttlSeconds) < now)
      {
         this.deleteDocument(collection, document._id);
         process.nextTick(function()
         {
            callback('Data timed out');
         });
      }
      else
      {
         process.nextTick(function()
         {
            callback(null, document.data);
         });
      }
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
            // TODO what do?
         }
      });
   };
}

util.inherits(MongoDbEveApiStorage, eveapi.EveApiStorage);

module.exports = MongoDbEveApiStorage;
