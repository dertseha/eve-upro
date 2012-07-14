<?php
require_once 'util/logging/LoggerProvider.php';
require_once 'util/logging/Logger.php';

class LoggerProviderTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{
	   parent::setUp();
	}

	public function testGetLoggerShouldUseNullLoggerFactory_WhenCalledWithoutSet()
	{
	   \upro\util\logging\LoggerProvider::setLoggerFactory(null);
	   $logger = \upro\util\logging\LoggerProvider::getLogger('test');

	   $this->assertSame(\upro\util\logging\NullLogger::getInstance(), $logger);
	}

	public function testGetLoggerShouldUseGivenFactory_WhenSet()
	{
	   $factory = function ($context)
	   {
	      return $context;
	   };

	   \upro\util\logging\LoggerProvider::setLoggerFactory($factory);

	   $logger = \upro\util\logging\LoggerProvider::getLogger('test');

	   $this->assertEquals('test', $logger);
	}
}