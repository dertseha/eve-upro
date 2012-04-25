<?php
namespace upro\io
{
require_once realpath(dirname(__FILE__)) . '/../io/ValueProvider.php';

/**
 * A value provider for an array
 */
class ArrayValueProvider implements \upro\io\ValueProvider
{
   /**
    * The array
    * @var string:mixed
    */
   private $array;

   /**
    * Constructor
    * @param string:mixed &$array the array to wrap. The reference is stored
    */
   function __construct(&$array)
   {
      $this->array =& $array;
   }

   /** {@inheritDoc} */
   public function has($key)
   {
      return isset($this->array[$key]);
   }

   /** {@inheritDoc} */
   public function get($key)
   {
      return $this->array[$key];
   }

   /**
    * @return \upro\ip\ValueProvider covering the environment superglobal $_ENV
    */
   public static function getEnvironment()
   {
      return new ArrayValueProvider($_ENV);
   }

   /**
    * @return string:mixed reference to the array
    */
   protected function &getArray()
   {
      return $this->array;
   }
}

}
