<?php
require_once 'dataModel/HistoryReader.php';
require_once 'dataModel/DataModelReader.php';

class TestUser implements \upro\dataModel\HistoryReader, \upro\dataModel\DataModelReader
{
   private $userId;

   private $entryId;

   private $receivedMessages;

   private $knownEntries;

   function __construct($userId)
   {
      $this->userId = $userId;
      $this->entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_USER, $userId);

      $this->receivedMessages = array();
      $this->knownEntries = array();
      $this->lastInstance = 0;
   }

   public function getUserId()
   {
      return $this->userId;
   }

   public function getLastInstanceValue()
   {
      return $this->lastInstance;
   }

   public function getReceivedMessages()
   {
      return $this->receivedMessages;
   }

   public function getKnownEntries()
   {
      return $this->knownEntries;
   }

   public function receiveDataEntry(\upro\dataModel\DataEntry $dataEntry)
   {
      if ($this->readAccess->isAccessGranted($dataEntry->getContextId(), $this->lastInstance))
      {
         $this->knownEntries[$dataEntry->getId()->getKey()] = $dataEntry;
      }
   }

   public function reset(\upro\dataModel\ReadAccess $readAccess)
   {
      $this->receivedMessages = array();
      $this->knownEntries = array();
      $this->lastInstance = $readAccess->getCurrentInstanceValue();

      $this->readAccess = $readAccess; // small hack here
      $readAccess->readDataModel($this);
      $this->readAccess = null;
   }

   public function receive(\upro\dataModel\ReadAccess $readAccess, $instanceValue, $message, $contextId)
   {
      //echo 'Informed about: ' . $message. " - context " . $contextId . "\n";
      if ($this->isContextUserItself($contextId) || $readAccess->isAccessGranted($contextId, $instanceValue))
      {
         $this->receivedMessages[] = $message;
      }
      $this->lastInstance = $instanceValue;
   }

   private function isContextUserItself(\upro\dataModel\DataEntryId $contextId)
   {
      return $contextId->equals($this->entryId);
   }
}
