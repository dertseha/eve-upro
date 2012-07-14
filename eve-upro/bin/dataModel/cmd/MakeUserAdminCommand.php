<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/../../util/logging/LoggerProvider.php';
require_once realpath(dirname(__FILE__)) . '/Command.php';
require_once realpath(dirname(__FILE__)) . '/CommandHelper.php';

/**
 * Makes a specific user an admin.
 * This command also ensures the existence of the admin group
 */
class MakeUserAdminCommand implements \upro\dataModel\cmd\Command
{
   /**
    * The name of the user that shall be made admin
    * @var string
    */
   private $userName;

   function __construct($userName)
   {
      $this->userName = $userName;
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
      $groupControl = $this->getAdminTitleGroup($dataAccess);

      if (!is_null($groupControl))
      {
         $userEntry = \upro\dataModel\cmd\CommandHelper::findUserByName($dataAccess, $this->userName);

         if (!is_null($userEntry))
         {
            $this->getLogger()->info('Making User [%s] admin', $this->userName);
            $groupControl->addMember($userEntry->getId()->getKey());
         }
         else
         {
            $this->getLogger()->warn('User [%s] not found - can not make admin', $this->userName);
         }
      }
      else
      {
         $this->getLogger()->warn('No admin title group existing - try to set up model first');
      }
   }

   /**
    * Retrieves the admin title group
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess the data access to use
    * @return \upro\dataModel\GroupControl the control or null
    */
   private function getAdminTitleGroup(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $groupAccess = $dataAccess->getGroupAccess();
      $groupId = \upro\dataModel\cmd\CommandHelper::getAdminTitleGroupId($dataAccess->getModelId());
      $groupControl = $groupAccess->getGroupControl($groupId);

      return $groupControl;
   }

}

}