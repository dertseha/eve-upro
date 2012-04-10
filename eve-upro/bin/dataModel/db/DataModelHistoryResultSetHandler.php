<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/HistoryReaderAdaptingTableRowReader.php';
require_once realpath(dirname(__FILE__)) . '/../HistoryReader.php';
require_once realpath(dirname(__FILE__)) . '/../ReadAccess.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/ResultSetHandler.php';


/**
 * A ResultSetHandler for the DataModel history
 */
class DataModelHistoryResultSetHandler implements \upro\db\executor\ResultSetHandler
{
   /**
    * Read access to be provided to the reader
    * @var \upro\dataModel\ReadAccess
    */
   private $readAccess;

   /**
    * the reader to provide data to
    * @var \upro\dataModel\HistoryReader
    */
   private $historyReader;

   /**
    * Constructor
    * @param \upro\dataModel\ReadAccess $readAccess Read access to be provided to the reader later
    * @param \upro\dataModel\HistoryReader $historyReader the reader to feed
    */
   function __construct(\upro\dataModel\ReadAccess $readAccess, \upro\dataModel\HistoryReader $historyReader)
   {
      $this->readAccess = $readAccess;
      $this->historyReader = $historyReader;
   }

   /** {@inheritDoc} */
   public function handleResultSet(\upro\db\ResultSet $resultSet)
   {
      $reader = new \upro\dataModel\db\HistoryReaderAdaptingTableRowReader($this->readAccess,
            $this->historyReader, $resultSet->getColumnsByName());

      $resultSet->read($reader);
   }
}

}