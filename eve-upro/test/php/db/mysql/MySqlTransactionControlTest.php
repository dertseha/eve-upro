<?php

require_once 'db/DatabaseException.php';
require_once 'db/TransactionControl.php';
require_once 'db/TableRowReader.php';

require_once 'db/sql/InsertQuery.php';
require_once 'db/sql/SelectQuery.php';
require_once 'db/sql/ParameterValueExpression.php';
require_once 'db/sql/ParameterBox.php';
require_once 'db/executor/PreparedStatementExecutor.php';

require_once 'MySqlBasedTest.php';

class MySqlTransactionControlTest extends MySqlBasedTest
{
   private static $TEST_TABLE = 'TransactionControlTest';

   private static $TEST_COLUMN = 'TestColumn';

   /**
    * @var \upro\db\TransactionControl
    */
   private $control;

   protected function givenADatabaseForTest()
   {
      $this->getConnection()->setDatabase($this->getTestDatabaseName());
   }

   protected function givenATableForTest()
   {
      $tableDef = new \upro\db\schema\StandardTableControl(MySqlTransactionControlTest::$TEST_TABLE);

      $controlProvider = $this->getConnection()->getTableControlProvider();

      $tableDef->addColumn(MySqlTransactionControlTest::$TEST_COLUMN, new \upro\db\schema\StringDataType(10));
      $controlProvider->createTable($tableDef);
   }

   protected function whenStartingATransaction($tablesForWriteLock, $tablesForReadLock)
   {
      $this->control = $this->getConnection()->getTransactionControl();
      $this->control->start($tablesForWriteLock, $tablesForReadLock);
   }

   protected function whenTransactionIsCommitted()
   {
      $this->control->commit();
   }

   protected function whenTransactionIsRolledBack()
   {
      $this->control->rollback();
   }

   protected function whenInsertingARow()
   {
      $query = new \upro\db\sql\InsertQuery();

      $query->intoTable(MySqlTransactionControlTest::$TEST_TABLE)->columnName(MySqlTransactionControlTest::$TEST_COLUMN);
      $query->value(new \upro\db\sql\ParameterValueExpression(new \upro\db\sql\ParameterBox('abcd')));
      $this->executeQuery($query, new \upro\db\BufferTableRowReader());
   }

   protected function thenTestTableShouldHaveRowCount($expected)
   {
      $query = new \upro\db\sql\SelectQuery();
      $reader = new \upro\db\BufferTableRowReader();

      $query->selectAll()->fromTable(MySqlTransactionControlTest::$TEST_TABLE);
      $this->executeQuery($query, $reader);

      $this->assertEquals($expected, $reader->getRowCount());
   }

   private function executeQuery(\upro\db\sql\Query $query, \upro\db\TableRowReader $reader)
   {
      $executor = new \upro\db\executor\PreparedStatementExecutor();

      $executor->prepare($this->getConnection(), $query);
      $executor->execute(new \upro\db\executor\SimpleResultSetHandler($reader));
      $executor->close();
   }

   private function dropTable($tableName)
   {
      $dataSource = new \upro\db\mysql\MySqlDataSource($this->getTestServer());
      $connection = $dataSource->getConnection($this->getTestUser(), $this->getTestUserPassword());
      $connection->setDatabase($this->getTestDatabaseName());
      $provider = $connection->getTableControlProvider();
      if ($provider->isTableExisting($tableName))
      {
         $provider->dropTable($tableName);
      }
      $connection->close();
   }

   public function setUp()
   {
      parent::setUp();

      $this->dropTable(MySqlTransactionControlTest::$TEST_TABLE);
   }

   public function tearDown()
   {
      // I know that this might end up in a dead lock if a test failed and left a dangling transaction
      // BUT for some reason this even hangs for /working/ transaction tests, that unlocked the tables !?!
      // $this->dropTable(MySqlTransactionControlTest::$TEST_TABLE);

      parent::tearDown();

      // do this after base tearDown to have possibly locked connection closed
      $this->dropTable(MySqlTransactionControlTest::$TEST_TABLE);
   }

   public function testTableCanBeWritten_WhenWithoutTransaction()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenATableForTest();

      $this->whenInsertingARow();

      $this->thenTestTableShouldHaveRowCount(1);
   }

   public function testTableCanBeWritten_WhenWithTransaction()
   {
      $tableName = MySqlTransactionControlTest::$TEST_TABLE;

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenATableForTest();

      $this->whenStartingATransaction(array($tableName), array());
      $this->whenInsertingARow();
      $this->whenTransactionIsCommitted();

      $this->thenTestTableShouldHaveRowCount(1);
   }

   public function testTableModificationIsReverted_WhenWithRolledBackTransaction()
   {
      $tableName = MySqlTransactionControlTest::$TEST_TABLE;

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();
      $this->givenATableForTest();

      $this->whenStartingATransaction(array($tableName), array());
      $this->whenInsertingARow();
      $this->whenTransactionIsRolledBack();

      $this->thenTestTableShouldHaveRowCount(0);
   }
}
