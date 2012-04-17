<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../GroupAccess.php';

/**
 * Provides access to the data model for commands
 */
interface CommandDataAccess
{
   /**
    * Returns an access interface to group control
    * @return \upro\dataModel\GroupAccess the requested group access
    */
   function getGroupAccess();

   /**
    * @return string the data model ID
    */
   function getModelId();

   /**
    * Returns the next data model instance value
    * @return int the next instance number
    */
   function getNextInstanceValue();

   /**
    * Retrieves a specific data entry from the model
    * @param \upro\dataModel\DataEntryId $entryId identifying the entry to retrieve
    * @return \upro\dataModel\DataEntry the retrieved data entry or null if not existing
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