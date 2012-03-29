<?php
require_once 'PHPUnit.php';

require_once 'db/sql/ParameterizedSqlText.php';
require_once 'db/sql/StandardSqlDictionary.php';
require_once 'db/sql/UpdateQuery.php';

require_once 'db/sql/ParameterBox.php';
require_once 'db/sql/ParameterValueExpression.php';

require_once 'db/sql/clause/ColumnClauseSubject.php';
require_once 'db/sql/clause/EqualsClause.php';

class UpdateQueryTest extends PHPUnit_Framework_TestCase
{
   private $query;

   protected function givenAnUpdateStatement()
   {
      $this->query = new \upro\db\sql\UpdateQuery();
   }

   protected function whenUpdatingTable($tableName)
   {
      $this->query->updateTable($tableName);
   }

   protected function whenSettingColumn($columnName, $value)
   {
      $valueSource = new \upro\db\sql\ParameterValueExpression(new \upro\db\sql\ParameterBox($value));

      $this->query->set($columnName, $valueSource);
   }

   protected function whenClauseIs($clause)
   {
      $this->query->where($clause);
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

   public function testUpdate_NoData()
   {
      $this->givenAnUpdateStatement();

      $this->whenUpdatingTable('TestTable');

      $this->thenTheSqlTextShouldBe('UPDATE TestTable');
   }

   public function testUpdate_OneColumn()
   {
      $this->givenAnUpdateStatement();

      $this->whenUpdatingTable('TestTable');
      $this->whenSettingColumn('TestColumn1', 1);

      $this->thenTheSqlTextShouldBe('UPDATE TestTable SET TestColumn1 = ?');
   }

   public function testUpdate_TwoColumns()
   {
      $this->givenAnUpdateStatement();

      $this->whenUpdatingTable('TestTable');
      $this->whenSettingColumn('TestColumn1', 1);
      $this->whenSettingColumn('TestColumn2', 2);

      $this->thenTheSqlTextShouldBe('UPDATE TestTable SET TestColumn1 = ?, TestColumn2 = ?');
   }

   public function testUpdate_OneColumn_WithWhere()
   {
      $this->givenAnUpdateStatement();

      $this->whenUpdatingTable('TestTable');
      $this->whenSettingColumn('TestColumn1', 1);

      $subj = new \upro\db\sql\clause\ColumnClauseSubject("OtherColumn");
      $box = new \upro\db\sql\ParameterBox("test1");
      $this->whenClauseIs($subj->equalsParameter($box));

      $this->thenTheSqlTextShouldBe('UPDATE TestTable SET TestColumn1 = ? WHERE OtherColumn = ?');
   }
}
