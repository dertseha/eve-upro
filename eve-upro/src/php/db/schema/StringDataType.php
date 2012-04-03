<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/DataType.php';

/**
 * A string data type
 */
class StringDataType implements \upro\db\schema\DataType
{
   /**
    * @var number the length
    */
   private $length;

   /**
    * Constructor
    * @param int $length in characters
    */
   function __construct($length)
   {
      $this->length = $length;
   }

   /** {@inheritDoc} */
   public function getSqlText()
   {
      return 'VARCHAR(' . $this->length . ')';
   }
}

}