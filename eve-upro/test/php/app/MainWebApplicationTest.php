<?php
require_once 'PHPUnit.php';

require_once 'BufferPrintStream.php';
require_once 'TestWebAppContext.php';

require_once 'app/MainWebApplication.php';

class MainWebApplicationTest extends PHPUnit_Framework_TestCase
{
   private $printStream;

   private $context;

   private $app;

   protected function givenAnApplication()
   {
      $this->app = new \upro\app\MainWebApplication();
   }

   protected function whenRunningTheApp()
   {
      $this->app->run($this->context);
   }

   protected function thenTheOutputShouldContain($expected)
   {
      $result = $this->printStream->toString();

      $this->assertTrue(strpos($result, $expected) != FALSE);
   }

   public function setUp()
   {
      $this->printStream = new BufferPrintStream();
      $this->context = new TestWebAppContext($this->printStream);
   }

   public function testTitleSet_WhenRunningBasic()
   {
      $this->givenAnApplication();

      $this->whenRunningTheApp();

      $this->thenTheOutputShouldContain("<title>upro</title>");
   }
}
