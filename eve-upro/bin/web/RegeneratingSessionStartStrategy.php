<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/SessionStartStrategy.php';

/**
 * A start strategy calling start and then session_regenerate_id
 */
class RegeneratingSessionStartStrategy implements \upro\web\SessionStartStrategy
{
   /**
    * True if the old session data shall be deleted
    * @var boolean
    */
   private $deleteOldSession;

   /**
    * Constructor
    * @param boolean $deleteOldSession Whether the old session shall be deleted
    */
   function __construct($deleteOldSession)
   {
      $this->deleteOldSession = $deleteOldSession;
   }

   /** {@inheritDoc} */
   public function start()
   {
      session_start();
      session_regenerate_id($this->deleteOldSession);
   }
}

}
