<?php
namespace upro\dataModel
{
require_once realpath(dirname(__FILE__)) . '/../Uuid.php';

/**
 * A history reader receives history from a provider
 */
interface HistoryReader
{
   /**
    * Called when the history is not sufficient to get the reader up to
    * the latest instance from a given starting instance. The reader is expected to
    * retrieve all of the current model from persistence before continuing.
    * @param int $instanceId the ID of the current data model
    */
   function reset($instance);

   /**
    * Receives one data model event
    * @param int $instance the ID of the model this message has brought to
    * @param string $message the modifying message
    * @param \upro\dataModel\DataEntryId $contextId context ID information for filtering
    */
	function receive($instanceId, $message, $contextId);
}

}