<?php
require_once 'dataModel/db/DatabaseDataModelConstants.php';
require_once 'dataModel/db/DatabaseDataModelHelper.php';
require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/DataEntry.php';
require_once 'db/KeyedBufferTableRowReader.php';
require_once 'Uuid.php';

class DatabaseDataModelHelperTest extends PHPUnit_Framework_TestCase
{
   /**
    * @var \upro\db\KeyedBufferTableRowReader
    */
   private $reader;

   protected function givenAKeyedBufferTableRowReader($cellIndexByKey)
   {
      $this->reader = new \upro\db\KeyedBufferTableRowReader($cellIndexByKey);
   }

   protected function whenTheReaderContainsRow($row)
   {
      $this->reader->receive($row);
   }

   protected function thenExtractDataEntryShouldReturn($entryType, $index, $expected)
   {
      $result = \upro\dataModel\db\DatabaseDataModelHelper::extractDataEntry($entryType, $this->reader, $index);

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {
      parent::setUp();

   }

   public function testDataEntryShouldBeReturned_WhenExtractedFromSingleRow()
   {
      $cellIndexByKey = array(
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_ID => 0,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE => 1,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID => 2,
            'TestCol1' => 3, 'TestCol2' => 4);
      $entryId = new \upro\dataModel\DataEntryId('TestEntry', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('TestContext', \Uuid::v4());
      $entry = new \upro\dataModel\DataEntry($entryId, $contextId, array('TestCol1' => 'abcd', 'TestCol2' => 50));

      $this->givenAKeyedBufferTableRowReader($cellIndexByKey);

      $this->whenTheReaderContainsRow(array($entryId->getKey(), $contextId->getEntryType(), $contextId->getKey(), 'abcd', 50));

      $this->thenExtractDataEntryShouldReturn($entryId->getEntryType(), 0, $entry);
   }
}