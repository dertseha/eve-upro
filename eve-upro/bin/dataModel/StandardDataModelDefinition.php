<?php
namespace upro\dataModel
{
require_once realpath(dirname(__FILE__)) . '/DataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DataModelDefinition.php';

/**
 * The standard implementation of a DataModel definition with helper methods
 */
class StandardDataModelDefinition implements \upro\dataModel\DataModelDefinition
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