<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../io/ArrayValueStore.php';
require_once realpath(dirname(__FILE__)) . '/SessionControl.php';
require_once realpath(dirname(__FILE__)) . '/SessionStartStrategy.php';
require_once realpath(dirname(__FILE__)) . '/RegeneratingSessionStartStrategy.php';

/**
 * The standard implementation for session control.
 * Session variables will be stored with the prefix SESSION_KEY_PREFIX
 */
class StandardSessionControl implements \upro\web\SessionControl
{
   /**
    * The name for the session
    * @var string
    */
   const SESSION_NAME = 'upro';

   /**
    * The prefix used for all session variables
    * @var string
    */
   const SESSION_KEY_PREFIX = 'upro_';

   /**
    * Store of the session variables
    * @var \upro\io\ValueStore
    */
   private $valueStore;

   /**
    * Constructor
    * @param \upro\web\SessionStartStrategy $strategy the strategy to use for starting the session.
    */
   function __construct(\upro\web\SessionStartStrategy $strategy)
   {
      session_name(\upro\web\StandardSessionControl::SESSION_NAME);
      $strategy->start();

      $this->valueStore = new \upro\io\ArrayValueStore($_SESSION);
      $this->valueStore = $this->valueStore->subset(\upro\web\StandardSessionControl::SESSION_KEY_PREFIX);
   }

   /**
    * @return \upro\web\SessionStartStrategy - the default start strategy
    */
   public static function getDefaultStartStrategy()
   {
      return new \upro\web\RegeneratingSessionStartStrategy(false); // keep old sessions to allow parallel requests
   }

   /** {@inheritDoc} */
   public function getValueStore()
   {
      return $this->valueStore;
   }
}

}
