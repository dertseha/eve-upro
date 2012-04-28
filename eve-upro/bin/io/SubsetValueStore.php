<?php
namespace upro\io
{
require_once realpath(dirname(__FILE__)) . '/ValueStore.php';

/**
 * A subset value store implementation, wrapping another store
 */
class SubsetValueStore implements \upro\io\ValueStore
{
   /**
    * The wrapped store
    * @var \upro\io\ValueStore
    */
   private $store;

   /**
    * The prefix to apply to all keys
    * @var string
    */
   private $prefix;

   /**
    * Constructor
    * @param \upro\io\ValueStore $store the store to wrap
    * @param string $prefix the prefix to apply to all keys of this store
    */
   function __construct(\upro\io\ValueStore $store, $prefix)
   {
      $this->store = $store;
      $this->prefix = $prefix;
   }

   /** {@inheritDoc} */
   public function has($key)
   {
      return $this->store->has($this->prefix . $key);
   }

   /** {@inheritDoc} */
   public function get($key, $default = null)
   {
      return $this->store->get($this->prefix . $key, $default);
   }

   /** {@inheritDoc} */
   public function del($key)
   {
      $this->store->del($this->prefix . $key);
   }

   /** {@inheritDoc} */
   public function set($key, $value)
   {
      $this->store->set($this->prefix . $key, $value);
   }

   /** {@inheritDoc} */
   public function subset($name)
   {
      return new \upro\io\SubsetValueStore($this->store, $this->prefix . $name);
   }
}

}
