<?php
require_once 'dataModel/DataEntryId.php';
require_once 'Uuid.php';

class DataEntryIdTest extends PHPUnit_Framework_TestCase
{
   private $baseId;

   private $otherId;

   protected function givenAnEntryId($entryType, $key)
   {
      $this->baseId = new \upro\dataModel\DataEntryId($entryType, $key);
   }

   protected function whenASecondEntryIdExists($entryType, $key)
   {
      $this->otherId = new \upro\dataModel\DataEntryId($entryType, $key);
   }

   protected function thenTheEntryIdsShouldBeEqual()
   {
      $result = $this->baseId->equals($this->otherId);

      $this->assertTrue($result);
   }

   protected function thenTheEntryIdsShouldNotBeEqual()
   {
      $result = $this->baseId->equals($this->otherId);

      $this->assertFalse($result);
   }

   protected function thenToStringShouldReturn($expected)
   {
      $result = $this->baseId->toString();

      $this->assertEquals($expected, $result);
   }

   protected function thenStringPresentationShouldBe($expected)
   {
      $result = '' . $this->baseId;

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function testEntryIdsAreEqual_WhenParametersEqual()
   {
      $entryType = 'test';
      $key = \Uuid::v4();

      $this->givenAnEntryId($entryType, $key);

      $this->whenASecondEntryIdExists($entryType, $key);

      $this->thenTheEntryIdsShouldBeEqual();
   }

   public function testEntryIdsAreNotEqual_WhenTypeDiffers()
   {
      $key = \Uuid::v4();

      $this->givenAnEntryId('typeA', $key);

      $this->whenASecondEntryIdExists('typeB', $key);

      $this->thenTheEntryIdsShouldNotBeEqual();
   }

   public function testEntryIdsAreNotEqual_WhenKeyDiffers()
   {
      $entryType = 'test';

      $this->givenAnEntryId($entryType, \Uuid::v4());

      $this->whenASecondEntryIdExists($entryType, \Uuid::v4());

      $this->thenTheEntryIdsShouldNotBeEqual();
   }

   public function testToStringShouldReturnValue()
   {
      $entryType = 'toStringTest';
      $key = \Uuid::v4();

      $this->givenAnEntryId($entryType, $key);

      $this->thenToStringShouldReturn('toStringTest[' . $key . ']');
   }

   public function testStringPresentationShouldBeValid()
   {
      $entryType = 'toStringTest';
      $key = \Uuid::v4();

      $this->givenAnEntryId($entryType, $key);

      $this->thenStringPresentationShouldBe('toStringTest[' . $key . ']');
   }
}
