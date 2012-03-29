<?php
namespace upro\db\sql
{

/**
 * A holder for a paramter
 */
class ParameterBox
{
   /**
    * @var \mixed the current value
    */
   private $value;

   /**
    * Constructor
    * @param \mixed $value the value
    */
   function __construct($value = null)
   {
      $this->value = $value;
   }

   /**
    * Sets the value
    * @param mixed $value to set
    */
   public function setValue($value)
   {
      $this->value = $value;
   }

   /**
    * @return \mixed the value
    */
   public function getValue()
   {
      return $this->value;
   }
}

}
