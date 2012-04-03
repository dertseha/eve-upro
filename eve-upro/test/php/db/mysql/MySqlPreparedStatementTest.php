<?php
require_once 'db/DatabaseException.php';

require_once 'MySqlBasedTest.php';

class MySqlPreparedStatementTest extends MySqlBasedTest
{
   private $statement;

   protected function givenADatabaseForTest()
   {
      $this->getConnection()->setDatabase($this->getTestDatabaseName());
   }

   protected function whenPreparingAStatement($query)
   {
      $this->statement = $this->getConnection()->prepareStatement($query);
   }

   protected function whenCreatingAForgedPrepareStatement($query, $name, $registered)
   {
      if ($registered)
      {
         $this->getConnection()->executeIgnoreResult('PREPARE ' . $name . ' FROM "' . $query . '"');
      }
      $this->statement = new \upro\db\mysql\MySqlPreparedStatement($this->getConnection(), $name);
   }

   protected function whenTheStatementGetsClosed()
   {
      $this->statement->close();
   }

   protected function thenPrepareStatementShouldThrowAnException($query)
   {
      try
      {
         $this->getConnection()->prepareStatement($query);
         $this->fail("No Exception");
      }
      catch (\upro\db\DatabaseException $ex)
      {

      }
   }

   protected function thenExecuteShouldThrowAnException()
   {
      try
      {
         $this->statement->execute();
         $this->fail("No Exception");
      }
      catch (\upro\db\DatabaseException $ex)
      {

      }
   }

   protected function thenExecuteShouldReturnTrue()
   {
      $result = $this->statement->execute();

      $this->assertEquals(TRUE, $result);
   }

   protected function whenStatementIsExecuted()
   {
      $result = $this->statement->execute();
      if (is_a($result, "\\upro\\db\\mysql\MySqlResultSet"))
      {
         $result->close();
      }
   }

   protected function thenExecuteShouldReturnResultSet()
   {
      $result = $this->statement->execute();

      $this->assertTrue(is_a($result, "\\upro\\db\\mysql\MySqlResultSet"));
      $result->close();
   }

   protected function whenSettingAParameter($index, $value)
   {
      $this->statement->setParameter($index, $value);
   }

   public function setUp()
   {
      parent::setUp();

      $this->statement = null;
   }

   public function tearDown()
   {
      if ($this->statement != null)
      {
         try
         {
            $this->statement->close();
         }
         catch (\upro\db\DatabaseException $ex)
         {

         }
      }

      parent::tearDown();
   }

   public function testPrepareStatementShouldThrowException_WhenInvalidStatement()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->thenPrepareStatementShouldThrowAnException('this should not work.');
   }

   public function testExecuteThrowsException_WhenClosed()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenPreparingAStatement('SELECT 1');
      $this->whenTheStatementGetsClosed();

      $this->thenExecuteShouldThrowAnException();
   }

   public function testExecuteReturnsTrue_WhenRunningNoDataQueryStatement()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenPreparingAStatement('SET @test = 1234');

      $this->thenExecuteShouldReturnTrue();
   }

   public function testExecuteReturnsResultSet_WhenRunningDataQueryStatement()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenPreparingAStatement('SELECT 1234');

      $this->thenExecuteShouldReturnResultSet();
   }

   public function testExecuteThrowsException_WhenMissingParameter()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenPreparingAStatement('SET @test = ?');

      $this->thenExecuteShouldThrowAnException();
   }

   public function testStatementNameIsInvalid_WhenClosed()
   {
      $name = 'TestStatement';

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenCreatingAForgedPrepareStatement('SET @test = 1234', $name, TRUE);
      $this->whenTheStatementGetsClosed();
      $this->whenCreatingAForgedPrepareStatement('SET @test = 5678', $name, FALSE);

      $this->thenExecuteShouldThrowAnException();
   }

   public function testExecuteCanBeRepeated_WhenNotClosed()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenPreparingAStatement('SET @test = 1234');
      $this->whenStatementIsExecuted();

      $this->thenExecuteShouldReturnTrue();
   }

   public function testPlaceholderWork_WhenParameterSet()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenPreparingAStatement('SET @test = ?');
      $this->whenSettingAParameter(0, 1111);

      $this->thenExecuteShouldReturnTrue();
   }

   public function testTwoPlaceholderWork_WhenParameterSet()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenPreparingAStatement('SET @test = ? + ?');
      $this->whenSettingAParameter(0, 2222);
      $this->whenSettingAParameter(1, 8);

      $this->thenExecuteShouldReturnTrue();
   }
}
