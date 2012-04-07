<?php
require_once 'PHPUnit.php';

require_once 'db/sql/ParameterBox.php';
require_once 'db/sql/ParameterBoxObserver.php';

class ParameterBoxTest extends PHPUnit_Framework_TestCase
{
   /**
    * @var \upro\db\sql\ParameterBox
    */
   private $box;

   /**
    * @var \upro\db\sql\ParameterBoxObserver
    */
   private $observer;

   protected function givenAParameterBox()
   {
      $this->box = new \upro\db\sql\ParameterBox();
   }

   protected function givenAParameterBoxObserver()
   {
      $this->observer = $this->getMock('\upro\db\sql\ParameterBoxObserver');
   }

   protected function expectingObserverCalledTimes($times)
   {
      $this->observer->expects($this->exactly($times))->method('onValueChanged');
   }

   protected function expectingObserverCalledWith($at, $expected)
   {
      $this->observer->expects($this->at($at))->method('onValueChanged')->with($this->equalTo($expected));
   }

   protected function whenSettingValue($value)
   {
      $this->box->setValue($value);
   }

   protected function whenRegisteringTheObserver()
   {
      $this->box->addObserver($this->observer);
   }

   protected function thenGetValueShouldReturn($expected)
   {
      $result = $this->box->getValue();

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function testGetValueShouldReturnNull_WhenConstructed()
   {
      $this->givenAParameterBox();

      $this->thenGetValueShouldReturn(null);
   }

   public function testGetValueShouldReturnValue_WhenSet()
   {
      $value = 10;

      $this->givenAParameterBox();

      $this->whenSettingValue($value);

      $this->thenGetValueShouldReturn($value);
   }

   public function testGetValueShouldReturnValue_WhenSetAgain()
   {
      $value = 10;

      $this->givenAParameterBox();

      $this->whenSettingValue('first');
      $this->whenSettingValue($value);

      $this->thenGetValueShouldReturn($value);
   }

   public function testObserverCalledOnce_WhenRegistered()
   {
      $this->givenAParameterBox();
      $this->givenAParameterBoxObserver();

      $this->expectingObserverCalledTimes(1);

      $this->whenRegisteringTheObserver();
   }

   public function testObserverCalledOnlyOnce_WhenReRegistered()
   {
      $this->givenAParameterBox();
      $this->givenAParameterBoxObserver();

      $this->expectingObserverCalledTimes(1);

      $this->whenRegisteringTheObserver();
      $this->whenRegisteringTheObserver();
   }

   public function testObserverCalled_WhenValueChanged()
   {
      $this->givenAParameterBox();
      $this->givenAParameterBoxObserver();

      $this->expectingObserverCalledTimes(2);

      $this->whenRegisteringTheObserver();
      $this->whenSettingValue(10);
   }

   public function testObserverCalledWithNewValue_WhenValueChanged()
   {
      $value = 10;

      $this->givenAParameterBox();
      $this->givenAParameterBoxObserver();

      $this->expectingObserverCalledWith(1, $value);

      $this->whenRegisteringTheObserver();
      $this->whenSettingValue($value);
   }
}
