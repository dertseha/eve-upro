<?php
require_once 'PHPUnit.php';

require_once 'web/ReferencedJavaScriptResource.php';

class ReferencedJavaScriptResourceTest extends PHPUnit_Framework_TestCase
{
   private $resource;

   protected function givenAReferencedJavaScriptResource($src)
   {
      $this->resource = new \upro\web\ReferencedJavaScriptResource($src);
   }

   protected function thenGetAttributesShouldReturn($expected)
   {
      $result = $this->resource->getAttributes();

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {

   }

   public function testAttributesShouldBeSet()
   {
      $src = "theSource";

      $this->givenAReferencedJavaScriptResource($src);

      $this->thenGetAttributesShouldReturn(array('type' => 'text/javascript', 'src' => $src, 'charset' => "utf-8"));
   }


}