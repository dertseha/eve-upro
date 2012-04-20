<?php
require_once 'dataModel/cmd/Command.php';
require_once 'dataModel/cmd/CommandDataAccess.php';
require_once 'AbstractGroupCommand.php';

class AddGroupControlCommand extends AbstractGroupCommand
{
   private $controlledGroupId;

   function __construct($groupId, $checked, $controlledGroupId)
   {
      parent::__construct($groupId, $checked);

      $this->controlledGroupId = $controlledGroupId;
   }

   /** {@inheritDoc} */
   public function execute(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $groupAccess = $dataAccess->getGroupAccess();
      $groupControl = $groupAccess->getGroupControl($this->getGroupId());

      $groupControl->addControl(new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP,
            $this->controlledGroupId));
   }
}
