<?php
require_once 'BufferPrintStream.php';

require_once 'web/StreamHtmlPageBuilder.php';

class StreamHtmlPageBuilderTest extends PHPUnit_Framework_TestCase
{
   private $buffer;

   private $builder;

   private function getHtmlPage($headContent, $bodyContent)
   {
      return "<!doctype html>\n" . "<html lang=en>\n" .
            "<head>\n" . "<meta http-equiv=\"X-UA-Compatible\" content=\"IE=9\"/>\n" . $headContent . "</head>\n" .
            "<body>\n" . $bodyContent . "</body>\n" .
            "</html>\n";
   }

   protected function givenABuilder()
   {
      $this->builder = new upro\web\StreamHtmlPageBuilder($this->buffer);
   }

   protected function whenCallingStart()
   {
      $this->builder->start();
   }

   protected function whenCallingFinish()
   {
      $this->builder->finish();
   }

   protected function whenSettingTitle($title)
   {
      $this->builder->setTitle($title);
   }

   protected function whenAddingNode($tag, $attributes, $body)
   {
      $this->builder->addNode($tag, $attributes, $body);
   }

   protected function thenTheResultingPageShouldBe($expected)
   {
      $result = $this->buffer->toString();

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {
      $this->buffer = new BufferPrintStream();
   }

   public function testNothingShouldBeWritten_WhenOnlyConstructed()
   {
      $this->givenABuilder();

      $this->thenTheResultingPageShouldBe("");
   }

   public function testEmptyPageCreated_WhenOnlyStartedAndFinished()
   {
      $this->givenABuilder();

      $this->whenCallingStart();
      $this->whenCallingFinish();

      $this->thenTheResultingPageShouldBe( $this->getHtmlPage("", "") );
   }

   public function testTitleAdded_WhenCallingSetTitle()
   {
      $title = "testTitle";

      $this->givenABuilder();

      $this->whenCallingStart();
      $this->whenSettingTitle($title);
      $this->whenCallingFinish();

      $this->thenTheResultingPageShouldBe( $this->getHtmlPage("<title>" . $title . "</title>\n", "") );
   }

   public function testNodeAddedInHead_WhenCallingAddNode()
   {
      $tag = "test";
      $attributes = array('id' => "theId", 'style' => 'bold');
      $body = "theBody";

      $this->givenABuilder();

      $this->whenCallingStart();
      $this->whenAddingNode($tag, $attributes, $body);
      $this->whenCallingFinish();

      $this->thenTheResultingPageShouldBe( $this->getHtmlPage("<" . $tag . " id=\"theId\" style=\"bold\">\n" .
            $body . "\n</" . $tag . ">\n", "") );
   }

   public function testNodeAddedInHead_WhenCallingAddNodeWithEmptyBody()
   {
      $tag = "test";
      $attributes = array();
      $body = "";

      $this->givenABuilder();

      $this->whenCallingStart();
      $this->whenAddingNode($tag, $attributes, $body);
      $this->whenCallingFinish();

      $this->thenTheResultingPageShouldBe( $this->getHtmlPage("<" . $tag . "></" . $tag . ">\n", "") );
   }
}

