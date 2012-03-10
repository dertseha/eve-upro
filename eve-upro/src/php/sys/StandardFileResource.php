<?php
namespace upro\sys
{
require_once realpath(dirname(__FILE__)) . '/../app/FileResource.php';

/**
 * A standard file resource, backed up by file system
 */
class StandardFileResource implements \upro\app\FileResource
{
   /**
    * Path to the file
    * @var string
    */
   private $path;

   /**
    * Constructor
    * @param string $path to set
    */
   function __construct($path)
   {
      $this->path = $path;
   }

   /** {@inheritDoc} */
   function getPath()
   {
      return realpath($this->path);
   }

   /** {@inheritDoc} */
   function getContent()
   {
      return file_get_contents($this->getPath());
   }
}

}
