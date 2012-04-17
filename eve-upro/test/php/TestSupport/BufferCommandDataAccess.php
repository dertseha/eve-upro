<?php
require_once 'Uuid.php';
require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/DataEntry.php';
require_once 'dataModel/DataModelDefinition.php';
require_once 'dataModel/cmd/CommandDataAccess.php';
require_once 'dataModel/cmd/StandardGroupAccessFactory.php';

class BufferCommandDataAccess implements \upro\dataModel\cmd\CommandDataAccess
{
   private $groupAccessFactory;

   private $nextInstance;

   private $entryTypes;

   private $notifications;

   private $modelId;

   function __construct(\upro\dataModel\DataModelDefinition $definition)
   {
      $this->groupAccessFactory = new \upro\dataModel\cmd\StandardGroupAccessFactory($definition);

      $this->nextInstance = 10000;
      $this->entryTypes = array();
      $this->notifications = array();
      $this->modelId = \Uuid::v4();
   }

   /**
    * Creates a notification text
    * @param \upro\dataModel\DataEntryId $entryId
    * @param \upro\dataModel\DataEntryId $contextId
    */
   public function createNotification(\upro\dataModel\DataEntryId $entryId, \upro\dataModel\DataEntryId $contextId)
   {
      return $entryId->toString() . ' @' . $contextId->toString();
   }

   /**
    * @return the array of notifications
    */
   public function getNotifications()
   {
      return $this->notifications;
   }

   /** {@inheritDoc} */
   public function getGroupAccess()
   {
      return $this->groupAccessFactory->getGroupAccess($this);
   }

   /** {@inheritDoc} */
   public function getModelId()
   {
      return $this->modelId;
   }

   /** {@inheritDoc} */
   public function getNextInstanceValue()
   {
      return $this->nextInstance;
   }

   /** {@inheritDoc} */
   public function retrieveDataEntry(\upro\dataModel\DataEntryId $entryId)
   {
      $result = null;

      if ($this->doesDataEntryExist($entryId))
      {
         $result = $this->entryTypes[$entryId->getEntryType()][$entryId->getKey()];
      }

      return $result;
   }

   /** {@inheritDoc} */
   public function findDataEntries($entryType, \upro\dataModel\DataEntryId $contextId, $filter)
   {
      $result = array();

      $this->ensureDataEntryMap($entryType);
      $map = $this->entryTypes[$entryType];
      foreach ($map as $key => $entry)
      {
         if ($entry->getContextId()->equals($contextId))
         {
            $matches = true;
            $data = $entry->getData();

            foreach ($filter as $name => $value)
            {
               if (!array_key_exists($name, $data))
               {
                  $matches = false;
               }
               else if ($data[$name] !== $value)
               {
                  $matches = false;
               }
            }
            if ($matches)
            {
               $result[] = $entry;
            }
         }
      }

      return $result;
   }

   /** {@inheritDoc} */
   public function notifyDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId)
   {
      $message = $this->createNotification($entryId, $contextId);

      $this->notifications[] = $message;
      $this->nextInstance++;
   }

   /** {@inheritDoc} */
   public function createDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId)
   {
      if (!$this->doesDataEntryExist($entryId))
      {
         $this->entryTypes[$entryId->getEntryType()][$entryId->getKey()] = new \upro\dataModel\DataEntry($entryId, $contextId, $data);
         $this->nextInstance++;
      }
      else
      {
         throw new Exception('Entry already existing: ' . $entryId->toString());
      }
   }

   /** {@inheritDoc} */
   public function updateDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId)
   {
      if ($this->doesDataEntryExist($entryId))
      {
         $oldEntry = $this->entryTypes[$entryId->getEntryType()][$entryId->getKey()];

         $this->entryTypes[$entryId->getEntryType()][$entryId->getKey()] = new \upro\dataModel\DataEntry($entryId, $contextId,
               array_merge($oldEntry->getData(), $data));
      }
      $this->nextInstance++;
   }

   /** {@inheritDoc} */
   public function deleteDataEntry(\upro\dataModel\DataEntryId $entryId, \upro\dataModel\DataEntryId $contextId)
   {
      if ($this->doesDataEntryExist($entryId))
      {
         $this->entryTypes[$entryId->getEntryType()][$entryId->getKey()] = null;
      }
      $this->nextInstance++;
   }

   /**
    * Checks for existence of a data entry with given ID
    * @param \upro\dataModel\DataEntryId $entryId the ID to look for
    * @return boolean true if the entry exists
    */
   private function doesDataEntryExist(\upro\dataModel\DataEntryId $entryId)
   {
      $this->ensureDataEntryMap($entryId->getEntryType());

      $map = $this->entryTypes[$entryId->getEntryType()];

      return array_key_exists($entryId->getKey(), $map) && ($map[$entryId->getKey()] !== null);
   }

   /**
    * Ensures the map for the given entry type exists
    * @param string $entryType the entry type to look for
    */
   private function ensureDataEntryMap($entryType)
   {
      if (!array_key_exists($entryType, $this->entryTypes))
      {
         $this->entryTypes[$entryType] = array();
      }
   }
}
