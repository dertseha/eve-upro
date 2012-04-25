<?php
require_once 'web/StandardSessionControl.php';

class StandardSessionControlTest extends PHPUnit_Framework_TestCase
{
   /**
    * @var \upro\web\StandardSessionControl
    */
   private $control;

   protected function givenAStandardSessionControl()
   {
      $startStrategy = $this->getMock('\upro\web\SessionStartStrategy');
      $this->control = new \upro\web\StandardSessionControl($startStrategy);
   }

   protected function whenSettingSessionValue($key, $value)
   {
      $this->control->getValueStore()->set($key, $value);
   }

   protected function thenSessionArrayContains($key, $expected)
   {
      $this->assertEquals($expected, $_SESSION[$key]);
   }

   function setUp()
   {
      parent::setUp();
   }

   public function testSessionStorageIsWrappedWithPrefix_WhenCreated()
   {
      $this->givenAStandardSessionControl();

      $this->whenSettingSessionValue('test', 1234);

      $this->thenSessionArrayContains('upro_test', 1234);
   }
}