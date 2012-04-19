<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../../db/executor/ResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../DataModelReader.php';
require_once realpath(dirname(__FILE__)) . '/DataModelReaderAdaptingTableRowReader.php';


/**
 * A ResultSetHandler for entries from the data model
 */
class DataModelEntryResultSetHandler implements \upro\db\executor\ResultSetHandler
{
   /**
    * Entry type of the entries for the reader
    * @var string
    */
   private $entryType;

   /**
    * the reader to provide data to
    * @var \upro\dataModel\DataModelReader
    */
   private $dataModelReader;

   /**
    * Constructor
    * @param string $entryType entry type of the entries
    * @param \upro\dataModel\DataModelReader $dataModelReader the reader to feed
    */
   function __construct($entryType, \upro\dataModel\DataModelReader $dataModelReader)
   {
      $this->entryType = $entryType;
      $this->dataModelReader = $dataModelReader;
   }

   /** {@inheritDoc} */
   public function handleResultSet(\upro\db\ResultSet $resultSet)
   {
      $reader = new \upro\dataModel\db\DataModelReaderAdaptingTableRowReader($this->entryType,
            $this->dataModelReader, $resultSet->getColumnsByName());

      $resultSet->read($reader);
   }
}

}