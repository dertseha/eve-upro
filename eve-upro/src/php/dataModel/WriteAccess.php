<?php
namespace upro\dataModel
{
/**
 * A write access is for writing data to the model.
 * Accessing the model or the history is only allowed between the calls to start()
 * and one of the stopping methods: stop() or cancel()  from the WriteContext
 */
interface WriteAccess
{
   /**
    * Returns the next data model instance value
    * @return int the next instance number
    */
   function getNextInstanceValue();

   /**
    * Retrieves a data entry from the model
    * @param \upro\dataModel\DataEntryId $entryId identifying the entry to retrieve
    * @return \upro\dataModel\DataEntry the properties of requested entry or null if not found
    */
   function retrieveDataEntry(\upro\dataModel\DataEntryId $entryId);

   /**
    * Searches for data entries from the model with specific data
    * @param string $entryType the entry type to look for
    * @param \upro\dataModel\DataEntryId $contextId identifying the context to search the limit in
    * @param string:mixed $filter a map of at least one property value to look for
    * @return array of \upro\dataModel\DataEntry the matching list of data entries
    */
   function findDataEntries($entryType, \upro\dataModel\DataEntryId $contextId, $filter);

   /**
    * Stores one data model event in the history
    * @param string $message the modifying message
    * @param \upro\dataModel\DataEntryId $contextId entry ID information for filtering
    * @return int the new instance number
    */
	function addHistoryEntry($message, $contextId);

   /**
    * Creates a new data entry
    * @param \upro\dataModel\DataEntryId $entryId identifying the data entry
    * @param string:mixed $data the data map of the new entry
    * @param \upro\dataModel\DataEntryId $contextId identifying the context
    */
	function createDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId);

   /**
    * Updates an existing data entry
    * @param \upro\dataModel\DataEntryId $entryId identifying the data entry
    * @param string:mixed $data the data map with the properties to modify
    */
	function updateDataEntry(\upro\dataModel\DataEntryId $entryId, $data);

   /**
    * Deletes an existing data entry
    * @param \upro\dataModel\DataEntryId $entryId identifying the data entry to remove
    */
	function deleteDataEntry(\upro\dataModel\DataEntryId $entryId);
}

}