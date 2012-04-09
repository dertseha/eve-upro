<?php
require_once 'web/InlineScriptResource.php';

class InlineScriptResourceTest extends PHPUnit_Framework_TestCase
{
   private $resource;

   protected function givenAScriptResource($type, $body)
   {
      $this->resource = new \upro\web\InlineScriptResource($type, $body);
   }

   protected function givenAScriptResourceWithAttributes($type, $body, $attributes)
   {
      $this->resource = new \upro\web\InlineScriptResource($type, $body, $attributes);
   }

   protected function givenAScriptResourceForCascadingStyleSheet($body)
   {
      $this->resource = \upro\web\InlineScriptResource::getForCascadingStyleSheet($body);
   }

   protected function givenAScriptResourceForJavaScript($body)
   {
      $this->resource = \upro\web\InlineScriptResource::getForJavaScript($body);
   }

   protected function givenAScriptResourceForVertexShader($id, $body)
   {
      $this->resource = \upro\web\InlineScriptResource::getForVertexShader($id, $body);
   }

   protected function givenAScriptResourceForFragmentShader($id, $body)
   {
      $this->resource = \upro\web\InlineScriptResource::getForFragmentShader($id, $body);
   }

   protected function thenGetAttributesShouldReturn($expected)
   {
      $result = $this->resource->getAttributes();

      $this->assertEquals($expected, $result);
   }

   protected function thenGetTypeShouldReturn($expected)
   {
      $result = $this->resource->getType();

      $this->assertEquals($expected, $result);
   }

   protected function thenGetTagShouldReturn($expected)
   {
      $result = $this->resource->getTag();

      $this->assertEquals($expected, $result);
   }

   protected function thenAttributesShouldContain($key, $value)
   {
      $result = $this->resource->getAttributes();

      $this->assertEquals($value, $result[$key]);
   }

   public function setUp()
   {

   }

   public function testGetForCascadingStyleSheetIsValid_ForType()
   {
      $body = "theBody";

      $this->givenAScriptResourceForCascadingStyleSheet($body);

      $this->thenGetTypeShouldReturn("text/css");
   }

   public function testGetForCascadingStyleSheetIsValid_ForTag()
   {
      $body = "theBody";

      $this->givenAScriptResourceForCascadingStyleSheet($body);

      $this->thenGetTagShouldReturn("style");
   }

   public function testGetForJavaScriptIsValid_ForTag()
   {
      $body = "theBody";

      $this->givenAScriptResourceForJavaScript($body);

      $this->thenGetTagShouldReturn("script");
   }

   public function testGetForVertexShaderIsValid_ForType()
   {
      $body = "theBody";
      $id = "theShader";

      $this->givenAScriptResourceForVertexShader($id, $body);

      $this->thenGetTypeShouldReturn("x-shader/x-vertex");
   }

   public function testGetForVertexShaderIsValid_ForId()
   {
      $body = "theBody";
      $id = "theShader";

      $this->givenAScriptResourceForVertexShader($id, $body);

      $this->thenAttributesShouldContain('id', $id);
   }

   public function testGetForFragmentShaderIsValid_ForType()
   {
      $body = "theBody";
      $id = "theShader";

      $this->givenAScriptResourceForFragmentShader($id, $body);

      $this->thenGetTypeShouldReturn("x-shader/x-fragment");
   }

   public function testAttributesShouldContainType()
   {
      $type = "testType";
      $body = "body";

      $this->givenAScriptResource($type, $body);

      $this->thenGetAttributesShouldReturn(array('type' => $type));
   }

   public function testAttributesShouldBeSet_WhenProvidedAtConstructor()
   {
      $attributes = array('testAttr' => 'other');
      $type = "testType";
      $body = "body";

      $this->givenAScriptResourceWithAttributes($type, $body, $attributes);

      $this->thenGetAttributesShouldReturn(array_merge(array('type' => $type), $attributes));
   }

   public function testAttributesCantOverwriteType_WhenProvidedAtConstructor()
   {
      $attributes = array('type' => 'wrong');
      $type = "testType";
      $body = "body";

      $this->givenAScriptResourceWithAttributes($type, $body, $attributes);

      $this->thenGetAttributesShouldReturn(array('type' => $type));
   }
}