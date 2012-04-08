<?php
namespace upro\db
{
require_once realpath(dirname(__FILE__)) . '/TableRowReader.php';

/**
 * A TableRowReader providing (and expecting) just a single cell
 */
class SingleCellTableRowReader implements \upro\db\TableRowReader
{
   /**
    * @var \mixed the value
    */
   private $value;

   /**
    * Constructor
    * @param \mixed $initValue the initial value
    */
   function __construct($initValue = null)
   {
      $this->value = $initValue;
   }

   /** {@inheritDoc} */
   public function receive($data)
   {
      $this->value = $data[0];
   }

   /**
    * @return \mixed the received value
    */
   public function getValue()
   {
      return $this->value;
   }
}

}
