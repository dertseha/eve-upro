<?php
require_once 'PHPUnit.php';

require_once 'sys/StandardFileResource.php';

class StandardFileResourceTest extends PHPUnit_Framework_TestCase
{
   private $resource;

   protected function givenAFileResource($path)
   {
      $this->resource = new \upro\sys\StandardFileResource($path);
   }

   protected function thenGetPathShouldReturn($expected)
   {
      $result = $this->resource->getPath();

      $this->assertEquals($expected, $result);
   }

   protected function thenGetContentShouldReturn($expected)
   {
      $result = $this->resource->getContent();

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {

   }

   public function testGetPathShouldReturnAbsolutePath_WhenConstructedWithRelative()
   {
      $thisFilePath = realpath(dirname(__FILE__));
      $commonBasePath = dirname($thisFilePath);
      $testFilePath = 'TestSupport' . DIRECTORY_SEPARATOR . 'SampleResource.txt';

      $this->givenAFileResource($thisFilePath . '/../' . $testFilePath);

      $this->thenGetPathShouldreturn($commonBasePath . DIRECTORY_SEPARATOR . $testFilePath);
   }

   public function testGetContentShouldReturnValid_WhenUsingTestFile()
   {
      $thisFilePath = realpath(dirname(__FILE__));
      $testFilePath = 'TestSupport' . DIRECTORY_SEPARATOR . 'SampleResource.txt';

      $this->givenAFileResource($thisFilePath . '/../' . $testFilePath);

      $this->thenGetContentShouldReturn("A sample resource");
   }
}
