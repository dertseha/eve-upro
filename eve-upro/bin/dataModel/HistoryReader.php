<?php
namespace upro\dataModel
{
/**
 * A history reader receives history from a provider
 */
interface HistoryReader
{
   /**
    * Called when the history is not sufficient to get the reader up to
    * the latest instance from a given starting instance. The reader is expected to
    * retrieve all of the current model from persistence before continuing.
    * @param \upro\dataModel\ReadAccess $readAccess read access to the model for extraction
    */
   function reset(\upro\dataModel\ReadAccess $readAccess);

   /**
    * Receives one data model event
    * @param \upro\dataModel\ReadAccess $readAccess read access to the model for permission checks
    * @param int $instance the ID of the model this message has brought to
    * @param string $message the modifying message
    * @param \upro\dataModel\DataEntryId $contextId context ID information for filtering
    */
	function receive(\upro\dataModel\ReadAccess $readAccess, $instanceId, $message, $contextId);
}

}