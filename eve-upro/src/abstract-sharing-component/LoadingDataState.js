var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var UuidFactory = require('../util/UuidFactory.js');

var AbstractDataObject = require('./AbstractDataObject.js');
var AbstractDataState = require('./AbstractDataState.js');

/**
 * The loading data state buffers pending requests while loading the data object from storage
 */
function LoadingDataState(owner, documentFactory, documentId)
{
   LoadingDataState.super_.call(this, owner);

   this.documentFactory = documentFactory;
   this.documentId = documentId;

   this.broadcastQueue = [];

   /**
    * Broadcast handler
    */
   this.onBroadcast = function(message)
   {
      this.broadcastQueue.push(message);
   };

   /**
    * Requests to activate the state: Set it active at the owner and perform initial tasks
    */
   this.activate = function()
   {
      var owner = this.getOwner();
      var self = this;
      var filter =
      {
         _id: UuidFactory.toMongoId(this.documentId)
      };
      var firstDataReturned = false;

      owner.setDataState(this.documentId, this);

      owner.getStorage().getData(this.documentFactory.CollectionName, filter, function(err, id, data)
      {
         if (!firstDataReturned)
         {
            self.onFirstDataResult(data);
            firstDataReturned = true;
         }
      });
   };

   this.onFirstDataResult = function(data)
   {
      var owner = this.getOwner();

      if (data && !this.documentFactory.isDocumentValid(data))
      {
         logger.warn('DB data of ' + this.documentFactory.CollectionName + ' with ID ' + this.documentId
               + ' is not valid according to schema. Deleting.');
         AbstractDataObject.erase(owner.getStorage(), this.documentFactory.CollectionName, this.documentId);
         data = null;
      }

      if (data)
      {
         var dataObject = owner.createDataObject(this.documentId, data);
         var nextState = this.getNextState(dataObject);

         nextState.activate();
         this.handOverToNextState(nextState);
      }
      else
      {
         logger.info('No entry of ' + this.documentFactory.CollectionName + ' with ID ' + this.documentId
               + ' existing. Ignored.');
         this.onNoDataFound();
      }
   };

   this.getNextState = function(dataObject)
   {
      return this.getOwner().getDataStateFactory().createActiveDataState(dataObject);
   };

   this.handOverToNextState = function(nextState)
   {
      this.broadcastQueue.forEach(function(message)
      {
         nextState.onBroadcast(message);
      });
   };

   this.onNoDataFound = function()
   {
      this.getOwner().setDataState(this.documentId, null);
   };
}
util.inherits(LoadingDataState, AbstractDataState);

module.exports = LoadingDataState;
