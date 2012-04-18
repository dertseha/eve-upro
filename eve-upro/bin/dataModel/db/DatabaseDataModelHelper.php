<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../DataEntry.php';

require_once realpath(dirname(__FILE__)) . '/../../db/KeyedBufferTableRowReader.php';

require_once realpath(dirname(__FILE__)) . '/../../db/schema/TableControl.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/StringDataType.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/IntegerDataType.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/UuidDataType.php';

/**
 * A helper class
 */
class DatabaseDataModelHelper
{
   /**
    *
    * @param string $entryType the type to use for the created data entry
    * @param \upro\db\KeyedBufferTableRowReader $reader from which to extract the data
    * @param int $index from which row to read the data
    * @return \upro\dataModel\DataEntry the resulting entry
    */
   public static function extractDataEntry($entryType, \upro\db\KeyedBufferTableRowReader $reader, $index)
   {
      $keys = $reader->getKeys();
      $id = $reader->getCell($index, DatabaseDataModelConstants::COLUMN_NAME_ID);
      $contextId = $reader->getCell($index, DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID);
      $contextEntryType = $reader->getCell($index, DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE);
      $data = array();

      foreach ($keys as $key)
      {
         if (($key !== DatabaseDataModelConstants::COLUMN_NAME_ID)
               && ($key !== DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID)
               && ($key !== DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE))
         {
            $data[$key] = $reader->getCell($index, $key);
         }
      }

      return new \upro\dataModel\DataEntry(new \upro\dataModel\DataEntryId($entryType, $id),
            new \upro\dataModel\DataEntryId($contextEntryType, $contextId), $data);
   }
}

}