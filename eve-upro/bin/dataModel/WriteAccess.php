<?php
namespace upro\dataModel
{
/**
 * A write access is for writing data to the model.
 * Writing to the model or the history is only allowed between the calls to start()
 * and one of the stopping methods: stop() or cancel()  from the WriteContext
 */
interface WriteAccess
{
   /**
    * Stores one data model event in the history
    * @param string $message the modifying message
    * @param \upro\dataModel\DataEntryId $contextId entry ID information for filtering
    * @return int the new instance number
    */
	function addHistoryEntry($message, $contextId);
}

}