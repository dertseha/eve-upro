<?php
require_once 'dataModel/cmd/Command.php';
require_once 'dataModel/cmd/CommandDataAccess.php';

class CreateGroupUncheckedCommand implements \upro\dataModel\cmd\Command
{
   private $groupId;

   function __construct($groupId)
   {
      $this->groupId = $groupId;
   }

   /** {@inheritDoc} */
   public function decode($data)
   {

   }

   /** {@inheritDoc} */
   public function getEntriesForControl(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      return array();
   }

   /** {@inheritDoc} */
   public function getEntriesForAccess(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      return array();
   }

   /** {@inheritDoc} */
   public function execute(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $groupAccess = $dataAccess->getGroupAccess();

      $groupAccess->createGroup($this->groupId, 'TestGroup');
   }
}
