<?php
require_once 'dataModel/cmd/StandardGroupControl.php';
require_once 'dataModel/cmd/StandardGroupAccess.php';
require_once 'dataModel/cmd/CommandDataAccess.php';
require_once 'dataModel/cmd/SetupAdminTitleCommand.php';
require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/DataEntry.php';
require_once 'dataModel/DataModelConstants.php';
require_once 'Uuid.php';

require_once 'TestEnvironment.php';

class SetupAdminTitleCommandTest extends PHPUnit_Framework_TestCase
{
   private $dataModelId;

   private $dataAccess;

   private $groupAccess;

   private $groupControl;

   protected function givenExistingAdminTitleGroup()
   {
      $groupId = \upro\dataModel\cmd\CommandHelper::getAdminTitleGroupId($this->dataModelId);

      $this->groupAccess->expects($this->once())->method('getGroupControl')
            ->with($groupId)->will($this->returnValue($this->groupControl));
   }

   protected function whenExecutingCommand()
   {
      $command = new \upro\dataModel\cmd\SetupAdminTitleCommand();

      $command->execute($this->dataAccess);
   }

   protected function expectingAdminTitleGroupCreated()
   {
      $groupType = \upro\dataModel\DataModelConstants::GROUP_TYPE_TITLE;
      $groupId = \upro\dataModel\cmd\CommandHelper::getAdminTitleGroupId($this->dataModelId);

      $this->groupAccess->expects($this->once())->method('createGroup')
            ->with($groupId, $groupType)->will($this->returnValue($this->groupControl));
   }

   protected function expectingAdminTitleGroupControllingItself()
   {
      $groupId = \upro\dataModel\cmd\CommandHelper::getAdminTitleGroupId($this->dataModelId);
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);

      $this->groupControl->expects($this->at(0))->method('addControl')
            ->with($entryId);
   }

   protected function expectingRoleCreated($roleName)
   {
      $roleId = \upro\dataModel\cmd\CommandHelper::getDerivedKey($this->dataModelId, $roleName);
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_ROLE, $roleId);
      $data = array();

      $data[\upro\dataModel\DataModelConstants::ROLE_DATA_NAME] = $roleName;

      $this->dataAccess->expects($this->at(5))->method('createDataEntry')
            ->with($entryId, $data, $entryId);
   }

   protected function expectingRoleControlled($roleName)
   {
      $roleId = \upro\dataModel\cmd\CommandHelper::getDerivedKey($this->dataModelId, $roleName);
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_ROLE, $roleId);

      $this->groupControl->expects($this->at(0))->method('addControl')
            ->with($entryId);
   }

   public function setUp()
   {
      parent::setUp();

      TestEnvironment::initLogging($this->getName());

      $this->groupControl = $this->getMock('\upro\dataModel\GroupControl');
      $this->groupAccess = $this->getMock('\upro\dataModel\GroupAccess');

      $this->dataModelId = \Uuid::v4();
      $this->dataAccess = $this->getMock('\upro\dataModel\cmd\CommandDataAccess');
      $this->dataAccess->expects($this->any())->method('getGroupAccess')->will($this->returnValue($this->groupAccess));
      $this->dataAccess->expects($this->any())->method('getModelId')->will($this->returnValue($this->dataModelId));
   }

   public function testAdminTitleGroupShouldBeCreated_WhenGroupNotExisting()
   {
      $this->expectingAdminTitleGroupCreated();

      $this->whenExecutingCommand();
   }
/* TODO is this really necessary?
   public function testAdminTitleGroupShouldBeCreatedWithOwnControl_WhenGroupNotExisting()
   {
      $this->expectingAdminTitleGroupCreated();
      $this->expectingAdminTitleGroupControllingItself();

      $this->whenExecutingCommand();
   }
*/
   public function testRoleShouldBeCreated_WhenRoleMissing()
   {
      $this->givenExistingAdminTitleGroup();
      $this->expectingRoleCreated(\upro\dataModel\DataModelConstants::ROLE_NAME_CREATE_TITLE);

      $this->whenExecutingCommand();
   }

   public function testRoleShouldBeControlled()
   {
      $this->givenExistingAdminTitleGroup();
      $this->expectingRoleControlled(\upro\dataModel\DataModelConstants::ROLE_NAME_CREATE_TITLE);

      $this->whenExecutingCommand();
   }
}