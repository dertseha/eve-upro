<?php
namespace upro\io
{

/**
 * A value provider is one giving access to a value by a name.
 * Essentially a getter for an associative array
 */
interface ValueProvider
{
   /**
    * Determines whether the provider has a value with given key
    * @param string $key identifying the value to check
    * @return boolean true if the provider has a value with given key
    */
   function has($key);

   /**
    * @param string $key identifying the value to retrieve
    * @param mixed $default the value to return if has() would return false for given $key
    * @return mixed the value for given key
    */
   function get($key, $default = null);
}

}