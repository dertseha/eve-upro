<?php
require_once 'io/ArrayValueProvider.php';
require_once 'io/SimpleValueStore.php';
require_once 'web/WebAppContext.php';
require_once 'web/StandardRequestServerContext.php';
require_once 'TestFileResource.php';

class TestWebAppContext implements \upro\web\WebAppContext
{
   private $out;

   function __construct(\upro\io\PrintStream $out)
   {
      $this->out = $out;
   }

   /** {@inheritDoc} */
   public function getOut()
   {
      return $this->out;
   }

   /** {@inheritDoc} */
   public function getFileResource($key)
   {
      return new TestFileResource($key);
   }

   /** {@inheritDoc} */
   function setRedirection($url)
   {

   }

   /** {@inheritDoc} */
   public function getRequestServerContext()
   {
      $array = array();
      $provider = new \upro\io\ArrayValueProvider($array);

      return new \upro\web\StandardRequestServerContext($provider);
   }

   /** {@inheritDoc} */
   public function getRequestData()
   {
      return new \upro\io\SimpleValueStore();
   }

   /** {@inheritDoc} */
   public function getSessionControl()
   {
      return null;
   }
}
