<?php
require_once 'web/StandardRequestServerContext.php';

class StandardRequestServerContextTest extends PHPUnit_Framework_TestCase
{
   function setUp()
   {
      parent::setUp();
   }

   public function testRemoteAddressShouldBeAccessible_WhenUsingFactory()
   {
      $value = '10.20.30.40';
      $_SERVER['REMOTE_ADDR'] = $value;
      $context = \upro\web\StandardRequestServerContext::factory();

      $this->assertEquals($value, $context->getRemoteAddress());
   }

   public function testUserAgentShouldBeAccessible_WhenUsingFactory()
   {
      $value = 'UberBrowser Ver.9001';
      $_SERVER['HTTP_USER_AGENT'] = $value;
      $context = \upro\web\StandardRequestServerContext::factory();

      $this->assertEquals($value, $context->getUserAgent());
   }
}