<?php
namespace upro\dataModel\cmd
{
require_once realpath(dirname(__FILE__)) . '/../GroupAccess.php';
require_once realpath(dirname(__FILE__)) . '/CommandDataAccess.php';
require_once realpath(dirname(__FILE__)) . '/StandardGroupAccess.php';

/**
 * A standard implementation of the group access factory
 */
class StandardGroupAccessFactory implements GroupAccessFactory
{
   /**
    * @var \upro\dataModel\DataModelDefinition
    */
   private $definition;

   /**
    * Constructor
    * @param \upro\dataModel\DataModelDefinition $definition the data model defintion to use
    */
   function __construct(\upro\dataModel\DataModelDefinition $definition)
   {
      $this->definition = $definition;
   }

   /** {@inheritDoc} */
   public function getGroupAccess(\upro\dataModel\cmd\CommandDataAccess $dataAccess)
   {
      return new \upro\dataModel\cmd\StandardGroupAccess($this->defintion, $dataAccess);
   }
}

}