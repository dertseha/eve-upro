<?php
namespace upro\dataModel
{
require_once realpath(dirname(__FILE__)) . '/DataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DataModelDefinition.php';

/**
 * The definition describes the properties (and relations) of a data model
 */
class CoreDataModelDefinition implements \upro\dataModel\DataModelDefinition
{
   /**
    * Map of entry types per context
    * @var string:array
    */
   private $entryTypesPerContext;

   /**
    * Constructor
    */
   function __construct()
   {
      $this->entryTypesPerContext = array();

      // group/permission system
      $this->registerEntryType(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP, \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP);
      $this->registerEntryType(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP, \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP);
      $this->registerEntryType(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST, \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP);
   }

   /** {@inheritDoc} */
   public function getEntryTypesForContext($contextType)
   {
      $result = null;

      if (array_key_exists($contextType, $this->entryTypesPerContext))
      {
         $result = $this->entryTypesPerContext[$contextType];
      }
      else
      {
         $result = array();
      }

      return $result;
   }

   /**
    * Registers a specific entry type
    * @param string $entryType the entry type to register
    * @param string $contextType under which context this entry type is
    */
   public function registerEntryType($entryType, $contextType)
   {
      if (!array_key_exists($contextType, $this->entryTypesPerContext))
      {
         $this->entryTypesPerContext[$contextType] = $entryTypes = array();
      }
      $this->entryTypesPerContext[$contextType][] = $entryType;
   }
}

}