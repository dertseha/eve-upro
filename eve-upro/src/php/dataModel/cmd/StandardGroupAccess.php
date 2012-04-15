<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/CommandDataAccess.php';
require_once realpath(dirname(__FILE__)) . '/StandardGroupControl.php';
require_once realpath(dirname(__FILE__)) . '/../DataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/../DataModelDefinition.php';
require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../GroupAccess.php';

/**
 * An standard access interface for group control
 */
class StandardGroupAccess implements \upro\dataModel\GroupAccess
{
   /**
    * @var \upro\dataModel\cmd\CommandDataAccess
    */
   private $dataAccess;

   /**
    * @var \upro\dataModel\DataModelDefinition
    */
   private $definition;

   /**
    * Constructor
    * @param \upro\dataModel\DataModelDefinition $definition the definition to use
    * @param \upro\dataModel\cmd\CommandDataAccess $dataAccess the data access to use
    */
   function __construct(\upro\dataModel\DataModelDefinition $definition, \upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      $this->definition = $definition;
      $this->dataAccess = $dataAccess;
   }

   /** {@inheritDoc} */
   public function getGroupControl($groupId)
   {
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);
      $groupEntry = $this->dataAccess->retrieveDataEntry($entryId);
      $control = null;

      if ($groupEntry != null)
      {
         $control = new \upro\dataModel\cmd\StandardGroupControl($entryId, $this->definition, $this->dataAccess);
      }

      return $control;
   }

   /** {@inheritDoc} */
   public function createGroup($groupId, $groupType)
   {
      $entryId = new \upro\dataModel\DataEntryId(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, $groupId);
      $groupEntry = $this->dataAccess->retrieveDataEntry($entryId);
      $control = null;

      if ($groupEntry == null)
      {
         \upro\dataModel\cmd\StandardGroupControl::createGroup($this->dataAccess, $entryId, $groupType);

         $control = new \upro\dataModel\cmd\StandardGroupControl($entryId, $this->definition, $this->dataAccess);
         $control->addInterest($entryId);
      }

      return $control;
   }
}

}