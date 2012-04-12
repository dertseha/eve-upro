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
    * @return array of \upro\dataModel\DataEntryId values of entries for which control is required
    */
   function getEntriesForControl();

   /**
    * @return array of \upro\dataModel\DataEntryId values of entries for which access is required
    */
   function getEntriesForAccess();

   /**
    * Executes the command and modifies the data model
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess for accessing the data model
    */
	function execute(\upro\dataModel\cmd\CommandDataAccess $dataAccess);
}

}