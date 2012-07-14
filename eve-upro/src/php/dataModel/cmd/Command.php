<?php
namespace upro\dataModel\cmd
{
/**
 * A command can modify a data model
 */
interface Command
{
   /**
    * Decodes the command from given data
    * @param string:mixed $data map of init data
    */
   function decode($data);

   /**
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess for accessing the data model
    * @return array of \upro\dataModel\DataEntryId values of entries for which control is required
    */
   function getEntriesForControl(\upro\dataModel\cmd\CommandDataAccess $dataAccess);

   /**
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess for accessing the data model
    * @return array of \upro\dataModel\DataEntryId values of entries for which access is required
    */
   function getEntriesForAccess(\upro\dataModel\cmd\CommandDataAccess $dataAccess);

   /**
    * Executes the command and modifies the data model
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess for accessing the data model
    */
	function execute(\upro\dataModel\cmd\CommandDataAccess $dataAccess);
}

}