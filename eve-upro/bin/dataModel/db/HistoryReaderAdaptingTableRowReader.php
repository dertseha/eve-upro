<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';

require_once realpath(dirname(__FILE__)) . '/../HistoryReader.php';
require_once realpath(dirname(__FILE__)) . '/../../db/TableRowReader.php';

/**
 * A TableRowReader mapping rows of the result set to a HistoryReader
 */
class HistoryReaderAdaptingTableRowReader implements \upro\db\TableRowReader
{
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
    * @param \upro\dataModel\HistoryReader $historyReader to provide data
    * @param string:int $columnsByName map of column names to their index
    */
   function __construct(\upro\dataModel\HistoryReader $historyReader, $columnsByName)
   {
      $this->historyReader = $historyReader;
      $this->columnsByName = $columnsByName;
   }

   /** {@inheritDoc} */
   public function receive($data)
   {
      $dataModelInstance = $data[$this->columnsByName[\upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE]];
      $contextId = $data[$this->columnsByName[\upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ID]];
      $message = $data[$this->columnsByName[\upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_MESSAGE]];

      $this->historyReader->receive($dataModelInstance, $message, $contextId);
   }
}

}
