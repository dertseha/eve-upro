<?php
namespace upro\db\sql
{
require_once realpath(dirname(__FILE__)) . '/ParameterBoxObserver.php';

/**
 * A holder for a parameter
 */
class ParameterBox
{
   /**
    * @var \mixed the current value
    */
   private $value;

   /**
    * @var array of \upro\db\sql\ParameterBoxObserver
    */
   private $observer;

   /**
    * Constructor
    * @param \mixed $value the value
    */
   function __construct($value = null)
   {
      $this->observer = array();
      $this->value = $value;
   }

   /**
    * Sets the value
    * @param \mixed $value to set
    */
   public function setValue($value)
   {
      $this->value = $value;
      foreach ($this->observer as $observer)
      {
         $observer->onValueChanged($this->value);
      }
   }

   /**
    * @return \mixed the value
    */
   public function getValue()
   {
      return $this->value;
   }

   /**
    * Adds the given observer to the list
    * @param \upro\db\sql\ParameterBoxObserver $observer to add
    */
   public function addObserver(\upro\db\sql\ParameterBoxObserver $observer)
   {
      if (!in_array($observer, $this->observer, true))
      {
         $this->observer[] = $observer;
         $observer->onValueChanged($this->value);
      }
   }
}

}
