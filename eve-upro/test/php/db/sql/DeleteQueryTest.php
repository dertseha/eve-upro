<?php
require_once 'PHPUnit.php';

require_once 'db/sql/StandardSqlDictionary.php';
require_once 'db/sql/DeleteQuery.php';

require_once 'db/sql/ParameterBox.php';

require_once 'db/sql/clause/ColumnClauseSubject.php';
require_once 'db/sql/clause/EqualsClause.php';

class DeleteQueryTest extends PHPUnit_Framework_TestCase
{
   private $query;

   protected function givenADeleteStatement()
   {
      $this->query = new \upro\db\sql\DeleteQuery();
   }

   protected function whenDeletingFromTable($tableName)
   {
      $this->query->deleteFromTable($tableName);
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

   public function testDelete_NoClause()
   {
      $this->givenADeleteStatement();

      $this->whenDeletingFromTable('TestTable');

      $this->thenTheSqlTextShouldBe('DELETE FROM TestTable');
   }

   public function testDelete_WithWhere()
   {
      $this->givenADeleteStatement();

      $this->whenDeletingFromTable('TestTable');

      $subj = new \upro\db\sql\clause\ColumnClauseSubject("OtherColumn");
      $box = new \upro\db\sql\ParameterBox("test1");
      $this->whenClauseIs($subj->equalsParameter($box));

      $this->thenTheSqlTextShouldBe('DELETE FROM TestTable WHERE OtherColumn = ?');
   }
}
