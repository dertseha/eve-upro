<?php
namespace upro\db
{

/**
 * Database exception
 */
class DatabaseException extends \Exception
{
   function __construct($message, $code = 0, \Exception $previous = null)
   {
      parent::__construct($message, $code, $previous);
   }

   /** {@inheritDoc} */
   public function __toString()
   {
      $previous = $this->getPrevious();
      $buf = __CLASS__ . ": [{$this->getCode()}]: {$this->getMessage()}\n";

      if ($previous != null)
      {
         $buf .= "Caused by:\n" . $previous->__toString();
      }

      return $buf;
   }
}

}