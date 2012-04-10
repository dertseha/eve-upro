<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';

require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../HistoryReader.php';
require_once realpath(dirname(__FILE__)) . '/../../db/TableRowReader.php';

/**
 * A TableRowReader mapping rows of the result set to a HistoryReader
 */
class HistoryReaderAdaptingTableRowReader implements \upro\db\TableRowReader
{
   /**
    * Read access to be provided to the history reader
    * @var \upro\dataModel\ReadAccess
    */
   private $readAccess;

   /**
    * @var \upro\dataModel\HistoryReader the reader to provide data
    */
   private $historyReader;

   /**
    * @var string:int map of column names to their index
    */
   private $columnsByName;

   /**
    * Constructor
    * @param \upro\dataModel\ReadAccess $readAccess Read access to be provided to the reader later
    * @param \upro\dataModel\HistoryReader $historyReader to provide data
    * @param string:int $columnsByName map of column names to their index
    */
   function __construct(\upro\dataModel\ReadAccess $readAccess, \upro\dataModel\HistoryReader $historyReader, $columnsByName)
   {
      $this->readAccess = $readAccess;
      $this->historyReader = $historyReader;
      $this->columnsByName = $columnsByName;
   }

   /** {@inheritDoc} */
   public function receive($data)
   {
      $dataModelInstance = $data[$this->columnsByName[\upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE]];
      $contextEntryType = $data[$this->columnsByName[\upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ENTRY_TYPE]];
      $contextId = $data[$this->columnsByName[\upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ID]];
      $message = $data[$this->columnsByName[\upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_MESSAGE]];
      $entryId = new \upro\dataModel\DataEntryId($contextEntryType, $contextId);

      $this->historyReader->receive($this->readAccess, $dataModelInstance, $message, $entryId);
   }
}

}
