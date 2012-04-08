<?php
namespace upro\dataModel
{
require_once realpath(dirname(__FILE__)) . '/../Uuid.php';

/**
 * A write context is for writing data to the model.
 * Writing to the model or the history is only allowed between the calls to start()
 * and one of the stopping methods: stop() or cancel()
 */
interface WriteContext
{
   /**
    * Starts the context for future write requests
    */
   function start();

   /**
    * Stops the context and flushes (commits) any pending transmission
    */
   function stop();

   /**
    * Cancels all transmissions
    */
   function cancel();

   /**
    * Stores one data model event in the history
    * @param string $message the modifying message
    * @param string $context context UUID information for filtering
    * @return int the new instance number
    */
	function addHistoryEntry($message, $context);
}

}