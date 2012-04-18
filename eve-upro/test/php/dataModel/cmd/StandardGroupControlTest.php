<?php
require_once 'dataModel/cmd/StandardGroupControl.php';
require_once 'dataModel/cmd/CommandDataAccess.php';
require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/DataEntry.php';
require_once 'dataModel/DataModelConstants.php';
require_once 'dataModel/StandardDataModelDefinition.php';
require_once 'Uuid.php';

require_once 'BufferCommandDataAccess.php';

class StandardGroupControlTest extends PHPUnit_Framework_TestCase
{
   /**
    * @var \upro\dataModel\cmd\StandardGroupControl
    */
   private $control;

   private $groupId;

   /**
    * @var \upro\dataModel\DataModelDefintion
    */
   private $definition;

   /**
    * @var \upro\dataModel\cmd\CommandDataAccess
    */
   private $dataAccess;

   protected function givenARegisteredContextGroup($contextName, $entryNames)
   {
      foreach ($entryNames as $entryName)
      {
         $this->definition->registerEntryType($entryName, $contextName);
      }
   }

   protected function givenAnExistingMember($userId)
   {
      $memberData = array();
      $memberData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_FROM] = $this->dataAccess->getNextInstanceValue() - 100;
      $memberData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = null;
      $memberData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_DATA_MODEL_ID] = $this->dataAccess->getModelId();
      $memberData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID] = $userId;

      $this->dataAccess->createDataEntry(
            new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP, \Uuid::v4()),
            $memberData, $this->groupId);
   }

   protected function givenADataEntry($entryId)
   {
      $this->dataAccess->createDataEntry($entryId, array(), new \upro\dataModel\DataEntryId('Owner', \Uuid::v4()));
   }

   protected function givenADataEntryWithContext($entryId, $contextId)
   {
      $this->dataAccess->createDataEntry($entryId, array(), $contextId);
   }

   protected function givenAnActiveGroupInterest($interestId)
   {
      $this->createInterest($interestId, $this->dataAccess->getNextInstanceValue() - 100, null);
   }

   protected function givenAnActiveGroupInterestSince($interestId, $validFrom)
   {
      $this->createInterest($interestId, $validFrom, null);
   }

   protected function givenAnOldGroupInterest($interestId)
   {
      $nextValue = $this->dataAccess->getNextInstanceValue();

      $this->createInterest($interestId, $nextValue - 100, $nextValue - 1);
   }

   private function createInterest($interestId, $validFrom, $validTo)
   {
      $this->dataAccess->createDataEntry($interestId, array(), $interestId);

      $interestData = array();
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_FROM] = $validFrom;
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = $validTo;
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_DATA_MODEL_ID] = $this->dataAccess->getModelId();
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_CONTROLLED] = false;
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $interestId->getKey();
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE] = $interestId->getEntryType();

      $this->dataAccess->createDataEntry(
            new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST, \Uuid::v4()),
            $interestData, $this->groupId);
   }

   protected function whenAddingAMember($userId)
   {
      $this->control->addMember($userId);
   }

   protected function whenRemovingTheMember($userId)
   {
      $this->control->removeMember($userId);
   }

   protected function whenAddingAnInterest($contextId)
   {
      $this->control->addInterest($contextId);
   }

   protected function whenRemovingTheInterest($contextId)
   {
      $this->control->removeInterest($contextId);
   }

   protected function whenAddingControl($contextId)
   {
      $this->control->addControl($contextId);
   }

   protected function thenDataEntryHasData($entryId, $dataKey, $expectedValue)
   {
      $entry = $this->dataAccess->retrieveDataEntry($entryId);
      $entryData = $entry->getData();
      $value = $entryData[$dataKey];

      $this->assertEquals($expectedValue, $value);
   }

   protected function thenNoMembershipEntryForUserShouldBeActive($userId)
   {
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID] = $userId;
      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = null;

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP,
            $this->groupId, $data);

      $this->assertEquals(0, count($result));
   }

   protected function thenMembershipEntryShouldBeDeactivatedWithInstance($userId, $validTo)
   {
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID] = $userId;
      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = $validTo;

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP,
            $this->groupId, $data);

      $this->assertEquals(1, count($result));
   }

   protected function thenOneMembershipEntryForUserShouldBeActive($userId)
   {
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID] = $userId;
      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = null;

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP,
            $this->groupId, $data);

      $this->assertEquals(1, count($result));
   }

   protected function thenOneMembershipEntryForUserShouldBeActiveFrom($userId, $fromInstance)
   {
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID] = $userId;
      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_FROM] = $fromInstance;
      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = null;
      $data[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_DATA_MODEL_ID] = $this->dataAccess->getModelId();

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP,
            $this->groupId, $data);

      $this->assertEquals(1, count($result));
   }

   protected function thenNotificationsShouldBeForUser($userKey, $notificationIds)
   {
      $userId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_USER, $userKey);

      $this->verifyNotifications($userId, $notificationIds);
   }

   protected function thenNotificationsShouldBeForGroup($notificationIds)
   {
      $this->verifyNotifications($this->groupId, $notificationIds);
   }

   private function verifyNotifications(\upro\dataModel\DataEntryId $userId, $notificationIds)
   {
      $value = $this->dataAccess->getNotifications();
      $expectedNotifications = array();

      foreach ($notificationIds as $notificationId)
      {
         $expectedNotifications[] = $this->dataAccess->createNotification($notificationId, $userId);
      }
      $this->assertEquals($expectedNotifications, $value);
   }

   protected function thenOneInterestForEntryShouldBeActive(\upro\dataModel\DataEntryId $contextId)
   {
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE] = $contextId->getEntryType();
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $contextId->getKey();
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
            $this->groupId, $data);

      $this->assertEquals(1, count($result));
   }

   protected function thenOneInterestForEntryShouldBeActiveWithData(\upro\dataModel\DataEntryId $contextId,
         $fromInstance, $controlled)
   {
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE] = $contextId->getEntryType();
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $contextId->getKey();
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_FROM] = $fromInstance;
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_CONTROLLED] = $controlled;
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_DATA_MODEL_ID] = $this->dataAccess->getModelId();

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
            $this->groupId, $data);

      $this->assertEquals(1, count($result));
   }

   protected function thenNoInterestForEntryShouldBeActive(\upro\dataModel\DataEntryId $contextId)
   {
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE] = $contextId->getEntryType();
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $contextId->getKey();
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
            $this->groupId, $data);

      $this->assertEquals(0, count($result));
   }

   protected function thenInterestEntryShouldBeDeactivatedWithInstance(\upro\dataModel\DataEntryId $contextId, $validTo)
   {
      $data = array();

      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE] = $contextId->getEntryType();
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $contextId->getKey();
      $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = $validTo;

      $result = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
            $this->groupId, $data);

      $this->assertEquals(1, count($result));
   }

   protected function whenDestroyingGroup()
   {
      $this->control->destroyGroup();
   }

   protected function whenCreatingAGroup($groupId, $groupType)
   {
      \upro\dataModel\cmd\StandardGroupControl::createGroup($this->dataAccess, $groupId, $groupType);
   }

   public function setUp()
   {
      parent::setUp();

      $this->groupId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, \Uuid::v4());
      $this->definition = new \upro\dataModel\StandardDataModelDefinition();
      $this->dataAccess = new BufferCommandDataAccess($this->definition);

      $groupData = array();
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_GROUP_TYPE] = 'Test';
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_FROM] = $this->dataAccess->getNextInstanceValue() - 500;
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_TO] = null;
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_TO] = $this->dataAccess->getModelId();
      $this->dataAccess->createDataEntry($this->groupId, $groupData, $this->groupId);

      $this->control = new \upro\dataModel\cmd\StandardGroupControl($this->groupId, $this->definition, $this->dataAccess);
   }

   public function testMembershipExists_WhenMemberAdded()
   {
      $userId = \Uuid::v4();

      $this->whenAddingAMember($userId);

      $this->thenOneMembershipEntryForUserShouldBeActive($userId);
   }

   public function testMembershipHasProperFromInstance_WhenMemberAdded()
   {
      $userId = \Uuid::v4();
      $nextInstance = $this->dataAccess->getNextInstanceValue();

      $this->whenAddingAMember($userId);

      $this->thenOneMembershipEntryForUserShouldBeActiveFrom($userId, $nextInstance);
   }

   public function testMembershipExistsOnlyOnce_WhenMemberAddedTwice()
   {
      $userId = \Uuid::v4();

      $this->whenAddingAMember($userId);
      $this->whenAddingAMember($userId);

      $this->thenOneMembershipEntryForUserShouldBeActive($userId);
   }

   public function testNewMemberIsNotifiedOfInterest_WhenMemberAdded()
   {
      $interestId1 = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());
      $userId = \Uuid::v4();

      $this->givenARegisteredContextGroup('TestInterest', array('TestInterest'));
      $this->givenAnActiveGroupInterest($interestId1);

      $this->whenAddingAMember($userId);

      $this->thenNotificationsShouldBeForUser($userId, array($interestId1));
   }

   public function testNewMemberIsNotNotifiedOfOldInterest_WhenMemberAdded()
   {
      $interestId1 = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());
      $interestId2 = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());
      $userId = \Uuid::v4();

      $this->givenARegisteredContextGroup('TestInterest', array('TestInterest'));
      $this->givenAnActiveGroupInterest($interestId1);
      $this->givenAnOldGroupInterest($interestId2);

      $this->whenAddingAMember($userId);

      $this->thenNotificationsShouldBeForUser($userId, array($interestId1));
   }

   public function testNoMembershipExists_WhenMemberRemoved()
   {
      $userId = \Uuid::v4();

      $this->givenAnExistingMember($userId);

      $this->whenRemovingTheMember($userId);

      $this->thenNoMembershipEntryForUserShouldBeActive($userId);
   }

   public function testInterestExists_WhenInterestAdded()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());

      $this->givenADataEntry($entryId);

      $this->whenAddingAnInterest($entryId);

      $this->thenOneInterestForEntryShouldBeActive($entryId);
   }

   public function testInterestExistsOnlyOnce_WhenInterestAddedTwice()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());

      $this->givenADataEntry($entryId);

      $this->whenAddingAnInterest($entryId);
      $this->whenAddingAnInterest($entryId);

      $this->thenOneInterestForEntryShouldBeActive($entryId);
   }

   public function testInterestExistsWithValidData_WhenInterestAdded()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());
      $nextInstance = null;

      $this->givenADataEntry($entryId);

      $nextInstance = $this->dataAccess->getNextInstanceValue();
      $this->whenAddingAnInterest($entryId);

      $this->thenOneInterestForEntryShouldBeActiveWithData($entryId, $nextInstance, false);
   }

   public function testGroupIsNotifiedOfNewInterest_WhenInterestAdded()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());

      $this->givenARegisteredContextGroup('TestInterest', array('TestInterest'));
      $this->givenADataEntryWithContext($entryId, $entryId);

      $this->whenAddingAnInterest($entryId);

      $this->thenNotificationsShouldBeForGroup(array($entryId));
   }

   public function testGroupIsNotifiedOfNewInterestAndRelated_WhenInterestAdded()
   {
      $entryId1 = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());
      $entryId2 = new \upro\dataModel\DataEntryId('TestInterestSub', \Uuid::v4());

      $this->givenARegisteredContextGroup('TestInterest', array('TestInterest', 'TestInterestSub'));
      $this->givenADataEntryWithContext($entryId1, $entryId1);
      $this->givenADataEntryWithContext($entryId2, $entryId1);

      $this->whenAddingAnInterest($entryId1);

      $this->thenNotificationsShouldBeForGroup(array($entryId1, $entryId2));
   }

   public function testNoInterestExists_WhenInterestRemoved()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());

      $this->givenAnActiveGroupInterest($entryId);

      $this->whenRemovingTheInterest($entryId);

      $this->thenNoInterestForEntryShouldBeActive($entryId);
   }

   public function testInterestExists_WhenControlAdded()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestProperty', \Uuid::v4());

      $this->givenADataEntry($entryId);

      $this->whenAddingControl($entryId);

      $this->thenOneInterestForEntryShouldBeActive($entryId);
   }

   public function testInterestExistsOnlyOnce_WhenControlAddedTwice()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestProperty', \Uuid::v4());

      $this->givenADataEntry($entryId);

      $this->whenAddingControl($entryId);
      $this->whenAddingControl($entryId);

      $this->thenOneInterestForEntryShouldBeActive($entryId);
   }

   public function testInterestExistsWithValidData_WhenControlAdded()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestProperty', \Uuid::v4());
      $nextInstance = null;

      $this->givenADataEntry($entryId);

      $nextInstance = $this->dataAccess->getNextInstanceValue();
      $this->whenAddingControl($entryId);

      $this->thenOneInterestForEntryShouldBeActiveWithData($entryId, $nextInstance, true);
   }

   public function testInterestExistsWithValidData_WhenInterestChangedToControl()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestProperty', \Uuid::v4());
      $validFrom = $this->dataAccess->getNextInstanceValue() - 100;

      $this->givenAnActiveGroupInterestSince($entryId, $validFrom);

      $this->whenAddingControl($entryId);

      $this->thenOneInterestForEntryShouldBeActiveWithData($entryId, $validFrom, true);
   }

   public function testGroupIsNotValidAnymore_WhenDestroyed()
   {
      $validToInstance = $this->dataAccess->getNextInstanceValue();

      $this->whenDestroyingGroup();

      $this->thenDataEntryHasData($this->groupId, \upro\dataModel\DataModelConstants::GROUP_DATA_VALID_TO, $validToInstance);
   }

   public function testMembershipsAreNotValidAnymore_WhenDestroyed()
   {
      $userId = \Uuid::v4();

      $this->givenAnExistingMember($userId);

      $this->whenDestroyingGroup();

      $this->thenNoMembershipEntryForUserShouldBeActive($userId);
   }

   public function testMembershipTerminatedWithSameInstance_WhenDestroyed()
   {
      $userId = \Uuid::v4();

      $this->givenAnExistingMember($userId);

      $validToInstance = $this->dataAccess->getNextInstanceValue();
      $this->whenDestroyingGroup();

      $this->thenMembershipEntryShouldBeDeactivatedWithInstance($userId, $validToInstance);
   }

   public function testInterestsAreNotValidAnymore_WhenDestroyed()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());

      $this->givenAnActiveGroupInterest($entryId);

      $this->whenDestroyingGroup();

      $this->thenNoInterestForEntryShouldBeActive($entryId);
   }

   public function testInterestsTerminatedWithSameInstance_WhenDestroyed()
   {
      $entryId = new \upro\dataModel\DataEntryId('TestInterest', \Uuid::v4());

      $this->givenAnActiveGroupInterest($entryId);

      $validToInstance = $this->dataAccess->getNextInstanceValue();
      $this->whenDestroyingGroup();

      $this->thenInterestEntryShouldBeDeactivatedWithInstance($entryId, $validToInstance);
   }

   public function testGroupExists_WhenCreated()
   {
      $groupId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, \Uuid::v4());
      $groupType = 'TestType';

      $this->whenCreatingAGroup($groupId, $groupType);

      $this->thenDataEntryHasData($groupId, \upro\dataModel\DataModelConstants::GROUP_DATA_GROUP_TYPE, $groupType);
   }
}
