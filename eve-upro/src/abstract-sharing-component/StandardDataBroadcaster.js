var busMessages = require('../model/BusMessages.js');

/**
 * A standard broadcaster for sending messages about a shared data object
 */
function StandardDataBroadcaster(broadcaster, dataName)
{
   this.broadcaster = broadcaster;
   this.dataName = dataName;

   this.broadcastDataInfo = function(dataObject, interest, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts[this.dataName + 'Info'].name,
         interest: interest
      };
      var body =
      {
         id: dataObject.getDocumentId(),
         data: dataObject.getSpecificData()
      };

      this.broadcaster.broadcast(header, body, queueName);
   };

   this.broadcastDataInfoReset = function(dataObject, interest)
   {
      var header =
      {
         type: busMessages.Broadcasts[this.dataName + 'Info'].name,
         interest: interest,
         disinterest: dataObject.getDataInterest()
      };
      var body =
      {
         id: dataObject.getDocumentId()
      };

      this.amqp.broadcast(header, body);
   };

   this.broadcastDataShare = function(dataObject, interest, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts[this.dataName + 'Shares'].name,
         interest: interest
      };
      var body =
      {
         id: dataObject.getDocumentId(),
         interest: dataObject.getDataInterest()
      };

      this.broadcaster.broadcast(header, body, queueName);
   };

   this.broadcastDataShareReset = function(dataObject, interest)
   {
      var header =
      {
         type: busMessages.Broadcasts[this.dataName + 'Shares'].name,
         interest: interest,
         disinterest: dataObject.getOwnerInterest()
      };
      var body =
      {
         id: dataObject.getDocumentId(),
         interest: []
      };

      this.broadcaster.broadcast(header, body);
   };

   this.broadcastDataOwnership = function(dataObject, interest, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts[this.dataName + 'Owner'].name,
         interest: interest
      };
      var body =
      {
         id: dataObject.getDocumentId(),
         interest: dataObject.getOwnerInterest()
      };

      this.broadcaster.broadcast(header, body, queueName);
   };

   this.broadcastDataOwnershipReset = function(dataObject, interest)
   {
      var header =
      {
         type: busMessages.Broadcasts[this.dataName + 'Owner'].name,
         interest: interest,
         disinterest: dataObject.getDataInterest()
      };
      var body =
      {
         id: dataObject.getDocumentId(),
         interest: []
      };

      this.broadcaster.broadcast(header, body);
   };
}

module.exports = StandardDataBroadcaster;
