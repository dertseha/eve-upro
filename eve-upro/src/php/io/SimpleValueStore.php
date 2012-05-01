<?php
namespace upro\io
{
require_once realpath(dirname(__FILE__)) . '/ValueStore.php';
require_once realpath(dirname(__FILE__)) . '/ArrayValueStore.php';

/**
 * A simple value store implementation, containing its own data
 */
class SimpleValueStore implements \upro\io\ValueStore
{
   /**
    * The helper store
    * @var \upro\io\ValueStore
    */
   private $store;

   /**
    * The array containing the data
    * @var array
    */
   private $data = array();

   /**
    * Constructor
    */
   function __construct()
   {
      $this->store = new \upro\io\ArrayValueStore($this->data);
   }

   /** {@inheritDoc} */
   public function has($key)
   {
      return $this->store->has($key);
   }

   /** {@inheritDoc} */
   public function get($key, $default = null)
   {
      return $this->store->get($key, $default);
   }

   /** {@inheritDoc} */
   public function del($key)
   {
      $this->store->del($key);
   }

   /** {@inheritDoc} */
   public function set($key, $value)
   {
      $this->store->set($key, $value);
   }

   /** {@inheritDoc} */
   public function subset($name)
   {
      return new \upro\io\SubsetValueStore($this, $name);
   }
}

}
