<?php
require_once 'Uuid.php';
require_once 'db/executor/StandardStatementExecutorFactory.php';
require_once 'dataModel/db/StandardSchemaControl.php';
require_once 'dataModel/db/DatabaseDataModelProvider.php';
require_once 'dataModel/cmd/StandardGroupAccessFactory.php';
require_once 'dataModel/cmd/NotifyingCommandDataAccess.php';

require_once 'TestEnvironment.php';
require_once 'TestNotificationConverter.php';
require_once 'GroupControlDataModelDefinition.php';
require_once 'TestUser.php';
require_once 'cmd/CreateGroupUncheckedCommand.php';
require_once 'cmd/AddGroupControlCommand.php';
require_once 'cmd/AddGroupMemberCommand.php';
require_once 'cmd/RemoveGroupMemberCommand.php';
require_once 'cmd/VerifyControlCommand.php';
require_once 'cmd/AddGroupInterestCommand.php';

class SimpleGroupControlIntegrationTest extends PHPUnit_Framework_TestCase
{
   const MODEL_NAME = 'SimpleGroupControlIntegrationTest';

   private $dataModelDefinition;

   private $usersById;

   private function ensureTableDropped(\upro\db\schema\TableControlProvider $tableControlProvider, $tableName)
   {
      if ($tableControlProvider->isTableExisting($tableName))
      {
         $tableControlProvider->dropTable($tableName);
      }
   }

   private function cleanDatabase()
   {
      $connection = TestEnvironment::getDatabaseConnection();
      $tableControlProvider = $connection->getTableControlProvider();
      $tableNames = $this->dataModelDefinition->getTableNames();

      foreach ($tableNames as $tableName)
      {
         $this->ensureTableDropped($tableControlProvider, $tableName);
      }
      $this->ensureTableDropped($tableControlProvider, \upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL);

      $connection->close();
   }

   private function createSchema()
   {
      $connection = TestEnvironment::getDatabaseConnection();
      $tableControlProvider = $connection->getTableControlProvider();
      $schemaControl = new \upro\dataModel\db\StandardSchemaControl($this->dataModelDefinition, $tableControlProvider,
            new \upro\db\executor\StandardStatementExecutorFactory($connection));

      $schemaControl->update();

      $connection->close();
   }

   private function initializeModel()
   {
      $connection = TestEnvironment::getDatabaseConnection();
      $dataModelProvider = new \upro\dataModel\db\DatabaseDataModelProvider($connection->getTransactionControl(),
            new \upro\db\executor\StandardStatementExecutorFactory($connection), $this->dataModelDefinition);

      $dataModelProvider->createDataModel(\SimpleGroupControlIntegrationTest::MODEL_NAME);

      $connection->close();
   }

   private function executeCommand(\upro\dataModel\cmd\Command $command, $userId)
   {
      $connection = TestEnvironment::getDatabaseConnection();
      $dataModelProvider = new \upro\dataModel\db\DatabaseDataModelProvider($connection->getTransactionControl(),
            new \upro\db\executor\StandardStatementExecutorFactory($connection), $this->dataModelDefinition);
      $writeContext = $dataModelProvider->getWriteContext(\SimpleGroupControlIntegrationTest::MODEL_NAME, $userId);
      $writeAccess = $writeContext->start();

      $groupAccessFactory = new \upro\dataModel\cmd\StandardGroupAccessFactory($this->dataModelDefinition->getDataModelDefinition());
      $converter = new TestNotificationConverter();
      $commandDataAccess = new \upro\dataModel\cmd\NotifyingCommandDataAccess($writeAccess, $converter, $groupAccessFactory);

      if ($writeContext->isControlGranted($command->getEntriesForControl($commandDataAccess)) &&
            $writeContext->isAccessGranted($command->getEntriesForAccess($commandDataAccess)))
      {

         try
         {
            $command->execute($commandDataAccess);
         }
         catch (\Exception $exception)
         {
            $connection->close();
            throw $exception;
         }

         $writeContext->stop();
      }
      else
      {
         $writeContext->cancel();
      }
      $connection->close();
   }

   private function readForUser($user, $lastInstanceValue)
   {
      $connection = TestEnvironment::getDatabaseConnection();
      $dataModelProvider = new \upro\dataModel\db\DatabaseDataModelProvider($connection->getTransactionControl(),
            new \upro\db\executor\StandardStatementExecutorFactory($connection), $this->dataModelDefinition);
      $readContext = $dataModelProvider->getReadContext(\SimpleGroupControlIntegrationTest::MODEL_NAME, $user->getUserId());

      $readContext->prepare();
      $readContext->readHistoryEntries($lastInstanceValue, $user);
      $readContext->unprepare();

      $connection->close();
   }

