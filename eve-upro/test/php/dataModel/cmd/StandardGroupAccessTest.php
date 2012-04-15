<?php
require_once 'dataModel/cmd/StandardGroupControl.php';
require_once 'dataModel/cmd/StandardGroupAccess.php';
require_once 'dataModel/cmd/CommandDataAccess.php';
require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/DataEntry.php';
require_once 'dataModel/DataModelConstants.php';
require_once 'dataModel/CoreDataModelDefinition.php';
require_once 'Uuid.php';

require_once 'BufferCommandDataAccess.php';

class StandardGroupAccessTest extends PHPUnit_Framework_TestCase
{
   /**
    * @var \upro\dataModel\DataModelDefintion
    */
   private $definition;

   /**
    * @var \upro\dataModel\cmd\CommandDataAccess
    */
   private $dataAccess;

   private $control;

   private $groupAccess;

   protected function givenAnExistingGroup($groupId, $groupType)
   {
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);
      $groupData = array();

      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_GROUP_TYPE] = $groupType;
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_FROM] = $this->dataAccess->getNextInstanceValue() - 500;
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_TO] = null;
      $this->dataAccess->createDataEntry($entryId, $groupData, $entryId);
   }

   protected function whenRetrievingGroupControl($groupId)
   {
      $this->control = $this->groupAccess->getGroupControl($groupId);
   }

   protected function whenCallingCreateGroup($groupId, $groupType)
   {
      $this->control = $this->groupAccess->createGroup($groupId, $groupType);
   }

   protected function thenControlIsValid()
   {
      $this->assertNotNull($this->control);
   }

   protected function thenControlIsNull()
   {
      $this->assertNull($this->control);
   }

   protected function thenGroupExists($groupId)
   {
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);
      $entry = $this->dataAccess->retrieveDataEntry($entryId);

      $this->assertNotNull($entry);
   }

   protected function thenGroupHasInterestInItself($groupId)
   {
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $groupId;
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
            $entryId, $data);

      $this->assertEquals(1, count($result));
   }

   public function setUp()
   {
      parent::setUp();

      $this->definition = new \upro\dataModel\CoreDataModelDefinition();
      $this->dataAccess = new BufferCommandDataAccess($this->definition);
      $this->groupAccess = new \upro\dataModel\cmd\StandardGroupAccess($this->definition, $this->dataAccess);
   }

   public function testGroupCreated_WhenCreatingNonExisting()
   {
      $groupId = \Uuid::v4();

      $this->whenCallingCreateGroup($groupId, 'TestType');

      $this->thenGroupExists($groupId);
   }

   public function testGroupHasOwnInterest_WhenCreatingNonExisting()
   {
      $groupId = \Uuid::v4();

      $this->whenCallingCreateGroup($groupId, 'TestType');

      $this->thenGroupHasInterestInItself($groupId);
   }

   public function testGroupControlReturned_WhenCreatingNonExisting()
   {
      $groupId = \Uuid::v4();

      $this->whenCallingCreateGroup($groupId, 'TestType');

      $this->thenControlIsValid();
   }

   public function testNoGroupControlReturned_WhenCreatingExisting()
   {
      $groupId = \Uuid::v4();

      $this->givenAnExistingGroup($groupId, 'SomeType');

      $this->whenCallingCreateGroup($groupId, 'TestType');

      $this->thenControlIsNull();
   }

   public function testNoGroupControlReturned_WhenRetrievingNonExisting()
   {
      $groupId = \Uuid::v4();

      $this->whenRetrievingGroupControl($groupId);

      $this->thenControlIsNull();
   }

   public function testGroupControlReturned_WhenRetrievingExisting()
   {
      $groupId = \Uuid::v4();

      $this->givenAnExistingGroup($groupId, 'SomeType');

      $this->whenRetrievingGroupControl($groupId);

      $this->thenControlIsValid();
   }
}