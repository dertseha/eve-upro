<?php
require_once 'dataModel/cmd/Command.php';
require_once 'dataModel/cmd/CommandDataAccess.php';
require_once 'AbstractGroupCommand.php';

class AddGroupInterestCommand extends AbstractGroupCommand
{
   private $interestId;

   function __construct($groupId, $checked, $interestId)
   {
      parent::__construct($groupId, $checked);

      $this->interestId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $interestId);
   }

   /** {@inheritDoc} */
   public function execute(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $groupAccess = $dataAccess->getGroupAccess();
      $groupControl = $groupAccess->getGroupControl($this->getGroupId());

      $groupControl->addInterest($this->interestId);
   }
}