   protected function givenAGroup($groupId)
   {
      $command = new CreateGroupUncheckedCommand($groupId);

      $this->executeCommand($command, \Uuid::EMPTY_UUID);
   }

   protected function givenGroupIsInControl($controlGroupId, $groupId)
   {
      $command = new AddGroupControlCommand($controlGroupId, false, $groupId);

      $this->executeCommand($command, \Uuid::EMPTY_UUID);
   }

   protected function givenAUser($userId)
   {
      $user = new TestUser($userId);

      $this->usersById[$userId] = $user;
   }

   protected function givenUserIsInGroup($groupId, $userId)
   {
      $command = new AddGroupMemberCommand($groupId, false, $userId);

      $this->executeCommand($command, \Uuid::EMPTY_UUID);
   }

   protected function givenUserIsUpToDate($userId)
   {
      $user = $this->usersById[$userId];

      $this->readForUser($user, 0);
   }

   protected function whenUserIsInGroup($groupId, $userId)
   {
      $command = new AddGroupMemberCommand($groupId, false, $userId);

      $this->executeCommand($command, \Uuid::EMPTY_UUID);
   }

   protected function whenUserReadsTheDataModel($userId)
   {
      $user = $this->usersById[$userId];

      $this->readForUser($user, $user->getLastInstanceValue());
   }

   protected function whenUserAddsUserToGroup($groupId, $userIdManager, $userIdNew)
   {
      $command = new AddGroupMemberCommand($groupId, true, $userIdNew);

      $this->executeCommand($command, $userIdManager);
   }

   protected function whenUserRemovesUserFromGroup($groupId, $userIdManager, $userIdOld)
   {
      $command = new RemoveGroupMemberCommand($groupId, true, $userIdOld);

      $this->executeCommand($command, $userIdManager);
   }

   protected function whenUserAddsInterestToGroup($groupId, $userId, $interestId)
   {
      $command = new AddGroupInterestCommand($groupId, true, $interestId);

      $this->executeCommand($command, $userId);
   }

   protected function thenUserCanNotControlGroup($userId, $groupId)
   {
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);
      $command = new VerifyControlCommand(array($entryId));

