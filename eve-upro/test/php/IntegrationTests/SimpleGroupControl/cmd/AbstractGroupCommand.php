<?php
require_once 'dataModel/cmd/Command.php';

abstract class AbstractGroupCommand implements \upro\dataModel\cmd\Command
{
   private $groupId;

   private $checked;

   function __construct($groupId, $checked)
   {
      $this->groupId = $groupId;
      $this->checked = $checked;
   }

   public function getGroupId()
   {
      return $this->groupId;
   }

   /** {@inheritDoc} */
   public function decode($data)
   {

   }

   /** {@inheritDoc} */
   public function getEntriesForControl(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $entries = array();

      if ($this->checked)
      {
         $entries[] = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $this->groupId);
      }

      return $entries;
   }

   /** {@inheritDoc} */
   public function getEntriesForAccess(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      return array();
   }
}
