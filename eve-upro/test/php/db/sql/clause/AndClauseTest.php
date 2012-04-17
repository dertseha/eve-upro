<?php
require_once 'db/sql/ParameterizedSqlText.php';
require_once 'db/sql/StandardSqlDictionary.php';

require_once 'db/sql/clause/AndClause.php';
require_once 'db/sql/clause/EqualsClause.php';
require_once 'db/sql/clause/ColumnClauseSubject.php';

class AndClauseTest extends PHPUnit_Framework_TestCase
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

   protected function whenCreatingTheAndClause()
   {
      $this->clause = new \upro\db\sql\clause\AndClause($this->left, $this->right);
   }

   protected function whenStackingAndWithLeft()
   {
      $this->clause = $this->clause->andThat($this->left);
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

   public function testCreatedAnd()
   {
      $this->givenALeftEqualsClause('col1');
      $this->givenARightEqualsClause('col2');

      $this->whenCreatingTheAndClause();

      $this->thenTheSqlTextShouldBe('(col1 = col1) AND (col2 = col2)');
   }

   public function testCreatedAnd_WithStacked()
   {
      $this->givenALeftEqualsClause('col1');
      $this->givenARightEqualsClause('col2');

      $this->whenCreatingTheAndClause();
      $this->whenStackingAndWithLeft();

      $this->thenTheSqlTextShouldBe('(col1 = col1) AND (col2 = col2) AND (col1 = col1)');
   }
}
