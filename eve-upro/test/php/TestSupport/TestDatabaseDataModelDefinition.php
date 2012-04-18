<?php
require_once 'dataModel/db/AbstractDatabaseDataModelDefinition.php';

class TestDatabaseDataModelDefinition extends \upro\dataModel\db\AbstractDatabaseDataModelDefinition
{
   private $version;

   private $previous;

   function __construct($version, \upro\dataModel\db\DatabaseDataModelDefinition $previous = null)
   {
      $this->version = $version;
      $this->previous = $previous;
   }

   /** {@inheritDoc} */
   public function getDataModelDefinition()
   {
      return null;
   }

   /** {@inheritDoc} */
   public function getVersionNumber()
   {
      return $this->version;
   }

   /** {@inheritDoc} */
   public function getPreviousVersion()
   {
      return $this->previous;
   }
}
