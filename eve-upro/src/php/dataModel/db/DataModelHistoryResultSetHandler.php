<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/HistoryReaderAdaptingTableRowReader.php';
require_once realpath(dirname(__FILE__)) . '/../HistoryReader.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/ResultSetHandler.php';


/**
 * A ResultSetHandler for the DataModel history
 */
class DataModelHistoryResultSetHandler implements \upro\db\executor\ResultSetHandler
{
   /**
    * @var \upro\dataModel\HistoryReader the reader to provide data to
    */
   private $historyReader;

   /**
    * Constructor
    */
   function __construct(\upro\dataModel\HistoryReader $historyReader)
   {
      $this->historyReader = $historyReader;
   }

   /** {@inheritDoc} */
   public function handleResultSet(\upro\db\ResultSet $resultSet)
   {
      $reader = new \upro\dataModel\db\HistoryReaderAdaptingTableRowReader($this->historyReader, $resultSet->getColumnsByName());

      $resultSet->read($reader);
   }
}

}