<?php
require_once 'PHPUnit.php';

require_once 'Uuid.php';

class UuidTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{

	}

	public function tearDown()
	{

	}

	public function testCreateV4HasProperLength()
	{
		$temp = Uuid::v4();

		$this->assertEquals(36, strlen($temp));
	}
}
