<?php
require_once 'db/sql/ParameterizedSqlText.php';
require_once 'db/sql/StandardSqlDictionary.php';

require_once 'db/sql/clause/NotClause.php';
require_once 'db/sql/clause/EqualsClause.php';
require_once 'db/sql/clause/ColumnClauseSubject.php';

class NotClauseTest extends PHPUnit_Framework_TestCase
{
   private $clause;

   protected function givenAnEqualsClause($columnName)
   {
      $subj = new \upro\db\sql\clause\ColumnClauseSubject($columnName);

      $this->clause = $subj->equals(new \upro\db\sql\clause\ColumnClauseSubject($columnName));
   }

   protected function whenCreatingTheNotClause()
   {
      $this->clause = new \upro\db\sql\clause\NotClause($this->clause);
   }

   protected function whenStackingNot()
   {
      $this->clause = $this->clause->isFalse();
   }

   protected function thenTheSqlTextShouldBe($expected)
   {
      $dict = new \upro\db\sql\StandardSqlDictionary();

      $result = $this->clause->toSqlText($dict);
      $this->assertEquals($expected, $result->getText());
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function testCreatedNot()
   {
      $this->givenAnEqualsClause('col1');

      $this->whenCreatingTheNotClause();

      $this->thenTheSqlTextShouldBe('NOT (col1 = col1)');
   }

   public function testCreatedNot_WithStacked()
   {
      $this->givenAnEqualsClause('col1');

      $this->whenStackingNot();

      $this->thenTheSqlTextShouldBe('NOT (col1 = col1)');
   }
}
