<?php
require_once 'db/sql/ParameterizedSqlText.php';
require_once 'db/sql/StandardSqlDictionary.php';

require_once 'db/sql/clause/OrClause.php';
require_once 'db/sql/clause/EqualsClause.php';
require_once 'db/sql/clause/ColumnClauseSubject.php';

class OrClauseTest extends PHPUnit_Framework_TestCase
{
   private $left;

   private $right;

   private $clause;

   protected function givenALeftEqualsClause($columnName)
   {
      $subj = new \upro\db\sql\clause\ColumnClauseSubject($columnName);

      $this->left = $subj->equals(new \upro\db\sql\clause\ColumnClauseSubject($columnName));
   }

   protected function givenARightEqualsClause($columnName)
   {
      $subj = new \upro\db\sql\clause\ColumnClauseSubject($columnName);

      $this->right = $subj->equals(new \upro\db\sql\clause\ColumnClauseSubject($columnName));
   }

   protected function whenCreatingTheOrClause()
   {
      $this->clause = new \upro\db\sql\clause\OrClause($this->left, $this->right);
   }

   protected function whenStackingOrWithLeft()
   {
      $this->clause = $this->clause->orThat($this->left);
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

   public function testCreatedOr()
   {
      $this->givenALeftEqualsClause('col1');
      $this->givenARightEqualsClause('col2');

      $this->whenCreatingTheOrClause();

      $this->thenTheSqlTextShouldBe('(col1 = col1) OR (col2 = col2)');
   }

   public function testCreatedOr_WithStacked()
   {
      $this->givenALeftEqualsClause('col1');
      $this->givenARightEqualsClause('col2');

      $this->whenCreatingTheOrClause();
      $this->whenStackingOrWithLeft();

      $this->thenTheSqlTextShouldBe('((col1 = col1) OR (col2 = col2)) OR (col1 = col1)');
   }
}
