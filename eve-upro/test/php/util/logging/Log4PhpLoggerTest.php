<?php
require_once 'util/logging/Logger.php';
require_once 'util/logging/Log4PhpLogger.php';

class TestConfigurator implements LoggerConfigurator
{

   public function configure(LoggerHierarchy $hierarchy, $input = null)
   {
      /*
      $layout = new LoggerLayoutTTCC();
      $layout->setContextPrinting(false);
      $layout->setDateFormat('%Y-%m-%d %H:%M:%S');
      $layout->activateOptions();
      */
      $layout = new LoggerLayoutPattern();
      $layout->setConversionPattern('%p %m');
      $layout->activateOptions();


      // Create an appender
      $appEcho = new LoggerAppenderEcho('testAppender');
      $appEcho->setLayout($layout);
      $appEcho->setThreshold($input['threshold']);
      $appEcho->activateOptions();

      // Add appender to root
      $root = $hierarchy->getRootLogger();
      $root->addAppender($appEcho);
   }
}

class Log4PhpLoggerTest extends PHPUnit_Framework_TestCase
{
   public static $echoBuffer;

   private $isBuffering;

   private $logger;

   protected function givenATestConfiguration($threshold = 'info')
   {
      \Logger::configure(array('threshold' => $threshold), new TestConfigurator());
   }

   protected function givenALogger()
   {
      $this->logger = \upro\util\logging\Log4PhpLogger::getLogger('test');
   }

   protected function whenLoggingSomeSimpleInfo($text)
   {
	   $this->logger->info($text);
   }

   protected function whenLoggingSomeComplexInfo($text, $value)
   {
      $this->logger->info($text, $value);
   }

   protected function thenTheLogShouldBe($expected)
   {
	   $this->stopBuffering();

      $this->assertEquals($expected, Log4PhpLoggerTest::$echoBuffer);
   }

   private function stopBuffering()
   {
      if ($this->isBuffering)
      {
         ob_end_flush();
         $this->isBuffering = false;
      }
   }

	public function setUp()
	{
	   parent::setUp();

	   Log4PhpLoggerTest::$echoBuffer = array();
	   $echoFunc = function ($line, $param)
	   {
	      Log4PhpLoggerTest::$echoBuffer[] = $line;
	   };
	   ob_start($echoFunc);
	   $this->isBuffering = true;
	}

	public function tearDown()
	{
	   $this->stopBuffering();

	   parent::tearDown();
	}

	public function testEchoBufferShouldWork_WhenSane()
	{
	   $test = 'Hello World';

	   echo $test;

	   $this->thenTheLogShouldBe(array($test));
	}

	public function testGetLoggerShouldReturnObject_WhenCalled()
	{
	   $logger = \upro\util\logging\Log4PhpLogger::getLogger('test');

	   $this->assertNotNull($logger);
	}

	public function testInfoLogShouldEndUpInBuffer_WhenCalledWithSimpleInfo()
	{
	   $this->givenATestConfiguration();
	   $this->givenALogger();

	   $this->whenLoggingSomeSimpleInfo('test');

	   $this->thenTheLogShouldBe(array('INFO test'));
	}

	public function testInfoLogShouldEndUpInBuffer_WhenCalledWithComplexInfo()
	{
	   $this->givenATestConfiguration();
	   $this->givenALogger();

	   $this->whenLoggingSomeComplexInfo('complex %d', 1);

	   $this->thenTheLogShouldBe(array('INFO complex 1'));
	}

	public function testInfoLogShouldNotEndUpInBuffer_WhenLimitedByLevel()
	{
	   $this->givenATestConfiguration('warn');
	   $this->givenALogger();

	   $this->whenLoggingSomeSimpleInfo('test');

	   $this->thenTheLogShouldBe(array(''));
	}
}