      $this->executeCommand($command, $userId);
      $this->assertFalse($command->wasExecuted());
   }

   protected function thenUserCanControlGroup($userId, $groupId)
   {
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);
      $command = new VerifyControlCommand(array($entryId));

      $this->executeCommand($command, $userId);
      $this->assertTrue($command->wasExecuted());
   }

   protected function thenUserShouldKnowAboutGroup($userId, $groupId)
   {
      $user = $this->usersById[$userId];
      $knownEntries = $user->getKnownEntries();

      $this->assertTrue(array_key_exists($groupId, $knownEntries));
   }

   protected function thenUserShouldBeInformedAboutGroup($userId, $groupId)
   {
      $user = $this->usersById[$userId];

      $this->readForUser($user, $user->getLastInstanceValue());
      $messages = $user->getReceivedMessages();
      $expectedMessage = 'CREATE ' . new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);
      $index = array_search($expectedMessage, $messages);

      $this->assertTrue($index !== false);
   }

   protected function thenUserShouldBeInformedTimes($userId, $expected)
   {
      $user = $this->usersById[$userId];

      $this->readForUser($user, $user->getLastInstanceValue());
      $messages = $user->getReceivedMessages();

      $this->assertEquals($expected, count($messages));
   }

   public function setUp()
   {
      parent::setUp();

      if (TestEnvironment::isDatabaseAvailable())
      {
         $this->dataModelDefinition = new GroupControlDataModelDefinition();
         $this->cleanDatabase();
         $this->createSchema();
         $this->initializeModel();

         $this->usersById = array();
      }
      else
      {
         $this->markTestSkipped();
      }
   }

   public function tearDown()
   {
      if (TestEnvironment::isDatabaseAvailable())
      {
         $this->cleanDatabase();
      }

      parent::tearDown();
   }

   public function testUserCanNotControlEntry_WhenNotInGroup()
   {
      $groupId1 = \Uuid::v4();
      $userId1 = \Uuid::v4();

      $this->givenAGroup($groupId1);
      $this->givenGroupIsInControl($groupId1, $groupId1);
      $this->givenAUser($userId1);

      $this->thenUserCanNotControlGroup($userId1, $groupId1);
   }

   public function testUserCanControlEntry_WhenInGroup()
   {
      $groupId1 = \Uuid::v4();
      $userId1 = \Uuid::v4();

      $this->givenAGroup($groupId1);
      $this->givenGroupIsInControl($groupId1, $groupId1);
      $this->givenAUser($userId1);

      $this->whenUserIsInGroup($groupId1, $userId1);

      $this->thenUserCanControlGroup($userId1, $groupId1);
   }

   public function testUserCanControlEntry_WhenInvitedToGroup()
   {
      $groupId1 = \Uuid::v4();
      $userId1 = \Uuid::v4();
      $userId2 = \Uuid::v4();

      $this->givenAGroup($groupId1);
      $this->givenGroupIsInControl($groupId1, $groupId1);
      $this->givenAUser($userId1);
      $this->givenUserIsInGroup($groupId1, $userId1);
      $this->givenAUser($userId2);

      $this->whenUserAddsUserToGroup($groupId1, $userId1, $userId2);

      $this->thenUserCanControlGroup($userId2, $groupId1);
   }

   public function testUserCanNotControlEntry_WhenNotInGroupAnymore()
   {
      $groupId1 = \Uuid::v4();
      $userId1 = \Uuid::v4();
      $userId2 = \Uuid::v4();

      $this->givenAGroup($groupId1);
      $this->givenGroupIsInControl($groupId1, $groupId1);
      $this->givenAUser($userId1);
      $this->givenUserIsInGroup($groupId1, $userId1);
      $this->givenAUser($userId2);

      $this->whenUserAddsUserToGroup($groupId1, $userId1, $userId2);
      $this->whenUserRemovesUserFromGroup($groupId1, $userId1, $userId2);

      $this->thenUserCanNotControlGroup($userId2, $groupId1);
   }

   public function testUserShouldBeReset_WhenReadingTheFirstTime()
   {
      $groupId1 = \Uuid::v4();
      $userId1 = \Uuid::v4();

      $this->givenAGroup($groupId1);
      $this->givenGroupIsInControl($groupId1, $groupId1);
      $this->givenAUser($userId1);
      $this->givenUserIsInGroup($groupId1, $userId1);

      $this->whenUserReadsTheDataModel($userId1);

      $this->thenUserShouldKnowAboutGroup($userId1, $groupId1);
   }

   public function testUserShouldBeInformedAboutGroup_WhenUserIsAddedToGroup()
   {
      $groupId1 = \Uuid::v4();
      $userId1 = \Uuid::v4();
      $userId2 = \Uuid::v4();

      $this->givenAGroup($groupId1);
      $this->givenGroupIsInControl($groupId1, $groupId1);
      $this->givenAUser($userId1);
      $this->givenUserIsInGroup($groupId1, $userId1);
      $this->givenAUser($userId2);
      $this->givenUserIsUpToDate($userId2);

      $this->whenUserAddsUserToGroup($groupId1, $userId1, $userId2);

      $this->thenUserShouldBeInformedAboutGroup($userId2, $groupId1);
   }

   public function testGroupShouldBeInformedAboutInterest_WhenInterestIsAddedToGroup()
   {
      $groupId1 = \Uuid::v4();
      $groupId2 = \Uuid::v4();
      $userId1 = \Uuid::v4();

      $this->givenAGroup($groupId1);
      $this->givenGroupIsInControl($groupId1, $groupId1);
      $this->givenAUser($userId1);
      $this->givenUserIsInGroup($groupId1, $userId1);
      $this->givenUserIsUpToDate($userId1);
      $this->givenAGroup($groupId2);

      $this->whenUserAddsInterestToGroup($groupId1, $userId1, $groupId2);

      $this->thenUserShouldBeInformedAboutGroup($userId1, $groupId2);
   }

   public function testGroupShouldBeInformedOnlyAboutThisInterest_WhenInterestIsAddedToGroup()
   {
      $groupId1 = \Uuid::v4();
      $groupId2 = \Uuid::v4();
      $userId1 = \Uuid::v4();

      $this->givenAGroup($groupId1);
      $this->givenGroupIsInControl($groupId1, $groupId1);
      $this->givenAUser($userId1);
      $this->givenUserIsInGroup($groupId1, $userId1);
      $this->givenUserIsUpToDate($userId1);
      $this->givenAGroup($groupId2);

      $this->whenUserAddsInterestToGroup($groupId1, $userId1, $groupId2);

      $this->thenUserShouldBeInformedTimes($userId1, 3); // interest row, interested group row, interested group's interest
   }
}