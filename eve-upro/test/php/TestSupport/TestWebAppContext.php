<?php
require_once 'web/WebAppContext.php';
require_once 'TestFileResource.php';

class TestWebAppContext implements \upro\web\WebAppContext
{
   private $out;

   function __construct(\upro\io\PrintStream $out)
   {
      $this->out = $out;
   }

   function getOut()
   {
      return $this->out;
   }

   /** {@inheritDoc} */
   function getFileResource($key)
   {
      return new TestFileResource($key);
   }
}
