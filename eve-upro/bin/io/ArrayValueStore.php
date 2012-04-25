<?php
namespace upro\io
{
require_once realpath(dirname(__FILE__)) . '/ArrayValueProvider.php';
require_once realpath(dirname(__FILE__)) . '/ValueStore.php';

/**
 * A value store for an array
 */
class ArrayValueStore extends \upro\io\ArrayValueProvider implements \upro\io\ValueStore
{
   /**
    * Constructor
    * @param string:mixed &$array the array to wrap. The reference is stored
    */
   function __construct(&$array)
   {
      parent::__construct($array);
   }

   /** {@inheritDoc} */
   public function del($key)
   {
      $array =& $this->getArray();

      unset($array[$key]);
   }

   /** {@inheritDoc} */
   public function set($key, $value)
   {
      $array =& $this->getArray();

      $array[$key] = $value;
   }

   /** {@inheritDoc} */
   public function subset($name)
   {
      require_once realpath(dirname(__FILE__)) . '/SubsetValueStore.php';

      return new \upro\io\SubsetValueStore($this, $name);
   }
}

}
