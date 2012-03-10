<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../app/FileResource.php';

/**
 * A relative file resource, the path is viewed from the document root
 */
class RelativeFileResource implements \upro\app\FileResource
{
   /**
    * The (relative) path of the resource
    * @var string
    */
   private $path;

   /**
    * The wrapped resource
    * @var \upro\app\FileResource
    */
   private $resource;

   /**
    * Constructor
    * @param string $path to report
    * @param \upro\app\FileResource $resource to wrap
    */
   function __construct($path, \upro\app\FileResource $resource)
   {
      $this->path = $path;
      $this->resource = $resource;
   }

   /** {@inheritDoc} */
   function getPath()
   {
      return $this->path;
   }

   /** {@inheritDoc} */
   function getContent()
   {
      return $this->resource->getContent();
   }

}

}
