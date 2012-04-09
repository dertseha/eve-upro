<?php
require_once 'db/sql/ParameterBox.php';
require_once 'db/executor/ParameterBoxBinder.php';

class ParameterBoxBinderTest extends PHPUnit_Framework_TestCase
{
   private $statement;

   /**
    * @var \upro\db\sql\ParameterBox
    */
   private $box;

   /**
    * @var \upro\db\executor\ParameterBoxBinder
    */
   private $binder;

   protected function givenAPreparedStatementWithExpectations($at, $index, $value)
   {
      $this->statement = $this->getMock('\upro\db\PreparedStatement');
      $this->statement->expects($this->at($at))->method('setParameter')->with($this->equalTo($index), $this->equalTo($value));
   }

   protected function givenAParameterBox($value)
   {
      $this->box = new \upro\db\sql\ParameterBox($value);
   }

   protected function givenAParameterBoxBinder($index)
   {
      $this->binder = new \upro\db\executor\ParameterBoxBinder($this->statement, $index);
   }

   protected function whenSettingBox()
   {
      $this->binder->forBox($this->box);
   }

   protected function whenSettingValue($value)
   {
      $this->box->setValue($value);
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function testStatementCalled_WhenSetUp()
   {
      $value = 10;
      $index = 2;

      $this->givenAPreparedStatementWithExpectations(0, $index, $value);
      $this->givenAParameterBox($value);
      $this->givenAParameterBoxBinder($index);

      $this->whenSettingBox();
   }

   public function testStatementCalled_WhenValueChanged()
   {
      $value = 10;
      $index = 2;

      $this->givenAPreparedStatementWithExpectations(1, $index, $value);
      $this->givenAParameterBox('test');
      $this->givenAParameterBoxBinder($index);

      $this->whenSettingBox();
      $this->whenSettingValue($value);
   }
}