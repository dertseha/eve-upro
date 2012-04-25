<?php
require_once 'io/ArrayValueStore.php';

class ArrayValueStoreTest extends PHPUnit_Framework_TestCase
{


   public function setUp()
   {
      parent::setUp();
   }

   public function testDelShouldNotDoAnything_WhenDeletingUnknownKey()
   {
      $array = array('Test' => 1234);
      $store = new \upro\io\ArrayValueStore($array);

      $store->del('NotExisting');

      $this->assertTrue($store->has('Test'));
   }

   public function testDelShouldRemoveEntryFromOriginal_WhenDeletingKnownKey()
   {
      $array = array('Test' => 1234);
      $store = new \upro\io\ArrayValueStore($array);

      $store->del('Test');

      $this->assertEquals(array(), $array);
   }

   public function testHasShouldReturnFalse_WhenDeletingKnownKey()
   {
      $array = array('Test' => 1234);
      $store = new \upro\io\ArrayValueStore($array);

      $store->del('Test');

      $this->assertFalse($store->has('Test'));
   }

   public function testSetShouldSetEntryFromOriginal_WhenSettingKey()
   {
      $array = array('Test' => 1234);
      $store = new \upro\io\ArrayValueStore($array);

      $store->set('Test', 5678);

      $this->assertEquals(array('Test' => 5678), $array);
   }

   public function testGetShouldReturnValue_WhenSettingKey()
   {
      $array = array('Test' => 1234);
      $store = new \upro\io\ArrayValueStore($array);

      $store->set('Test', 5678);

      $this->assertEquals(5678, $store->get('Test'));
   }

   public function testHasShouldReturnTrue_WhenSettingNewKey()
   {
      $array = array('Test' => 1234);
      $store = new \upro\io\ArrayValueStore($array);

      $store->set('New', 5678);

      $this->assertTrue($store->has('New'));
   }

   public function testSubsetShouldAffectArray_WhenModifyingSubset()
   {
      $array = array();
      $store = new \upro\io\ArrayValueStore($array);

      $store->subset('Test_')->set('1', 1234);

      $this->assertEquals(array('Test_1' => 1234), $array);
   }
}