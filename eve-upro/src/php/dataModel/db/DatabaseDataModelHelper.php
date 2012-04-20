<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../../db/KeyedBufferTableRowReader.php';

require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../DataEntry.php';


/**
 * A helper class
 */
class DatabaseDataModelHelper
{

   /**
    * Extracts a data entry from a specific row from a KeyedBufferTableRowReader
    * @param string $entryType the type to use for the created data entry
    * @param \upro\db\KeyedBufferTableRowReader $reader from which to extract the data
    * @param int $index from which row to read the data
    * @return \upro\dataModel\DataEntry the resulting entry
    */
   public static function extractDataEntry($entryType, \upro\db\KeyedBufferTableRowReader $reader, $index)
   {
      return \upro\dataModel\db\DatabaseDataModelHelper::exctractDataEntryRaw($entryType,
            $reader->getRow($index), $reader->getKeyMap());
   }

   /**
    * Extracts a data entry from a raw data row, typically from a TableRowReader
    * @param string $entryType the type to use for the created data entry
    * @param array $row the raw data row
    * @param string:int $cellIndexByKey the map containing the string keys to the cell index within a row
    */
   public static function exctractDataEntryRaw($entryType, $row, $cellIndexByKey)
   {
      $keys = array_keys($cellIndexByKey);
      $id = $row[$cellIndexByKey[DatabaseDataModelConstants::COLUMN_NAME_ID]];
      $contextId = $row[$cellIndexByKey[DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID]];
      $contextEntryType = $row[$cellIndexByKey[DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE]];
      $data = array();

      foreach ($keys as $key)
      {
         if (($key !== DatabaseDataModelConstants::COLUMN_NAME_ID)
               && ($key !== DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID)
               && ($key !== DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE))
         {
            $data[$key] = $row[$cellIndexByKey[$key]];
         }
      }

      return new \upro\dataModel\DataEntry(new \upro\dataModel\DataEntryId($entryType, $id),
            new \upro\dataModel\DataEntryId($contextEntryType, $contextId), $data);
   }
}

}