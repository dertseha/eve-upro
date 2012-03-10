<?php
require_once 'app/FileResource.php';

class TestFileResource implements \upro\app\FileResource
{
   private $path;

   function __construct($path)
   {
      $this->path = $path;
   }

   /** {@inheritDoc} */
   function getPath()
   {
      return $this->path;
   }

   /** {@inheritDoc} */
   function getContent()
   {
      return 'contentOf[' . $this->path . ']';
   }
}
