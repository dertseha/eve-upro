<?php
require_once 'db/Connection.php';
require_once 'db/NullTableRowReader.php';
require_once 'db/sql/SelectQuery.php';
require_once 'db/sql/StandardSqlDictionary.php';
require_once 'db/executor/PreparedStatementExecutor.php';
require_once 'db/executor/SimpleResultSetHandler.php';

class PreparedStatementExecutorTest extends PHPUnit_Framework_TestCase
{
   private $connection;

   private $statement;

   private $executor;

   private $resultSet;

   protected function givenAConnectionProvidingAPreparedStatement()
   {
      $this->connection = $this->getMock('\upro\db\Connection');
      $this->statement = $this->getMock('\upro\db\PreparedStatement');
      $this->connection->expects($this->once())->method('getSqlDictionary')->will($this->returnValue(new \upro\db\sql\StandardSqlDictionary()));
      $this->connection->expects($this->once())->method('prepareStatement')->will($this->returnValue($this->statement));
   }

   protected function givenThePreparedStatementWillReturnAResultSet()
   {
      $this->resultSet = $this->getMock('\upro\db\ResultSet');
      $this->statement->expects($this->once())->method('execute')->will($this->returnValue($this->resultSet));
   }

   protected function givenAnExecutor()
   {
      $this->executor = new \upro\db\executor\PreparedStatementExecutor();
   }

   protected function expectingPreparedStatementToBeClosedOnce()
   {
      $this->statement->expects($this->once())->method('close');
   }

   protected function expectingPreparedStatementToBeGivenParameters($times)
   {
      $this->statement->expects($this->exactly($times))->method('setParameter');
   }

   protected function expectingResultSetIsReadAndClosed($reader)
   {
      $this->resultSet->expects($this->once())->method('read')->with($this->equalTo($reader));
      $this->resultSet->expects($this->once())->method('close');
   }

   protected function whenPreparingASimpleQuery()
   {
      $query = new \upro\db\sql\SelectQuery();
      $query->selectAll()->fromTable('TestTable');

      $this->executor->prepare($this->connection, $query);
   }

   protected function whenPreparingAParameterQuery($value)
   {
      $query = new \upro\db\sql\SelectQuery();

      $this->box = new \upro\db\sql\ParameterBox($value);
      $query->select(new \upro\db\sql\ParameterSelectExpression($this->box))->fromTable('TestTable');

      $this->executor->prepare($this->connection, $query);
   }

   protected function whenTheQueryParameterIsSetTo($value)
   {
      $this->box->setValue($value);
   }

   protected function whenClosingTheExecutor()
   {
      $this->executor->close();
   }

   protected function whenRunningTheExecutor($reader)
   {
      $this->executor->execute(new \upro\db\executor\SimpleResultSetHandler($reader));
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function testCloseDoesNothing_WhenNotPrepared()
   {
      $this->givenAnExecutor();

      $this->whenClosingTheExecutor();
   }

   public function testCloseClosesTheStatement_WhenPrepared()
   {
      $this->givenAConnectionProvidingAPreparedStatement();
      $this->givenAnExecutor();

      $this->expectingPreparedStatementToBeClosedOnce();

      $this->whenPreparingASimpleQuery();
      $this->whenClosingTheExecutor();
   }

   public function testStatementIsGivenParameters_WhenPrepared()
   {
      $this->givenAConnectionProvidingAPreparedStatement();
      $this->givenAnExecutor();

      $this->expectingPreparedStatementToBeGivenParameters(1);

      $this->whenPreparingAParameterQuery('test');
   }

   public function testStatementIsGivenParameter_AfterPreparation()
   {
      $this->givenAConnectionProvidingAPreparedStatement();
      $this->givenAnExecutor();

      $this->expectingPreparedStatementToBeGivenParameters(2);

      $this->whenPreparingAParameterQuery('test');
      $this->whenTheQueryParameterIsSetTo(20);
   }

   public function testResultSetIsRead_WhenExecuted()
   {
      $reader = new \upro\db\NullTableRowReader();

      $this->givenAConnectionProvidingAPreparedStatement();
      $this->givenThePreparedStatementWillReturnAResultSet();
      $this->givenAnExecutor();

      $this->expectingResultSetIsReadAndClosed($reader);

      $this->whenPreparingAParameterQuery('test');
      $this->whenRunningTheExecutor($reader);
   }
}