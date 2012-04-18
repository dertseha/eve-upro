<?php
require_once 'db/sql/StandardSqlDictionary.php';

require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/db/StandardSchemaControl.php';
require_once 'db/schema/TableControlProvider.php';
require_once 'db/schema/StandardTableControl.php';
require_once 'db/schema/IntegerDataType.php';

require_once 'TestStatementExecutorFactory.php';
require_once 'TestStatementExecutor.php';
require_once 'BufferResultSet.php';
require_once 'TestDatabaseDataModelDefinition.php';

class StandardSchemaControlTest extends PHPUnit_Framework_TestCase
{
   private $executorFactory;

   private $tableControlProvider;

   private $definition;

   /**
    * @var \upro\dataModel\db\StandardSchemaControl
    */
   private $control;

   protected function givenADataModelDefinition($version)
   {
      $this->definition = new TestDatabaseDataModelDefinition($version, $this->definition);

      {
         $table = new \upro\db\schema\StandardTableControl('BasicTable1');
         $table->addColumn('TestColumn1', new \upro\db\schema\IntegerDataType());

         $this->definition->addTable($table);
      }
   }

   protected function givenAnExtendedDataModelDefinition($version)
   {
      $this->definition = new TestDatabaseDataModelDefinition($version, $this->definition);

      {
         $table = new \upro\db\schema\StandardTableControl('BasicTable1');
         $table->addColumn('TestColumn1', new \upro\db\schema\IntegerDataType());

         $this->definition->addTable($table);
      }
      {
         $table = new \upro\db\schema\StandardTableControl('BasicTable2');
         $table->addColumn('TestColumn1', new \upro\db\schema\IntegerDataType());

         $this->definition->addTable($table);
      }
   }

   protected function givenAStandardSchemaControl()
   {
      $this->control = new \upro\dataModel\db\StandardSchemaControl($this->definition,
            $this->tableControlProvider, $this->executorFactory);
   }

   protected function whenSchemaTableDoesNotExist()
   {
      $this->tableControlProvider->expects($this->at(0))->method('isTableExisting')
            ->with($this->equalTo(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL))
            ->will($this->returnValue(false));
   }

   protected function whenSchemaTableExistsWithVersion($version)
   {
      $this->tableControlProvider->expects($this->at(0))->method('isTableExisting')
            ->with($this->equalTo(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL))
            ->will($this->returnValue(true));

      {
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $resultSet->addRow(array($version));
         $this->executorFactory->setExecutor(0, $executor);
      }

   }

   protected function expectingSchemaTableToBeCreated()
   {
      $table = new \upro\db\schema\StandardTableControl(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL);
      $table->addColumn(\upro\dataModel\db\StandardSchemaControl::COLUMN_NAME_VERSION, new \upro\db\schema\IntegerDataType())
            ->setNullable(false);

      $this->tableControlProvider->expects($this->at(1))->method('createTable')
            ->with($this->equalTo($table));

      {   // INSERT of first version
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(0, $executor);
      }
   }

   protected function expectingRecentDefinitionToBeCreated()
   {
      $tableNames = $this->definition->getTableNames();
      $invokeCount = 2;

      foreach ($tableNames as $tableName)
      {
         $table = $this->definition->getTable($tableName);

         $this->tableControlProvider->expects($this->at($invokeCount++))->method('isTableExisting')
               ->with($this->equalTo($tableName))->will($this->returnValue(false));

         $this->tableControlProvider->expects($this->at($invokeCount++))->method('createTable')
               ->with($this->equalTo($table));
      }

      {   // UPDATE of version
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(1, $executor);
      }
   }

   protected function thenTheSchemaShouldNotBeUpToDate()
   {
      $result = $this->control->isUpToDate();

      $this->assertFalse($result);
   }

   protected function thenTheSchemaShouldBeUpToDate()
   {
      $result = $this->control->isUpToDate();

      $this->assertTrue($result);
   }

