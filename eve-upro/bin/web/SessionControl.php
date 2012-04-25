<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../io/ValueStore.php';

/**
 * An interface for session control
 */
interface SessionControl
{

   /**
    * @return \upro\io\ValueStore for the session variables
    */
   function getValueStore();
}

}
