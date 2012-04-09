<?php
require_once 'Uuid.php';

class UuidTest extends PHPUnit_Framework_TestCase
{
	public function setUp()
	{

	}

	public function testEmptyUuidIsAllZeroes()
	{
	   $this->assertEquals('00000000-0000-0000-0000-000000000000', Uuid::EMPTY_UUID);
	}

	public function testIsValidShouldReturnTrue_ForEmptyUuid()
	{
	   $this->assertTrue(Uuid::isValid(Uuid::EMPTY_UUID));
	}

	public function testV4IsValidByLength()
	{
	   $temp = Uuid::v4();

	   $this->assertEquals(36, strlen($temp));
	}

	public function testV3IsValid()
	{
	   $result = Uuid::v3(Uuid::EMPTY_UUID, 'Test');

	   $this->assertEquals('7a8bf5d2-2e33-34ec-8af5-d3636b55e1fe', $result);
	}

	public function testV5IsValid()
	{
	   $result = Uuid::v5(Uuid::EMPTY_UUID, 'Test');

	   $this->assertEquals('5b23436d-8e7c-51cf-8162-5cd5fd379ecf', $result);
	}
}
