<?php
require_once 'dataModel/cmd/Command.php';
require_once 'dataModel/cmd/CommandDataAccess.php';
require_once 'AbstractGroupCommand.php';

class RemoveGroupMemberCommand extends AbstractGroupCommand
{
   private $userId;

   function __construct($groupId, $checked, $userId)
   {
      parent::__construct($groupId, $checked);

      $this->userId = $userId;
   }

   /** {@inheritDoc} */
   public function execute(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $groupAccess = $dataAccess->getGroupAccess();
      $groupControl = $groupAccess->getGroupControl($this->getGroupId());

      $groupControl->removeMember($this->userId);
   }
}