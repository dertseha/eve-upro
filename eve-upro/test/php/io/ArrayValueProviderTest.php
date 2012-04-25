<?php
require_once 'io/ArrayValueProvider.php';

class ArrayValueProviderTest extends PHPUnit_Framework_TestCase
{


   public function setUp()
   {
      parent::setUp();
   }

   public function testHasShouldReturnFalse_WhenUnknownKeyQueried()
   {
      $array = array('Test' => 1234);
      $provider = new \upro\io\ArrayValueProvider($array);

      $this->assertFalse($provider->has('NotExisting'));
   }

   public function testHasShouldReturnTrue_WhenKnownKeyQueried()
   {
      $array = array('Test' => 1234);
      $provider = new \upro\io\ArrayValueProvider($array);

      $this->assertTrue($provider->has('Test'));
   }

   public function testGetShouldReturnValue_WhenKnownKeyQueried()
   {
      $array = array('Test' => 1234);
      $provider = new \upro\io\ArrayValueProvider($array);

      $this->assertEquals(1234, $provider->get('Test'));
   }

   public function testGetShouldReturnValue_WhenModifiedOutside()
   {
      $array = array('Test' => 1234);
      $provider = new \upro\io\ArrayValueProvider($array);

      $array['Test'] = 5678;

      $this->assertEquals(5678, $provider->get('Test'));
   }
}