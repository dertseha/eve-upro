<?php
require_once 'io/SimpleValueStore.php';
require_once 'io/MergingValueProvider.php';

class MergingValueProviderTest extends PHPUnit_Framework_TestCase
{
   private $backingStore1;

   private $backingStore2;

   private $provider;

   public function setUp()
   {
      parent::setUp();

      $this->backingStore1 = new \upro\io\SimpleValueStore();
      $this->backingStore2 = new \upro\io\SimpleValueStore();

      $this->provider = new \upro\io\MergingValueProvider();
      $this->provider->addProvider($this->backingStore1);
      $this->provider->addProvider($this->backingStore2);
   }

   public function testHasShouldReturnFalse_WhenNeitherGotValue()
   {
      $this->assertFalse($this->provider->has('unknown'));
   }

   public function testHasShouldReturnTrue_WhenFirstGotValue()
   {
      $this->backingStore1->set('existing', 1234);

      $this->assertTrue($this->provider->has('existing'));
   }

   public function testHasShouldReturnTrue_WhenSecondGotValue()
   {
      $this->backingStore2->set('existing', 1234);

      $this->assertTrue($this->provider->has('existing'));
   }

   public function testGetShouldReturnDefault_WhenNeitherGotValue()
   {
      $this->assertEquals('default', $this->provider->get('unknown', 'default'));
   }

   public function testGetShouldReturnFirstValue_WhenFirstGotValue()
   {
      $this->backingStore1->set('existing', 1234);

      $this->assertEquals(1234, $this->provider->get('existing'));
   }

   public function testGetShouldReturnSecondValue_WhenSecondGotValue()
   {
      $this->backingStore2->set('existing', 1234);

      $this->assertEquals(1234, $this->provider->get('existing'));
   }

   public function testGetShouldReturnFirstValue_WhenBothGotValue()
   {
      $this->backingStore1->set('existing', 1234);
      $this->backingStore2->set('existing', 5678);

      $this->assertEquals(1234, $this->provider->get('existing'));
   }
}