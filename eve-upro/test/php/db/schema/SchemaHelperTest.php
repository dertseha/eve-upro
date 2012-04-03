<?php
require_once 'PHPUnit.php';

require_once 'db/schema/SchemaHelper.php';

class SchemaHelperTest extends PHPUnit_Framework_TestCase
{
   private $dataTypeString;

   private $dataTypeSplit;

   private $dataType;

   protected function givenADataTypeString($dataTypeString)
   {
      $this->dataTypeString = $dataTypeString;
   }

   protected function whenDataTypeStringIsSplit()
   {
      $this->dataTypeSplit = \upro\db\schema\SchemaHelper::splitDataType($this->dataTypeString);
   }

   protected function thenTheSplitDataTypeNameShouldBe($expected)
   {
      $this->assertEquals($expected, $this->dataTypeSplit[0]);
   }

   protected function thenTheSplitDataTypeSizeShouldBe($expected)
   {
      $this->assertEquals($expected, $this->dataTypeSplit[1]);
   }

   protected function whenParsingTheDataType()
   {
      $this->dataType = \upro\db\schema\SchemaHelper::parseDataType($this->dataTypeString);
   }

   protected function thenTheSqlTextOfTheDataTypeShouldBe($expected)
   {
      $result = $this->dataType->getSqlText();

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function testSplitNameIsSet_WhenBigint()
   {
      $this->givenADataTypeString('BIGINT');

      $this->whenDataTypeStringIsSplit();

      $this->thenTheSplitDataTypeNameShouldBe('BIGINT');
   }

   public function testSplitNameIsSet_WhenVarchar()
   {
      $this->givenADataTypeString('VARCHAR(256)');

      $this->whenDataTypeStringIsSplit();

      $this->thenTheSplitDataTypeNameShouldBe('VARCHAR');
   }

   public function testSplitSizeIsSet_WhenVarchar()
   {
      $this->givenADataTypeString('VARCHAR(256)');

      $this->whenDataTypeStringIsSplit();

      $this->thenTheSplitDataTypeSizeShouldBe(256);
   }

   public function testSplitSizeIsSet_WhenVarcharWithCharset()
   {
      $this->givenADataTypeString('VARCHAR(256) CHARACTER SET utf8');

      $this->whenDataTypeStringIsSplit();

      $this->thenTheSplitDataTypeSizeShouldBe(256);
   }

   public function testParseDataTypeIsValid_WhenVarchar()
   {
      $this->givenADataTypeString('VARCHAR(256)');

      $this->whenParsingTheDataType();

      $this->thenTheSqlTextOfTheDataTypeShouldBe('VARCHAR(256)');
   }
}
