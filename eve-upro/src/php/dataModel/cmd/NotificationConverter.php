<?php
namespace upro\dataModel\cmd
{
/**
 * Converts data model changes into notifications
 */
interface NotificationConverter
{
   /**
    * Returns the notification string for creating a data entry
    * @param \upro\dataModel\DataEntryId $entryId identifying the new entry
    * @param string:mixed $data the data map of the new entry
    * @return string the notification string
    */
	function getCreateDataEntry(\upro\dataModel\DataEntryId $entryId, $data);

   /**
    * Returns the notification string for updating a data entry
    * @param \upro\dataModel\DataEntryId $entryId identifying the modified entry
    * @param string:mixed $data the data map of the modified entry (only the modified properties are set)
    * @return string the notification string
    */
	function getUpdateDataEntry(\upro\dataModel\DataEntryId $entryId, $data);

   /**
    * Returns the notification string for deleting a data entry
    * @param \upro\dataModel\DataEntryId $entryId identifying the deleted entry
    * @return string the notification string
    */
	function getDeleteDataEntry(\upro\dataModel\DataEntryId $entryId);
}

}