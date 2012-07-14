<?php
require_once 'dataModel/cmd/StandardGroupControl.php';
require_once 'dataModel/cmd/StandardGroupAccess.php';
require_once 'dataModel/cmd/CommandDataAccess.php';
require_once 'dataModel/cmd/MakeUserAdminCommand.php';
require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/DataEntry.php';
require_once 'dataModel/DataModelConstants.php';
require_once 'Uuid.php';

require_once 'TestEnvironment.php';

class MakeUserAdminCommandTest extends PHPUnit_Framework_TestCase
{
   private $dataModelId;

   private $dataAccess;

   private $groupAccess;

   private $groupControl;

   protected function givenExistingAdminTitle()
   {
      $groupId = \upro\dataModel\cmd\CommandHelper::getAdminTitleGroupId($this->dataModelId);

      $this->groupAccess->expects($this->once())->method('getGroupControl')
            ->with($groupId)->will($this->returnValue($this->groupControl));
   }

   protected function givenExistingUser($entryId, $userName)
   {
      $contextId = new \upro\dataModel\DataEntryId('DataModel', $this->dataModelId);
      $dataEntry = new \upro\dataModel\DataEntry($entryId, $contextId, array());

      $this->dataAccess->expects($this->any())->method('findDataEntries')
            ->with(\upro\dataModel\DataModelConstants::ENTRY_TYPE_USER, $contextId,
                  array(\upro\dataModel\DataModelConstants::USER_DATA_NAME => $userName))
            ->will($this->returnValue(array($dataEntry)));
   }

   protected function whenExecutingCommand($userName)
   {
      $command = new \upro\dataModel\cmd\MakeUserAdminCommand($userName);

      $command->execute($this->dataAccess);
   }

   protected function expectingMembership($entryId)
   {
      $this->groupControl->expects($this->once())->method('addMember')->with($entryId);
   }

   protected function expectingNoMember()
   {
      $this->groupControl->expects($this->never())->method('addMember');
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

   public function testNothingShouldHappen_WhenGroupExistingAndNoUser()
   {
      $this->givenExistingAdminTitle();

      $this->expectingNoMember();

      $this->whenExecutingCommand('UnknownUser');
   }

   public function testMemberShouldBeAdded_WhenGroupExistingAndKnownUser()
   {
      $userName = 'Test User';
      $userId = \Uuid::v4();
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_USER, $userId);

      $this->givenExistingAdminTitle();
      $this->givenExistingUser($entryId, $userName);

      $this->expectingMembership($userId);

      $this->whenExecutingCommand($userName);
   }
}