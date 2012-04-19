<?php
namespace upro\dataModel
{
/**
 * A read access is for retrieving data from to the model.
 */
interface ReadAccess
{
   /**
    * @return the current data model instance
    */
   function getCurrentInstanceValue();

   /**
    * Returns true if access to given data entry is granted
    * @param \upro\dataModel\DataEntryId $entryId the entry ID to check
    * @param int $instance the instance value of the data model to check in
    * @return boolean true if access is granted
    */
   function isAccessGranted(\upro\dataModel\DataEntryId $entryId, $instance);

   /**
    * Requests to read the entire data model. All entries of the entire model will be
    * read and provided to the given reader.
    * @param \upro\dataModel\DataModelReader $reader the reader to receive the entries
    */
   function readDataModel(\upro\dataModel\DataModelReader $reader);
}

}