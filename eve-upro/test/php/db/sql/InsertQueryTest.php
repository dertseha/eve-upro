<?php
require_once 'db/sql/ParameterizedSqlText.php';
require_once 'db/sql/StandardSqlDictionary.php';
require_once 'db/sql/InsertQuery.php';

require_once 'db/sql/ParameterBox.php';
require_once 'db/sql/ParameterValueExpression.php';

class InsertQueryTest extends PHPUnit_Framework_TestCase
{
   private $query;

   protected function givenAnInsertStatement()
   {
      $this->query = new \upro\db\sql\InsertQuery();
   }

   protected function whenFillingTable($tableName)
   {
      $this->query->intoTable($tableName);
   }

   protected function whenSettingColumn($columnName)
   {
      $this->query->columnName($columnName);
   }

   protected function whenSettingTestValue($value)
   {
      $valueSource = new \upro\db\sql\ParameterValueExpression(new \upro\db\sql\ParameterBox($value));

      $this->query->value($valueSource);
   }

   protected function thenTheSqlTextShouldBe($expected)
   {
      $dict = new \upro\db\sql\StandardSqlDictionary();

      $result = $this->query->toSqlText($dict);
      $this->assertEquals($expected, $result->getText());
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function testInsert_IntoTable_NoColumns()
   {
      $this->givenAnInsertStatement();

      $this->whenFillingTable('TestTable');

      $this->thenTheSqlTextShouldBe('INSERT INTO TestTable () VALUES ()');
   }

   public function testInsert_IntoTable_OneColumn()
   {
      $this->givenAnInsertStatement();

      $this->whenFillingTable('TestTable');
      $this->whenSettingColumn('TestColumn1');

      $this->thenTheSqlTextShouldBe('INSERT INTO TestTable (TestColumn1) VALUES ()');
   }

   public function testInsert_IntoTable_TwoColumns()
   {
      $this->givenAnInsertStatement();

      $this->whenFillingTable('TestTable');
      $this->whenSettingColumn('TestColumn1');
      $this->whenSettingColumn('TestColumn2');

      $this->thenTheSqlTextShouldBe('INSERT INTO TestTable (TestColumn1, TestColumn2) VALUES ()');
   }

   public function testInsert_IntoTable_WithData()
   {
      $this->givenAnInsertStatement();

      $this->whenFillingTable('TestTable');
      $this->whenSettingTestValue(1);
      $this->whenSettingTestValue(2);

      $this->thenTheSqlTextShouldBe('INSERT INTO TestTable () VALUES (?, ?)');
   }
}
