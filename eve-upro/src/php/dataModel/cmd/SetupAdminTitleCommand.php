<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/../../util/logging/LoggerProvider.php';
require_once realpath(dirname(__FILE__)) . '/Command.php';
require_once realpath(dirname(__FILE__)) . '/CommandHelper.php';

/**
 * Sets up an admin title.
 * Ensures the title and its group exists
 * Creates all missing roles
 */
class SetupAdminTitleCommand implements \upro\dataModel\cmd\Command
{

   function __construct()
   {

   }

   /**
    * @return \upro\util\logging\Logger the logger for this class
    */
   private function getLogger()
   {
      return \upro\util\logging\LoggerProvider::getLogger(get_class());
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
      $groupControl = $this->ensureAdminTitleGroup($dataAccess);

      $this->ensureRolesCreatedAndControlled($dataAccess, $groupControl);
   }

   /**
    * Ensures existence of a group of given type within the model (meant for unique groups).
    * The created group will be in control of itself.
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess the data access to use
    */
   private function ensureAdminTitleGroup(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $groupAccess = $dataAccess->getGroupAccess();
      $groupId = \upro\dataModel\cmd\CommandHelper::getAdminTitleGroupId($dataAccess->getModelId());
      $groupControl = $groupAccess->getGroupControl($groupId);

      if (is_null($groupControl))
      {
         $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);

         $this->getLogger()->info('Creating admin group in model %s', $dataAccess->getModelId());
         $groupControl = $groupAccess->createGroup($groupId, \upro\dataModel\DataModelConstants::GROUP_TYPE_TITLE);
//         $groupControl->addControl($entryId);
      }

      return $groupControl;
   }

   /**
    * Ensures all known roles are created and put into control
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess data access to use
    * @param \upro\dataModel\GroupControl $groupControl the group control to use
    */
   private function ensureRolesCreatedAndControlled(\upro\dataModel\cmd\CommandDataAccess $dataAccess,
         \upro\dataModel\GroupControl $groupControl)
   {
      $roleNames = \upro\dataModel\DataModelConstants::getRoleNames();

      foreach ($roleNames as $roleName)
      {
         $roleId = \upro\dataModel\cmd\CommandHelper::getDerivedKey($dataAccess->getModelId(), $roleName);
         $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_ROLE, $roleId);
         $entry = $dataAccess->retrieveDataEntry($entryId);

         if (is_null($entry))
         {
            $data = array();

            $data[\upro\dataModel\DataModelConstants::ROLE_DATA_NAME] = $roleName;
            $this->getLogger()->info('Creating role <%s> in model %s', $roleName, $dataAccess->getModelId());
            $dataAccess->createDataEntry($entryId, $data, $entryId);
         }
         $groupControl->addControl($entryId);
      }
   }

}

}