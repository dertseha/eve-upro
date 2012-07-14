<?php
require_once 'dataModel/cmd/Command.php';
require_once 'dataModel/cmd/CommandDataAccess.php';

class VerifyControlCommand implements \upro\dataModel\cmd\Command
{
   private $entryIds;

   private $executed;

   function __construct($entryIds)
   {
      $this->entryIds = $entryIds;
      $this->executed = false;
   }

   public function wasExecuted()
   {
      return $this->executed;
   }

   /** {@inheritDoc} */
   public function decode($data)
   {

   }

   /** {@inheritDoc} */
   public function getEntriesForControl(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      return $this->entryIds;
   }

   /** {@inheritDoc} */
   public function getEntriesForAccess(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      return array();
   }

   /** {@inheritDoc} */
   public function execute(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $this->executed = true;
   }
}