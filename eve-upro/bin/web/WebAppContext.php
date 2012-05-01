<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../app/AppContext.php';

/**
 * A WebAppContext is the wrapper for a WebApplication providing context information
 * about the request
 */
interface WebAppContext extends \upro\app\AppContext
{
   /**
    * Requests a redirection of the client (sets Location header)
    * @param string $url the URL to use
    */
   function setRedirection($url);

   /**
    * @return \upro\web\RequestServerContext the server context the current request runs in
    */
   function getRequestServerContext();

   /**
    * @return \upro\io\ValueProvider a provider for the request data (GET/POST)
    */
   function getRequestData();

   /**
    * @return \upro\web\SessionControl the control for the session; Creates one if needed
    */
   function getSessionControl();
}

}
