<?php
namespace upro\io
{
require_once realpath(dirname(__FILE__)) . '/ValueProvider.php';

/**
 * A value provider that is a view over a list of other value provider.
 */
class MergingValueProvider implements \upro\io\ValueProvider
{
   /**
    * The list of wrapped provider
    * @var array of \upro\io\ValueProvider
    */
   private $provider = array();

   /**
    * Constructor
    */
   function __construct()
   {

   }

   /**
    * Adds a provider to the list
    * @param \upro\io\ValueProvider $provider the provider to wrap
    */
   public function addProvider(\upro\io\ValueProvider $provider)
   {
      $this->provider[] = $provider;
   }

   /** {@inheritDoc} */
   public function has($key)
   {
      $count = count($this->provider);
      $result = false;

      for ($i = 0; !$result && ($i < $count); $i++)
      {
         $provider = $this->provider[$i];

         $result = $provider->has($key);
      }

      return $result;
   }

   /** {@inheritDoc} */
   public function get($key, $default = null)
   {
      $count = count($this->provider);
      $value = $default;
      $found = false;

      for ($i = 0; !$found && ($i < $count); $i++)
      {
         $provider = $this->provider[$i];

         if ($provider->has($key))
         {
            $value = $provider->get($key);
            $found = true;
         }
      }

      return $value;
   }
}

}
