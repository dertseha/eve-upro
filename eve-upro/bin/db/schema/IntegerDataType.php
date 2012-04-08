<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/DataType.php';

/**
 * An integer data type
 */
class IntegerDataType implements \upro\db\schema\DataType
{
   /**
    * Constructor
    */
   function __construct($length)
   {

   }

   /** {@inheritDoc} */
   public function getSqlText()
   {
      return 'INT';
   }
}

}