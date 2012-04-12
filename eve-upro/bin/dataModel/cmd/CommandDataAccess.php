<?php
namespace upro\dataModel\cmd
{
/**
 * Provides access to the data model for commands
 */
interface CommandDataAccess
{
   /**
    * Retrieves a data entry from the model
    * @param \upro\dataModel\DataEntryId $entryId identifying the entry to retrieve
    * @return \upro\dataModel\DataEntry the retrieved data entry or null if not existing
    */
   function retrieveDataEntry(\upro\dataModel\DataEntryId $entryId);

   /**
    * Creates a notification about a data entry
    * @param \upro\dataModel\DataEntryId $entryId identifying the data entry
    * @param string:mixed $data the data map of the new entry
    * @param \upro\dataModel\DataEntryId $contextId identifying the context
    */
   function notifyDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId);

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
    * @param \upro\dataModel\DataEntryId $contextId identifying the context
    */
	function updateDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId);

   /**
    * Deletes an existing data entry
    * @param \upro\dataModel\DataEntryId $entryId identifying the data entry to remove
    * @param \upro\dataModel\DataEntryId $contextId identifying the context
    */
	function deleteDataEntry(\upro\dataModel\DataEntryId $entryId, \upro\dataModel\DataEntryId $contextId);
}

}