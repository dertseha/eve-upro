<?php
namespace upro\io
{
require_once realpath(dirname(__FILE__)) . '/ValueProvider.php';

/**
 * A value store adds the write interface to a ValueProvider.
 * It furthermore allows a subset access with nested namespaces
 */
interface ValueStore extends \upro\io\ValueProvider
{
   /**
    * @param string $key identifying the value to store
    * @param mixed $value the value to store
    */
   function set($key, $value);

   /**
    * Deletes a stored value identified by given key
    * @param string $key identifying the value to remove from the store
    */
   function del($key);

   /**
    * Returns a value store for a subset within this store
    * @param string $name a name for the subset created
    * @return \upro\io\ValueStore the value store for the requested subset
    */
   function subset($name);
}

}