<?php
require_once 'BufferPrintStream.php';

class BufferPrintStreamTest extends PHPUnit_Framework_TestCase
{
   private $printStream;

   protected function givenABufferPrintStream()
   {
      $this->printStream = new BufferPrintStream();
   }

   protected function whenCallingPrintLn($text)
   {
      $this->printStream->println($text);
   }

   protected function thenCountShouldReturn($expected)
   {
      $result = $this->printStream->count();

      $this->assertEquals($expected, $result);
   }

   protected function thenGetLineShouldReturn($index, $expected)
   {
      $result = $this->printStream->getLine($index);

      $this->assertEquals($expected, $result);
   }

   protected function thenToStringShouldReturn($expected)
   {
      $result = $this->printStream->toString();

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {

   }

   public function testCountShouldReturn0_WhenConstructed()
   {
      $this->givenABufferPrintStream();

      $this->thenCountShouldReturn(0);
   }

   public function testLineShouldBeRetrievable_WhenCallingPrint()
   {
      $line = "test";

      $this->givenABufferPrintStream();

      $this->whenCallingPrintLn($line);

      $this->thenGetLineShouldReturn(0, $line);
   }

   public function testLineShouldBeRetrievable_WhenCallingPrintAgain()
   {
      $line = "test";

      $this->givenABufferPrintStream();

      $this->whenCallingPrintLn("first");
      $this->whenCallingPrintLn($line);

      $this->thenGetLineShouldReturn(1, $line);
   }

   public function testToStringShouldReturnFullBlock()
   {
      $this->givenABufferPrintStream();

      $this->whenCallingPrintLn("first");
      $this->whenCallingPrintLn("second");

      $this->thenToStringShouldReturn("first\nsecond\n");
   }
}
