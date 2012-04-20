<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/../DataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/../DataModelDefinition.php';
require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../DataEntry.php';
require_once realpath(dirname(__FILE__)) . '/../GroupControl.php';
require_once realpath(dirname(__FILE__)) . '/CommandDataAccess.php';

/**
 * A standard group control implementation, based on access from CommandDataAccess
 */
class StandardGroupControl implements \upro\dataModel\GroupControl
{
   /**
    * The definition of the data model
    * @var \upro\dataModel\DataModelDefinition
    */
   private $definition;

   /**
    * @var \upro\dataModel\cmd\CommandDataAccess
    */
   private $dataAccess;

   /**
    * ID of the controlled group
    * @var \upro\dataModel\DataEntryId
    */
   private $groupId;

   /**
    * Constructor
    * @param \upro\dataModel\DataEntryId $groupId ID of the controlled group
    * @param \upro\dataModel\DataModelDefinition $dataModelDefinition the definition of the data model
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess data access to work with
    */
   function __construct(\upro\dataModel\DataEntryId $groupId, \upro\dataModel\DataModelDefinition $dataModelDefinition,
         \upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $this->groupId = $groupId;
      $this->definition = $dataModelDefinition;
      $this->dataAccess = $dataAccess;
   }

   /**
    * Creates a basic standard group
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess data access to work with
    * @param \upro\dataModel\DataEntryId $groupId group UUID
    * @param string $groupType some descriptive type string
    */
   public static function createGroup(\upro\dataModel\cmd\CommandDataAccess $dataAccess, $groupId, $groupType)
   {
      $validFrom = $dataAccess->getNextInstanceValue();
      $groupData = array();

      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_FROM] = $validFrom;
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_TO] = null;
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_DATA_MODEL_ID] = $dataAccess->getModelId();
      $groupData[\upro\dataModel\DataModelConstants::GROUP_DATA_GROUP_TYPE] = $groupType;
      $dataAccess->createDataEntry($groupId, $groupData, $groupId);
   }

   /** {@inheritDoc} */
   public function destroyGroup()
   {
      $validTo = $this->dataAccess->getNextInstanceValue();

      {  // close group itself. Set first enables the permission checker/notifier to know first hand
         $updateData = array();

         $updateData[\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_TO] = $validTo;
         $this->dataAccess->updateDataEntry($this->groupId, $updateData, $this->groupId);
      }
      {  // drop all members
         $filter = array();

         $filter[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = null;
         $this->removeMembersByFilter($filter, $validTo);
      }
      {  // drop all interest
         $filter = array();

         $filter[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;
         $interests = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
               $this->groupId, $filter);
         $this->removeInterests($interests, $validTo);
      }
   }


   /** {@inheritDoc} */
   public function addMember($userId)
   {
      $entryType = \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP;
      $membershipData = array();

      $membershipData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID] = $userId;
      $membershipData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = null;
      $membershipData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_DATA_MODEL_ID] = $this->dataAccess->getModelId();
      if (count($this->dataAccess->findDataEntries($entryType, $this->groupId, $membershipData)) == 0)
      {
         $entryId = new \upro\dataModel\DataEntryId($entryType, \Uuid::v4());

         $membershipData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_FROM] =
               $this->dataAccess->getNextInstanceValue();
         $this->dataAccess->createDataEntry($entryId, $membershipData, $this->groupId);

         $this->notifyActiveInterest(new \upro\dataModel\DataEntryId(
               \upro\dataModel\DataModelConstants::ENTRY_TYPE_USER, $userId));
      }
   }


   /** {@inheritDoc} */
   public function removeMember($userId)
   {
      $filter = array();

      $filter[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID] = $userId;
      $filter[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = null;

      $this->removeMembersByFilter($filter, $this->dataAccess->getNextInstanceValue());
   }


   /** {@inheritDoc} */
   public function addInterest(\upro\dataModel\DataEntryId $contextId)
   {
      $entryType = \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST;
      $interestData = array();

      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE] = $contextId->getEntryType();
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $contextId->getKey();
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_DATA_MODEL_ID] = $this->dataAccess->getModelId();
      if (count($this->dataAccess->findDataEntries($entryType, $this->groupId, $interestData)) == 0)
      {
         $this->createAndNotifyInterestEntry($interestData, false, $contextId);
      }
   }


   /** {@inheritDoc} */
   public function addControl(\upro\dataModel\DataEntryId $contextId)
   {
      $interests = $this->findActiveInterestsForSpecificEntry($contextId);

      if (count($interests) > 0)
      {
         $updateData = array();

         $updateData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_CONTROLLED] = true;
         foreach ($interests as $interest)
         {
            $this->dataAccess->updateDataEntry($interest->getId(), $updateData, $this->groupId);
         }
      }
      else
      {
         $interestData = array();

         $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE] = $contextId->getEntryType();
         $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $contextId->getKey();
         $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;
         $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_DATA_MODEL_ID] = $this->dataAccess->getModelId();
         $this->createAndNotifyInterestEntry($interestData, true, $contextId);
      }
   }


   /** {@inheritDoc} */
   public function removeInterest(\upro\dataModel\DataEntryId $contextId)
   {
      $interests = $this->findActiveInterestsForSpecificEntry($contextId);

      if (count($interests) > 0)
      {
         $this->removeInterests($interests, $this->dataAccess->getNextInstanceValue());
      }
   }

   /**
    * Removes all members that match given filter
    * @param string:string $filter map to use for searching members
    * @param int $validTo the valid-to value to set
    */
   private function removeMembersByFilter($filter, $validTo)
   {
      $members = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP,
            $this->groupId, $filter);

      if (count($members) > 0)
      {
         $updateData = array();

         $updateData[\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO] = $validTo;
         foreach ($members as $member)
         {
            $this->dataAccess->updateDataEntry($member->getId(), $updateData, $this->groupId);
         }
      }
   }

   /**
    * Removes all interests given in the list
    * @param array $interests to remove
    * @param int $validTo the valid-to value to set
    */
   private function removeInterests($interests, $validTo)
   {
      $updateData = array();

      $updateData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = $validTo;
      foreach ($interests as $interest)
      {
         $this->dataAccess->updateDataEntry($interest->getId(), $updateData, $this->groupId);
      }
   }

   /**
    * Finds any active interests for a specific entry
    * @param \upro\dataModel\DataEntryId  $entryId the interest to look for
    */
   private function findActiveInterestsForSpecificEntry(\upro\dataModel\DataEntryId $entryId)
   {
      $entryType = \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST;
      $interestData = array();

      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE] = $entryId->getEntryType();
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID] = $entryId->getKey();
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;

      return $this->dataAccess->findDataEntries($entryType, $this->groupId, $interestData);
   }

   /**
    * Creates a new interest entry and notifies the group of its data
    * @param string:mixed $interestData initialized basic interest data
    * @param boolean $controlled whether the interest is controlled or not
    * @param \upro\dataModel\DataEntryId $contextId The ID of the interest context
    */
   private function createAndNotifyInterestEntry($interestData, $controlled, $contextId)
   {
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST, \Uuid::v4());

      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_FROM] =
            $this->dataAccess->getNextInstanceValue();
      $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_CONTROLLED] = $controlled;
      $this->dataAccess->createDataEntry($entryId, $interestData, $this->groupId);

      $this->notifyContextData($contextId, $this->groupId);
   }

   /**
    * Notifies all the currently active interests and uses the given context ID
    * @param \upro\dataModel\DataEntryId $contextId the context ID to use for the notifications
    */
   private function notifyActiveInterest(\upro\dataModel\DataEntryId $contextId)
   {
      $interestFilter = array();

      $interestFilter[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO] = null;

      $interests = $this->dataAccess->findDataEntries(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
            $this->groupId, $interestFilter);
      foreach ($interests as $interestEntry)
      {
         $interestData = $interestEntry->getData();
         $interestId = new \upro\dataModel\DataEntryId(
               $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE],
               $interestData[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID]);

         $this->notifyContextData($interestId, $contextId);
      }
   }

   /**
    * Notifies all data that is related to a given context ID and notifies a specific notification context ID
    * @param \upro\dataModel\DataEntryId $contextId the context ID to use to search data entries
    * @param \upro\dataModel\DataEntryId $notificationContextId the ID to use as 'context' for notifications
    */
   private function notifyContextData(\upro\dataModel\DataEntryId $contextId,
         \upro\dataModel\DataEntryId $notificationContextId)
   {
      $entryTypes = $this->definition->getEntryTypesForContext($contextId->getEntryType());

      foreach ($entryTypes as $entryType)
      {
         $references = $this->dataAccess->findDataEntries($entryType, $contextId, array());

         foreach ($references as $reference)
         {
            $this->dataAccess->notifyDataEntry($reference->getId(), $reference->getData(), $notificationContextId);
         }
      }
   }

}

}