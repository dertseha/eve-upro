var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var LoadingDataState = require('./LoadingDataState.js');
var ActiveDataState = require('./ActiveDataState.js');

/**
 * The standard state factory
 */
function DataStateFactory(owner)
{
   this.owner = owner;

   /**
    * @returns a new LoadingDataState instance
    */
   this.createLoadingDataState = function(documentId)
   {
      return new LoadingDataState(this.owner, this.owner.dataObjectConstructor, documentId);
   };

   /**
    * @returns a new ActiveDataState instance
    */
   this.createActiveDataState = function(dataObject)
   {
      return new ActiveDataState(this.owner, dataObject);
   };

}

module.exports = DataStateFactory;
