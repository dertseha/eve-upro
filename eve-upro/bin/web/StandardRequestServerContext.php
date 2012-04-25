<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../io/ValueProvider.php';
require_once realpath(dirname(__FILE__)) . '/../io/ArrayValueProvider.php';
require_once realpath(dirname(__FILE__)) . '/RequestServerContext.php';

/**
 * The standard implementation for the server context.
 * Will query the contained ValueProvider for values according the $_SERVER superglobal.
 *
 * Provides a static factory function returning an implementation referring to $_SERVER.
 */
class StandardRequestServerContext implements \upro\web\RequestServerContext
{
   /**
    * The value provider to extract the data from
    * @var \upro\io\ValueProvider
    */
   private $provider;

   /**
    * Constructor
    * @param \upro\io\ValueProvider $provider to query the values from
    */
   function __construct(\upro\io\ValueProvider $provider)
   {
      $this->provider = $provider;
   }

   /**
    * @return \upro\web\RequestServerContext providing the standard $_SERVER implementation
    */
   public static function factory()
   {
      return new \upro\web\StandardRequestServerContext(new \upro\io\ArrayValueProvider($_SERVER));
   }

   /** {@inheritDoc} */
   public function getRemoteAddress()
   {
      return $this->provider->get('REMOTE_ADDR');
   }

   /** {@inheritDoc} */
   public function getUserAgent()
   {
      return $this->provider->get('HTTP_USER_AGENT');
   }
}

}
