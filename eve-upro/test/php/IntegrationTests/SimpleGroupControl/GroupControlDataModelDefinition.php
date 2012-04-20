<?php
require_once 'dataModel/db/CoreDatabaseDataModelDefinitionV1.php';

class GroupControlDataModelDefinition extends \upro\dataModel\db\CoreDatabaseDataModelDefinitionV1
{
   function __construct()
   {
      parent::__construct();

   }

   /** {@inheritDoc} */
   public function getVersionNumber()
   {
      return 1;
   }

   /** {@inheritDoc} */
   public function getPreviousVersion()
   {
      return null;
   }

}
