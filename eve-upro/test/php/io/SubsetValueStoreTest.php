<?php
require_once 'io/SubsetValueStore.php';
require_once 'io/ArrayValueStore.php';

class SubsetValueStoreTest extends PHPUnit_Framework_TestCase
{


   public function setUp()
   {
      parent::setUp();
   }

   public function testHasShouldWork()
   {
      $array = array('Test_Key' => 1234);
      $store = new \upro\io\ArrayValueStore($array);
      $store = new \upro\io\SubsetValueStore($store, 'Test_');

      $this->assertTrue($store->has('Key'));
   }

   public function testGetShouldWork()
   {
      $array = array('Test_Key' => 1234);
      $store = new \upro\io\ArrayValueStore($array);
      $store = new \upro\io\SubsetValueStore($store, 'Test_');

      $this->assertEquals(1234, $store->get('Key'));
   }

   public function testSetShouldWork()
   {
      $array = array('Test_Key' => 1234);
      $store = new \upro\io\ArrayValueStore($array);
      $store = new \upro\io\SubsetValueStore($store, 'Test_');

      $store->set('Key', 5678);

      $this->assertEquals(array('Test_Key' => 5678), $array);
   }

   public function testDelShouldWork()
   {
      $array = array('Test_Key' => 1234);
      $store = new \upro\io\ArrayValueStore($array);
      $store = new \upro\io\SubsetValueStore($store, 'Test_');

      $store->del('Key');

      $this->assertEquals(array(), $array);
   }

   public function testSubsetShouldWork()
   {
      $array = array('Test_Second_Key' => 1234);
      $store = new \upro\io\ArrayValueStore($array);
      $store = new \upro\io\SubsetValueStore($store, 'Test_');

      $store = $store->subset('Second_');

      $this->assertEquals(1234, $store->get('Key'));
   }
}