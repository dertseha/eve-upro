<?php
use upro\db\schema\StandardColumnControl;

require_once 'db/DatabaseException.php';

require_once 'MySqlBasedTest.php';

require_once 'db/schema/TableControlProvider.php';
require_once 'db/schema/StringDataType.php';

class MySqlTableControlTest extends MySqlBasedTest
{
   private static $TEST_TABLE = 'TableControlTest';

   /**
    * @var \upro\db\schema\TableControlProvider
    */
   private $provider;

   /**
    * @var \upro\db\schema\TableDefinition
    */
   private $definition;

   protected function givenADatabaseForTest()
   {
      $this->getConnection()->setDatabase($this->getTestDatabaseName());
   }

   protected function givenADatabase($databaseName)
   {
      $this->getConnection()->setDatabase($databaseName);
   }

   protected function whenGettingTableControlProvider()
   {
      $this->provider = $this->getConnection()->getTableControlProvider();
   }

   protected function whenDummyTableIsCreated($tableName)
   {
      $tableDef = new \upro\db\schema\StandardTableControl($tableName);

      $tableDef->addColumn('TestColumn', new \upro\db\schema\StringDataType(10));

      $this->definition = $this->provider->createTable($tableDef);
   }

   protected function whenGettingDefinition($tableName)
   {
      $this->definition = $this->provider->getTableDefinition($tableName);
   }

   protected function whenTableIsDropped($tableName)
   {
      $this->provider->dropTable($tableName);
   }

   protected function whenColumnIsAdded($tableName, $column)
   {
      $this->provider->addColumn($tableName, $column);
   }

   protected function thenIsTableExistingShouldReturn($tableName, $expected)
   {
      $result = $this->provider->isTableExisting($tableName);

      $this->assertEquals($expected, $result);
   }

   protected function thenDefinitionShouldBeForTable($expected)
   {
      $result = $this->definition->getTableName();

      $this->assertEquals($expected, $result);
   }

   protected function thenDefinitionShouldContainColumn($columnName)
   {
      $result = $this->definition->getColumn($columnName);

      $this->assertEquals($columnName, $result->getColumnName());
   }

   protected function thenDefinitionShouldHaveNotNullColumn($columnName)
   {
      $result = $this->definition->getColumn($columnName);

      $this->assertEquals(false, $result->isNullable());
   }

   protected function thenDefinitionShouldHaveColumnWithDefaultValue($columnName, $expected)
   {
      $result = $this->definition->getColumn($columnName);

      $this->assertEquals($expected, $result->getDefaultValue());
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

      $this->dropTable(MySqlTableControlTest::$TEST_TABLE);
   }

   public function tearDown()
   {
      $this->dropTable(MySqlTableControlTest::$TEST_TABLE);

      parent::tearDown();
   }

   public function testTableIsNotExisting_WhenCheckedForNotExistingTable()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenGettingTableControlProvider();

      $this->thenIsTableExistingShouldReturn('NotExistingTable', false);
   }

   public function testTableIsExisting_WhenCheckedForExistingTable()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabase('information_schema');

      $this->whenGettingTableControlProvider();

      $this->thenIsTableExistingShouldReturn('TABLES', true);
   }

   public function testTableIsExisting_WhenCheckedForExistingTableIgnoreCase()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabase('information_schema');

      $this->whenGettingTableControlProvider();

      $this->thenIsTableExistingShouldReturn('taBLes', true);
   }

   public function testTableIsNotExisting_WhenCheckedForSimilarNamedTable()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabase('information_schema');

      $this->whenGettingTableControlProvider();

      $this->thenIsTableExistingShouldReturn('TABLE_', false);  // results in 'TABLES' if not filtered
   }

   public function testTableIsNotExisting_WhenCheckedForTestTable()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenGettingTableControlProvider();

      $this->thenIsTableExistingShouldReturn(MySqlTableControlTest::$TEST_TABLE, false);
   }

   public function testTableIsExisting_WhenTestTableIsCreated()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenGettingTableControlProvider();
      $this->whenDummyTableIsCreated(MySqlTableControlTest::$TEST_TABLE);

      $this->thenIsTableExistingShouldReturn(MySqlTableControlTest::$TEST_TABLE, true);
   }

   public function testTableIsNotExisting_WhenTestTableIsCreatedAndDroppedAgain()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenGettingTableControlProvider();
      $this->whenDummyTableIsCreated(MySqlTableControlTest::$TEST_TABLE);
      $this->whenTableIsDropped(MySqlTableControlTest::$TEST_TABLE);

      $this->thenIsTableExistingShouldReturn(MySqlTableControlTest::$TEST_TABLE, false);
   }

   public function testControlIsForTable_WhenTestTableIsCreated()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenGettingTableControlProvider();
      $this->whenDummyTableIsCreated(MySqlTableControlTest::$TEST_TABLE);
      $this->whenGettingDefinition(MySqlTableControlTest::$TEST_TABLE);

      $this->thenDefinitionShouldBeForTable(MySqlTableControlTest::$TEST_TABLE);
   }

   public function testControlIsForTable_WhenQueryingExistingTable()
   {
      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabase('information_schema');

      $this->whenGettingTableControlProvider();
      $this->whenGettingDefinition('TABLES');

      $this->thenDefinitionShouldBeForTable('TABLES');
   }

   public function testDefinitionContainsColumn_WhenAddedExtra()
   {
      $column = new StandardColumnControl('ExtraColumn', new \upro\db\schema\StringDataType(20));
      $column->setNullable(false);

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenGettingTableControlProvider();
      $this->whenDummyTableIsCreated(MySqlTableControlTest::$TEST_TABLE);
      $this->whenColumnIsAdded(MySqlTableControlTest::$TEST_TABLE, $column);
      $this->whenGettingDefinition(MySqlTableControlTest::$TEST_TABLE);

      $this->thenDefinitionShouldContainColumn($column->getColumnName());
   }

   public function testDefinitionSpecifiesNotNull_WhenAddedExtra()
   {
      $column = new StandardColumnControl('ExtraColumn', new \upro\db\schema\StringDataType(20));
      $column->setNullable(false);

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenGettingTableControlProvider();
      $this->whenDummyTableIsCreated(MySqlTableControlTest::$TEST_TABLE);
      $this->whenColumnIsAdded(MySqlTableControlTest::$TEST_TABLE, $column);
      $this->whenGettingDefinition(MySqlTableControlTest::$TEST_TABLE);

      $this->thenDefinitionShouldHaveNotNullColumn($column->getColumnName());
   }

   public function testDefinitionSpecifiesDefaultValue_WhenAddedExtra()
   {
      $column = new StandardColumnControl('ExtraColumn', new \upro\db\schema\StringDataType(100));
      $column->setDefaultValue('"; DROP TABLE ' . MySqlTableControlTest::$TEST_TABLE . '; --'); // doesn't work anyway...

      $this->givenAMySqlDataSourceForTests();
      $this->givenAConnectionForTest();
      $this->givenADatabaseForTest();

      $this->whenGettingTableControlProvider();
      $this->whenDummyTableIsCreated(MySqlTableControlTest::$TEST_TABLE);
      $this->whenColumnIsAdded(MySqlTableControlTest::$TEST_TABLE, $column);
      $this->whenGettingDefinition(MySqlTableControlTest::$TEST_TABLE);

      $this->thenDefinitionShouldHaveColumnWithDefaultValue($column->getColumnName(), $column->getDefaultValue());
   }
}
