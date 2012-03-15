<?php
require_once 'db/DatabaseException.php';
require_once 'db/TableRowReader.php';
require_once 'db/mysql/MySqlResultSet.php';

require_once 'MySqlBasedTest.php';

class TestTableRowReader implements \upro\db\TableRowReader
{
   private $rows;

   function __construct()
   {
      $this->rows = array();
   }

   public function receive($data)
   {
      $this->rows[] = $data;
   }

   public function getRowCount()
   {
      return count($this->rows);
   }

   public function getRow($index)
   {
      return $this->rows[$index];
   }
}

class MySqlResultSetTest extends MySqlBasedTest
{
   private $statement;

   private $result;

   private $reader;

   protected function givenADatabaseForTest()
   {
      $this->getConnection()->setDatabase('upro_unittests');
   }

   protected function givenAPreparedStatement($query)
   {
      $this->statement = $this->getConnection()->prepareStatement($query);
   }

   protected function whenStatementIsExecuted()
   {
      $this->result = $this->statement->execute();
   }

   protected function thenGetColumnsByNameShouldReturn($expected)
   {
      $result = $this->result->getColumnsByName();

      $this->assertEquals($expected, $result);
   }

   protected function whenResultSetIsClosed()
   {
      $this->result->close();
   }

   protected function whenExtractingData()
   {
      $this->reader = new TestTableRowReader();
      $this->result->read($this->reader);
   }

   protected function thenCallingReadShouldThrowAnException()
   {
      $this->reader = new TestTableRowReader();
      try
      {
         $this->result->read($this->reader);
         fail("No Exception");
      }
      catch (\upro\db\DatabaseException $ex)
      {

      }
   }

   protected function thenReceivedRowAmountShouldBe($expected)
   {
      $result = $this->reader->getRowCount();

      $this->assertEquals($expected, $result);
   }

   protected function thenSpecificRowShouldBe($index, $expected)
   {
      $result = $this->reader->getRow($index);

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {
      parent::setUp();
   }

   public function tearDown()
   {
      if ($this->result != null)
      {
         try
         {

         }
         catch (\upro\db\DatabaseException $ex)
         {
            $this->result->close();
         }
      }
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

   public function testGetColumnsByNameShouldReturnArray_WhenUnnamedColumnsExist()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenAPreparedStatement('SELECT 1, "a"');

      $this->whenStatementIsExecuted();

      $this->thenGetColumnsByNameShouldReturn(array('1' => 0, 'a' => 1));
   }

   public function testReadThrowsException_WhenClosed()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenAPreparedStatement('SELECT 1, "a"');

      $this->whenStatementIsExecuted();
      $this->whenResultSetIsClosed();

      $this->thenCallingReadShouldThrowAnException();
   }

   public function testReaderShouldReceiveAllRows_WhenReadingData()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenAPreparedStatement('SELECT 1, "a"');

      $this->whenStatementIsExecuted();
      $this->whenExtractingData();

      $this->thenReceivedRowAmountShouldBe(1);
   }

   public function testReaderShouldBeEmpty_WhenReadingDataTwice()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenAPreparedStatement('SELECT 1, "a"');

      $this->whenStatementIsExecuted();
      $this->whenExtractingData();
      $this->whenExtractingData();

      $this->thenReceivedRowAmountShouldBe(0);
   }

   public function testReaderShouldContainData_WhenReadingData()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenAPreparedStatement('SELECT 1, "a"');

      $this->whenStatementIsExecuted();
      $this->whenExtractingData();

      $this->thenSpecificRowShouldBe(0, array(1, "a"));
   }

   public function testReaderShouldContainData_WhenReadingMultilineData()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenAPreparedStatement('SELECT 1, "a" UNION SELECT 2, "b"');

      $this->whenStatementIsExecuted();
      $this->whenExtractingData();

      $this->thenSpecificRowShouldBe(1, array(2, "b"));
   }
}
