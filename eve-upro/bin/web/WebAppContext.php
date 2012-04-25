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
    * @return \upro\web\RequestServerContext the server context the current request runs in
    */
   function getRequestServerContext();
}

}
