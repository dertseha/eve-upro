<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/DataType.php';

/**
 * A boolean data type
 */
class BooleanDataType implements \upro\db\schema\DataType
{
   /**
    * Constructor
    */
   function __construct()
   {

   }

   /** {@inheritDoc} */
   public function getSqlText()
   {
      return 'BOOLEAN';
   }
}

}