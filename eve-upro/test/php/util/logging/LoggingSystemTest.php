<?php
require_once 'io/ArrayValueStore.php';
require_once 'util/logging/LoggingSystem.php';

class LoggingSystemTest extends PHPUnit_Framework_TestCase
{
   private $configData;

   private $config;

   protected function givenAnEmptyConfiguration()
   {

   }

   protected function givenADefaultConfiguration()
   {
      $this->config->set(\upro\util\logging\LoggingSystem::CONFIG_SUBSET_NAME . \upro\util\logging\LoggingSystem::CONFIG_KEY_LOGGER_CLASS,
            \upro\util\logging\LoggingSystem::DEFAULT_LOGGER_CLASS);

   }

   protected function givenASpecificConfiguration($loggerClass)
   {
      $this->config->set(\upro\util\logging\LoggingSystem::CONFIG_SUBSET_NAME . \upro\util\logging\LoggingSystem::CONFIG_KEY_LOGGER_CLASS,
            $loggerClass);
   }

   protected function whenCallingInitialize()
   {
      \upro\util\logging\LoggingSystem::initialize($this->config);
   }

   protected function thenTheReturnedLoggerShouldBeTheDefaultLogger()
   {
      $log = \upro\util\logging\LoggerProvider::getLogger('test');

      $this->assertEquals('upro\util\logging\Log4PhpLogger', get_class($log));
   }

   protected function thenTheReturnedLoggerShouldBeTheNullLogger()
   {
      $log = \upro\util\logging\LoggerProvider::getLogger('test');

      $this->assertEquals('upro\util\logging\NullLogger', get_class($log));
   }

	public function setUp()
	{
	   parent::setUp();

	   $this->configData = array();
	   $this->config = new \upro\io\ArrayValueStore($this->configData);
	}

	public function testInitializeShouldSetUpDefaultLogger_WhenCalledWithEmptyConfiguration()
	{
	   $this->givenAnEmptyConfiguration();

	   $this->whenCallingInitialize();

	   $this->thenTheReturnedLoggerShouldBeTheDefaultLogger();
	}

	public function testInitializeShouldSetUpDefaultLogger_WhenCalledWithDefaultConfiguration()
	{
	   $this->givenADefaultConfiguration();

	   $this->whenCallingInitialize();

	   $this->thenTheReturnedLoggerShouldBeTheDefaultLogger();
	}

	public function testInitializeShouldSetUpNullLogger_WhenCalledWithExplicitConfiguration()
	{
	   $this->givenASpecificConfiguration('\upro\util\logging\NullLogger');

	   $this->whenCallingInitialize();

	   $this->thenTheReturnedLoggerShouldBeTheNullLogger();
	}

}