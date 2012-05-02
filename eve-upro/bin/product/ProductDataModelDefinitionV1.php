<?php
namespace upro\product
{
require_once realpath(dirname(__FILE__)) . '/../dataModel/db/CoreDatabaseDataModelDefinitionV1.php';

/**
 * The product data model definition
 */
class ProductDataModelDefinitionV1 extends \upro\dataModel\db\CoreDatabaseDataModelDefinitionV1
{
   /**
    * Constructor
    */
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

}