   protected function whenRequestingUpdate()
   {
      $this->control->update();
   }

   protected function thenTheQueryWithParametersShouldHaveBeen($queryIndex, $expectedQueryText, $expectedParameters)
   {
      $query = $this->executorFactory->getQuery($queryIndex);
      $paramText = $query->toSqlText(new \upro\db\sql\StandardSqlDictionary());
      $expected = array('query' => $expectedQueryText, 'parameters' => $expectedParameters);
      $resultingParameters = array();

      for ($i = 0; $i < $paramText->getParameterCount(); $i++)
      {
         $resultingParameters[] = $paramText->getParameter($i)->getValue();
      }
      $result = array('query' => $paramText->getText(), 'parameters' => $resultingParameters);

      $this->assertEquals($expected, $result);
   }

   public function setUp()
   {
      parent::setUp();

      $this->executorFactory = new TestStatementExecutorFactory();
      $this->tableControlProvider = $this->getMock('\upro\db\schema\TableControlProvider');
   }

   public function testSchemaIsNotUpToDate_WhenSchemaTableNotExisting()
   {
      $this->givenADataModelDefinition(1);
      $this->givenAStandardSchemaControl();

      $this->whenSchemaTableDoesNotExist();

      $this->thenTheSchemaShouldNotBeUpToDate();
   }

   public function testSchemaIsUpToDate_WhenSchemaTableHasSameVersionNumber()
   {
      $this->givenADataModelDefinition(1);
      $this->givenAStandardSchemaControl();

      $this->whenSchemaTableExistsWithVersion(1);

      $this->thenTheSchemaShouldBeUpToDate();
   }

   public function testSchemaIsNotUpToDate_WhenSchemaTableHasOlderVersionNumber()
   {
      $this->givenADataModelDefinition(2);
      $this->givenAStandardSchemaControl();

      $this->whenSchemaTableExistsWithVersion(1);

      $this->thenTheSchemaShouldNotBeUpToDate();
   }

   public function testSchemaControlTableCreated_WhenUpdatingFromNothing()
   {
      $this->givenADataModelDefinition(1);
      $this->givenAStandardSchemaControl();

      $this->expectingSchemaTableToBeCreated();
      $this->expectingRecentDefinitionToBeCreated();

      $this->whenSchemaTableDoesNotExist();
      $this->whenRequestingUpdate();
   }

   public function testSchemaControlTableInitialized_WhenUpdatingFromNothing()
   {
      $this->givenADataModelDefinition(1);
      $this->givenAStandardSchemaControl();

      $this->expectingSchemaTableToBeCreated();
      $this->expectingRecentDefinitionToBeCreated();

      $this->whenSchemaTableDoesNotExist();
      $this->whenRequestingUpdate();

      $this->thenTheQueryWithParametersShouldHaveBeen(0, 'INSERT INTO SchemaControl (version) VALUES (?)', array(-1));
   }

   public function testDataModelIsCreatedWithoutHistory_WhenUpdatingFromNothing()
   {
      $this->givenADataModelDefinition(1);
      $this->givenAnExtendedDataModelDefinition(2);
      $this->givenAStandardSchemaControl();

      $this->expectingSchemaTableToBeCreated();
      $this->expectingRecentDefinitionToBeCreated();

      $this->whenSchemaTableDoesNotExist();
      $this->whenRequestingUpdate();
   }

   public function testVersionIsSetInTheEnd_WhenUpdatingFromNothing()
   {
      $this->givenADataModelDefinition(1);
      $this->givenAnExtendedDataModelDefinition(2);
      $this->givenAStandardSchemaControl();

      $this->expectingSchemaTableToBeCreated();
      $this->expectingRecentDefinitionToBeCreated();

      $this->whenSchemaTableDoesNotExist();
      $this->whenRequestingUpdate();

      $this->thenTheQueryWithParametersShouldHaveBeen(1, 'UPDATE SchemaControl SET version = ?', array(2));
   }
}