<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/DataType.php';

/**
 * An unknown data type
 */
class UnknownDataType implements \upro\db\schema\DataType
{
   /**
    * @var string the SQL text
    */
   private $sqlText;

   /**
    * Constructor
    * @param string $sqlText the SQL text of the parameter
    */
   function __construct($sqlText)
   {
      $this->sqlText = $sqlText;
   }

   /** {@inheritDoc} */
   public function getSqlText()
   {
      return $this->sqlText;
   }
}

}