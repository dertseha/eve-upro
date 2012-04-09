<?php
require_once 'db/sql/ParameterizedSqlText.php';
require_once 'db/sql/StandardSqlDictionary.php';
require_once 'db/sql/SelectQuery.php';

require_once 'db/sql/clause/ColumnClauseSubject.php';
require_once 'db/sql/clause/EqualsClause.php';

class SelectQueryTest extends PHPUnit_Framework_TestCase
{
   private $query;

   protected function givenASelectStatement()
   {
      $this->query = new \upro\db\sql\SelectQuery();
   }

   protected function whenSelectingAConstant($value)
   {
      $this->query->selectConstant($value);
   }

   protected function whenSelectingColumn($columnName)
   {
      $this->query->selectColumn($columnName);
   }

   protected function whenClauseIs($clause)
   {
      $this->query->where($clause);
   }

   protected function whenSelectingAll()
   {
      $this->query->selectAll();
   }

   protected function whenQueryingTable($tableName)
   {
      $this->query->fromTable($tableName);
   }

   protected function whenOrderingByColumn($columnName)
   {
      $this->query->orderByColumn($columnName);
   }

   protected function whenOrderingByColumnDescending($columnName)
   {
      $this->query->orderByColumn($columnName, false);
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

   public function testSelect_AValue()
   {
      $this->givenASelectStatement();

      $this->whenSelectingAConstant(1);

      $this->thenTheSqlTextShouldBe('SELECT ?');
   }

   public function testSelect_TwoValues()
   {
      $this->givenASelectStatement();

      $this->whenSelectingAConstant(1);
      $this->whenSelectingAConstant(2);

      $this->thenTheSqlTextShouldBe('SELECT ?, ?');
   }

   public function testSelect_All_FromTable()
   {
      $this->givenASelectStatement();

      $this->whenSelectingAll();
      $this->whenQueryingTable("TestTable");

      $this->thenTheSqlTextShouldBe('SELECT * FROM TestTable');
   }

   public function testSelect_Column_FromTable()
   {
      $this->givenASelectStatement();

      $this->whenSelectingColumn("TestColumn");
      $this->whenQueryingTable("TestTable");

      $this->thenTheSqlTextShouldBe('SELECT TestColumn FROM TestTable');
   }

   public function testSelect_Column_FromTable_WithWhere()
   {
      $this->givenASelectStatement();

      $this->whenSelectingColumn("TestColumn");
      $this->whenQueryingTable("TestTable");

      $subj = new \upro\db\sql\clause\ColumnClauseSubject("OtherColumn");
      $box = new \upro\db\sql\ParameterBox("test1");
      $this->whenClauseIs($subj->equalsParameter($box));

      $this->thenTheSqlTextShouldBe('SELECT TestColumn FROM TestTable WHERE OtherColumn = ?');
   }

   public function testSelect_All_FromTable_OrderByColumn()
   {
      $this->givenASelectStatement();

      $this->whenSelectingAll();
      $this->whenQueryingTable("TestTable");
      $this->whenOrderingByColumn('TestColumn');

      $this->thenTheSqlTextShouldBe('SELECT * FROM TestTable ORDER BY TestColumn ASC');
   }

   public function testSelect_All_FromTable_OrderByTowColumns()
   {
      $this->givenASelectStatement();

      $this->whenSelectingAll();
      $this->whenQueryingTable("TestTable");
      $this->whenOrderingByColumn('TestColumn1');
      $this->whenOrderingByColumnDescending('TestColumn2');

      $this->thenTheSqlTextShouldBe('SELECT * FROM TestTable ORDER BY TestColumn1 ASC, TestColumn2 DESC');
   }
}
