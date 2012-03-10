<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/HtmlPageBuilder.php';

define('RESOURCE_TYPE_CSS', 'text/css');
define('RESOURCE_TYPE_JAVASCRIPT', 'text/javascript');

define('RESOURCE_TYPE_VERTEXSHADER', 'x-shader/x-vertex');
define('RESOURCE_TYPE_FRAGMENTSHADER', 'x-shader/x-fragment');

/**
 * A HtmlResource is a descriptor for a content provider
 */
interface HtmlResource
{
   /**
    * @return the type identification of the resource
    */
   function getType();

   /**
    * Adds the resource to given page builder
    * @param HtmlPageBuilder $builder to use
    */
   function addToPage($builder);
}

}
