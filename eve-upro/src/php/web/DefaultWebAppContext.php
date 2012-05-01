<?php
namespace upro\web
{
require_once realpath(dirname(__FILE__)) . '/../sys/OutputPrintStream.php';
require_once realpath(dirname(__FILE__)) . '/../sys/StandardFileResource.php';
require_once realpath(dirname(__FILE__)) . '/../io/ArrayValueProvider.php';
require_once realpath(dirname(__FILE__)) . '/WebAppContext.php';
require_once realpath(dirname(__FILE__)) . '/RelativeFileResource.php';
require_once realpath(dirname(__FILE__)) . '/StandardRequestServerContext.php';
require_once realpath(dirname(__FILE__)) . '/StandardSessionControl.php';

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

   /**
    * The server request context
    * @var \upro\web\RequestServerContext
    */
   private $requestServerContext;

   /**
    * The session control of this context
    * @var \upro\web\SessionControl
    */
   private $sessionControl;

   /** Constructor */
   function __construct($basePath)
   {
      $this->out = new \upro\sys\OutputPrintStream();
      $this->basePath = $basePath;
      $this->requestServerContext = \upro\web\StandardRequestServerContext::factory();
   }

   /** {@inheritDoc} */
   public function getOut()
   {
      return $this->out;
   }

   /** {@inheritDoc} */
   public function getFileResource($key)
   {
      $fullPath = $this->basePath . '/' . $key;
      $fileResource = new \upro\sys\StandardFileResource($fullPath);

      return new \upro\web\RelativeFileResource($key, $fileResource);
   }

   /** {@inheritDoc} */
   public function setRedirection($url)
   {
      header('Location: ' . $url);
   }

   /** {@inheritDoc} */
   public function getRequestServerContext()
   {
      return $this->requestServerContext;
   }

   /** {@inheritDoc} */
   public function getRequestData()
   {
      $array = $_REQUEST;

      if ($this->requestServerContext->isRequestPost())
      {
         $array = $_POST;
      }
      else if ($this->requestServerContext->isRequestGet())
      {
         $array = $_GET;
      }

      return new \upro\io\ArrayValueProvider($array);
   }

   /** {@inheritDoc} */
   public function getSessionControl()
   {
      if (is_null($this->sessionControl))
      {
         $this->sessionControl = new \upro\web\StandardSessionControl(
               \upro\web\StandardSessionControl::getDefaultStartStrategy());
      }

      return $this->sessionControl;
   }
}

}
