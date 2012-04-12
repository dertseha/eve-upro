<?php
namespace upro\dataModel\db
{

/**
 * A container class providing various constants for the database data model
 */
class DatabaseDataModelConstants
{
   /**
    * Amount of recent entries in the change history for a data model
    * @var int
    */
   const CHANGE_HISTORY_ENTRY_LIMIT = 500;

   /**
    * Typical ID column
    * @var string
    */
   const COLUMN_NAME_ID = 'id';

   /**
    * Typical context entry type column
    * @var string
    */
   const COLUMN_NAME_CONTEXT_ENTRY_TYPE = 'contextEntryType';

   /**
    * Typical context ID column
    * @var string
    */
   const COLUMN_NAME_CONTEXT_ID = 'contextId';

   const TABLE_NAME_DATA_MODEL = 'DataModels';
   const COLUMN_NAME_DATA_MODEL_NAME = 'name';
   const COLUMN_NAME_DATA_MODEL_INSTANCE = 'instance';

   const TABLE_NAME_DATA_MODEL_CHANGE_HISTORY = 'DataModelChangeHistory';
   const COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_ID = 'dataModelId';
   const COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE = 'dataModelInstance';
   const COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ENTRY_TYPE = 'contextEntryType';
   const COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ID = 'contextId';
   const COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_MESSAGE = 'message';

   /**
    * @return array of strings containing the basic model
    */
   public static function getBasicTableNames()
   {
      $result = array(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL,
            DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL_CHANGE_HISTORY);

      return $result;
   }
}

}