<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../sys/OutputPrintStream.php';
require_once realpath(dirname(__FILE__)) . '/../sys/StandardFileResource.php';
require_once realpath(dirname(__FILE__)) . '/WebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/RelativeFileResource.php';

class DefaultWebAppContext implements WebAppContext
{
   /**
    * Output stream
    * @var \upro\sys\OutputPrintStream
    */
   private $out;

   /**
    * Base path of the application context (document root)
    * @var string
    */
   private $basePath;

   /** Constructor */
   function __construct($basePath)
   {
      $this->out = new \upro\sys\OutputPrintStream();
      $this->basePath = $basePath;
   }

   /** {@inheritDoc} */
   function getOut()
   {
      return $this->out;
   }

   /** {@inheritDoc} */
   function getFileResource($key)
   {
      $fullPath = $this->basePath . '/' . $key;
      $fileResource = new \upro\sys\StandardFileResource($fullPath);

      return new \upro\web\RelativeFileResource($key, $fileResource);
   }
}

}
