<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../../db/TableRowReader.php';

require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../DataEntry.php';
require_once realpath(dirname(__FILE__)) . '/../DataModelReader.php';

require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';

/**
 * A TableRowReader extracting DataEntry objects for the DataModelReader
 */
class DataModelReaderAdaptingTableRowReader implements \upro\db\TableRowReader
{
   /**
    * Entry type for the entries provided to the reader
    * @var string
    */
   private $entryType;

   /**
    * the reader to provide data
    * @var \upro\dataModel\DataModelReader
    */
   private $dataModelReader;

   /**
    * @var string:int map of column names to their index
    */
   private $columnsByName;

   /**
    * Constructor
    * @param string $entryType the entry type for entries provided to the reader
    * @param \upro\dataModel\DataModelReader $dataModelReader to provide data
    * @param string:int $columnsByName map of column names to their index
    */
   function __construct($entryType, \upro\dataModel\DataModelReader $dataModelReader, $columnsByName)
   {
      $this->entryType = $entryType;
      $this->dataModelReader = $dataModelReader;
      $this->columnsByName = $columnsByName;
   }

   /** {@inheritDoc} */
   public function receive($data)
   {
      $entry = \upro\dataModel\db\DatabaseDataModelHelper::exctractDataEntryRaw($this->entryType, $data, $this->columnsByName);

      $this->dataModelReader->receiveDataEntry($entry);
   }
}

}
