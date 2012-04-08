<?php
namespace upro\dataModel
{
require_once realpath(dirname(__FILE__)) . '/HistoryReader.php';

/**
 * A read context is for extracting data from the model or its history.
 * The context is expected to be requested once and queried regularly for the history.
 * Reading from the model itself is only allowed within the callbacks of the HistoryReader.
 */
interface ReadContext
{
   /**
    * Performs some internal preparations.
    */
   function prepare();

   /**
    * Releases any resources previously prepared.
    */
   function unprepare();

   /**
    * Requests any new entries from the model happening since the last instance ID.
    * @param int $lastInstance the last known data model instance known to the caller
    * @param \upro\dataModel\HistoryReader $reader the reader which shall receive the messages
    */
	function readHistoryEntries($lastInstance, \upro\dataModel\HistoryReader $reader);
}

}