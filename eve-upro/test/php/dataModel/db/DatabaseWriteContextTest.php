<?php
require_once 'db/sql/StandardSqlDictionary.php';
require_once 'db/schema/StandardTableControl.php';

require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/db/DatabaseWriteContext.php';

require_once 'TestStatementExecutorFactory.php';
require_once 'TestStatementExecutor.php';
require_once 'BufferResultSet.php';
require_once 'TestDatabaseDataModelDefinition.php';

class DatabaseWriteContextTest extends PHPUnit_Framework_TestCase
{
   const EXECUTOR_INSERT_HISTORY = 0;
   const EXECUTOR_SELECT_INSTANCE = 1;
   const EXECUTOR_SELECT_INTERESTS = 2;
   const EXECUTOR_AFTER_START = 3;
   const EXECUTOR_UPDATE_INSTANCE = 3;
   const EXECUTOR_DELETE_HISTORY = 4;
   const EXECUTOR_DELETE_MEMBERSHIP = 5;
   const EXECUTOR_DELETE_INTEREST = 6;
   const EXECUTOR_DELETE_GROUP = 7;

   /**
    * @var \upro\dataModel\db\DatabaseWriteContext
    */
   private $context;

   private $definition;

   private $modelId;

   private $transactionControl;

   private $executorFactory;

   /**
    * @var \upro\dataModel\WriteAccess
    */
   private $access;

   private $interestResultSet;

   protected function givenAModel($tableNames, $id)
   {
      $this->definition = new TestDatabaseDataModelDefinition(1);
      foreach ($tableNames as $tableName)
      {
         $this->definition->addTable(new \upro\db\schema\StandardTableControl($tableName));
      }
      $this->modelId = $id;
   }

   protected function givenADatabaseWriteContext()
   {
      $this->transactionControl = $this->getMock('\upro\db\TransactionControl');
      $dataContext = new \upro\dataModel\db\DatabaseDataContext($this->transactionControl,
            $this->executorFactory, $this->definition, $this->modelId, \Uuid::v4());
      $this->context = new \upro\dataModel\db\DatabaseWriteContext($dataContext);
   }

   protected function givenAnInterest($interestId, $interestFrom, $interestTo, $controlled, $membershipFrom, $membershipTo)
   {
      $this->interestResultSet->addRow(array(\Uuid::v4(), 'Group', \Uuid::v4(),
            'Test', $interestId, $interestFrom, $interestTo, $controlled, $membershipFrom, $membershipTo));
   }

   protected function expectingTransactionToBeStarted($lockedTablesForWrite, $lockedTablesForRead)
   {
      $this->transactionControl->expects($this->once())->method('start')
         ->with($this->equalTo($lockedTablesForWrite), $this->equalTo($lockedTablesForRead));
   }

   protected function expectingTransactionToBeCommitted()
   {
      $this->transactionControl->expects($this->once())->method('commit');
   }

   protected function expectingTransactionToBeRolledBack()
   {
      $this->transactionControl->expects($this->once())->method('rollback');
   }

   protected function whenContextIsStarted()
   {
      {   // INSERT query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, $executor);
      }
      {   // SELECT query preparation
         $executor = new TestStatementExecutor($this->interestResultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_SELECT_INTERESTS, $executor);
      }
      $this->access = $this->context->start();
   }

   protected function whenContextIsStopped()
   {
      {   // UPDATE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_UPDATE_INSTANCE, $executor);
      }
      {   // DELETE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_DELETE_HISTORY, $executor);
      }
      {   // DELETE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_DELETE_MEMBERSHIP, $executor);
      }
      {   // DELETE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_DELETE_INTEREST, $executor);
      }
      {   // DELETE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_DELETE_GROUP, $executor);
      }
      $this->context->stop();
   }

   protected function whenContextIsCancelled()
   {
      $this->context->cancel();
   }

   protected function givenTheCurrentDataModelInstanceIs($instance)
   {
      $resultSet = new BufferResultSet();
      $resultSet->addRow(array($instance));
      $executor = new TestStatementExecutor($resultSet);

      $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_SELECT_INSTANCE, $executor);
   }

   protected function whenAddingHistoryEntry($message, $contextId)
   {
      $this->access->addHistoryEntry($message, $contextId);
   }

   protected function whenRetrievingADataEntry($entryId)
   {
      {   // SELECT query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_AFTER_START, $executor);
      }
      $this->access->retrieveDataEntry($entryId);
   }

   protected function whenCreatingADataEntry($entryId, $data, $contextId)
   {
      {   // INSERT query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_AFTER_START, $executor);
      }
      $this->access->createDataEntry($entryId, $data, $contextId);
   }

   protected function whenUpdatingADataEntry($entryId, $data)
   {
      {   // UPDATE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_AFTER_START, $executor);
      }
      $this->access->updateDataEntry($entryId, $data);
   }

   protected function whenDeletingADataEntry($entryId)
   {
      {   // DELETE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_AFTER_START, $executor);
      }
      $this->access->deleteDataEntry($entryId);
   }

   protected function thenAddHistoryEntryShouldReturn($expected)
   {
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $result = $this->access->addHistoryEntry('test', $contextId);

      $this->assertEquals($expected, $result);
   }

   protected function thenTheQueryShouldHaveBeen($index, $expected)
   {
      $query = $this->executorFactory->getQuery($index);
      $paramText = $query->toSqlText(new \upro\db\sql\StandardSqlDictionary());

      $this->assertEquals($expected, $paramText->getText());
   }

   protected function thenTheQueryShouldHaveParameter($queryIndex, $parameterIndex, $expected)
   {
      $query = $this->executorFactory->getQuery($queryIndex);
      $paramText = $query->toSqlText(new \upro\db\sql\StandardSqlDictionary());
      $paramBox = $paramText->getParameter($parameterIndex);

      $this->assertEquals($expected, $paramBox->getValue());
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

   protected function thenTheNextInstanceValueShouldBe($expected)
   {
      $result = $this->access->getNextInstanceValue();

      $this->assertEquals($expected, $result);
   }

   protected function whenFindingEntries($entryType, \upro\dataModel\DataEntryId $contextId, $filter)
   {
      {   // SELECT query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(DatabaseWriteContextTest::EXECUTOR_AFTER_START, $executor);
      }
      $this->access->findDataEntries($entryType, $contextId, $filter);
   }

   protected function thenAccessIsGranted($entryIds)
   {
      $result = $this->context->isAccessGranted($entryIds);

      $this->assertTrue($result);
   }

   protected function thenAccessIsDenied($entryIds)
   {
      $result = $this->context->isAccessGranted($entryIds);

      $this->assertFalse($result);
   }

   protected function thenControlIsGranted($entryIds)
   {
      $result = $this->context->isControlGranted($entryIds);

      $this->assertTrue($result);
   }

   protected function thenControlIsDenied($entryIds)
   {
      $result = $this->context->isControlGranted($entryIds);

      $this->assertFalse($result);
   }

   public function setUp()
   {
      parent::setUp();

      $this->executorFactory = new TestStatementExecutorFactory();

      $this->interestResultSet = new BufferResultSet(array(
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_ID,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_FROM,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO,
            \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_CONTROLLED,
            \upro\dataModel\db\DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_FROM,
            \upro\dataModel\db\DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_TO
            ));
   }

   public function testTransactionIsStarted_WhenCallingStart()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();

      $this->givenAModel($tableNames, $modelId);
      $this->givenTheCurrentDataModelInstanceIs(20);
      $this->givenADatabaseWriteContext();

      $this->expectingTransactionToBeStarted($tableNames, array());

      $this->whenContextIsStarted();
   }

   public function testTransactionIsStartedOnlyOnce_WhenCallingStartTwice()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();

      $this->givenAModel($tableNames, $modelId);
      $this->givenTheCurrentDataModelInstanceIs(20);
      $this->givenADatabaseWriteContext();

      $this->expectingTransactionToBeStarted($tableNames, array());

      $this->whenContextIsStarted();
      $this->whenContextIsStarted();
   }

   public function testTransactionIsCommitted_WhenCallingStartThenStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();

      $this->givenAModel($tableNames, $modelId);
      $this->givenTheCurrentDataModelInstanceIs(20);
      $this->givenADatabaseWriteContext();

      $this->expectingTransactionToBeCommitted();

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();
   }

   public function testTransactionIsCommittedOnlyOnce_WhenCallingStartThenStopTwice()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();

      $this->givenAModel($tableNames, $modelId);
      $this->givenTheCurrentDataModelInstanceIs(20);
      $this->givenADatabaseWriteContext();

      $this->expectingTransactionToBeCommitted();

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();
      $this->whenContextIsStopped();
   }

   public function testTransactionIsRolledBack_WhenCallingStartThenCancel()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();

      $this->givenAModel($tableNames, $modelId);
      $this->givenTheCurrentDataModelInstanceIs(20);
      $this->givenADatabaseWriteContext();

      $this->expectingTransactionToBeRolledBack();

      $this->whenContextIsStarted();
      $this->whenContextIsCancelled();
   }

   public function testTransactionIsRolledBackOnlyOnce_WhenCallingStartThenCancelTwice()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();

      $this->givenAModel($tableNames, $modelId);
      $this->givenTheCurrentDataModelInstanceIs(20);
      $this->givenADatabaseWriteContext();

      $this->expectingTransactionToBeRolledBack();

      $this->whenContextIsStarted();
      $this->whenContextIsCancelled();
      $this->whenContextIsCancelled();
   }

   public function testDataModelInstanceSelectQueryIsPrepared_WhenCallingStart()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();

      $this->thenTheQueryShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_SELECT_INSTANCE, 'SELECT instance FROM DataModels WHERE id = ?');
   }

   public function testDataModelInstanceSelectHasProperModelId_WhenCallingStart()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_SELECT_INSTANCE, 0, $modelId);
   }

   public function testInsertQueryForHistoryEntryIsPrepared_WhenCallingStart()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();

      $this->thenTheQueryShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, 'INSERT INTO DataModelChangeHistory'
            . ' (dataModelId, dataModelInstance, contextEntryType, contextId, message)'
            . ' VALUES (?, ?, ?, ?, ?)');
   }

   public function testHistoryEntryHasProperModelId_WhenAddingHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, 0, $modelId);
   }

   public function testHistoryEntryHasProperInstance_WhenAddingHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, 1, $instance + 1);
   }

   public function testHistoryEntryHasProperInstance_WhenAddingSecondHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, 1, $instance + 2);
   }

   public function testHistoryEntryHasProperInstance_WhenAddingThirdHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);
      $this->whenAddingHistoryEntry($message, $contextId);
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, 1, $instance + 3);
   }

   public function testHistoryEntryHasProperContextEntryType_WhenAddingHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, 2, $contextId->getEntryType());
   }

   public function testHistoryEntryHasProperContextId_WhenAddingHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, 3, $contextId->getKey());
   }

   public function testHistoryEntryHasProperMessage_WhenAddingHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_INSERT_HISTORY, 4, $message);
   }

   public function testAddHistoryEntryShouldReturnNextInstance_WhenStarted()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();

      $this->thenAddHistoryEntryShouldReturn($instance + 1);
   }

   public function testNewInstanceValueIsUpdated_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_UPDATE_INSTANCE, 'UPDATE DataModels SET instance = ? WHERE id = ?');
   }

   public function testNewInstanceValueIsOneHigher_WhenCallingStopWithoutEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_UPDATE_INSTANCE, 0, $instance + 1);
   }

   public function testNewInstanceValueIsSumOfHistoryEntriesPlusOne_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);
      $this->whenContextIsStopped();

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_UPDATE_INSTANCE, 0, $instance + 2);
   }

   public function testNewInstanceValueIsUpdatedWithProperDataModelId_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_UPDATE_INSTANCE, 1, $modelId);
   }

   public function testDeleteFromHistoryQueryIsPrepared_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_DELETE_HISTORY, 'DELETE FROM DataModelChangeHistory'
            . ' WHERE (dataModelId = ?) AND (dataModelInstance < ?)');
   }

   public function testDeleteFromHistoryQueryShouldHaveProperDataModelId_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_DELETE_HISTORY, 0, $modelId);
   }

   public function testDeleteFromHistoryQueryShouldHaveProperDataModelInstance_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryShouldHaveParameter(DatabaseWriteContextTest::EXECUTOR_DELETE_HISTORY,
            1, $instance + 1 - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT);
   }

   public function testProperSelectQueryShouldBeSet_WhenCallingGetDataEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryId = new \upro\dataModel\DataEntryId('Table1', \Uuid::v4());

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenRetrievingADataEntry($entryId);

      $this->thenTheQueryShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_AFTER_START, 'SELECT * FROM Table1 WHERE id = ?');
   }

   public function testProperInsertQuery_WhenCallingCreateDataEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryId = new \upro\dataModel\DataEntryId('Table1', \Uuid::v4());
      $contextId = new \upro\dataModel\DataEntryId('Table2', \Uuid::v4());
      $data = array('Param1' => 'Value1', 'Param2' => 'Value2');

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenCreatingADataEntry($entryId, $data, $contextId);

      $this->thenTheQueryWithParametersShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_AFTER_START, 'INSERT INTO Table1'
            . ' (id, contextEntryType, contextId, Param1, Param2) VALUES (?, ?, ?, ?, ?)',
            array($entryId->getKey(), $contextId->getEntryType(), $contextId->getKey(), 'Value1', 'Value2'));
   }

   public function testProperUpdateQuery_WhenCallingUpdateDataEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryId = new \upro\dataModel\DataEntryId('Table1', \Uuid::v4());
      $data = array('Param1' => 'Value1', 'Param2' => 'Value2');

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenUpdatingADataEntry($entryId, $data);

      $this->thenTheQueryWithParametersShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_AFTER_START, 'UPDATE Table1'
            . ' SET Param1 = ?, Param2 = ? WHERE id = ?',
            array('Value1', 'Value2', $entryId->getKey()));
   }

   public function testProperDeleteQuery_WhenCallingDeleteDataEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryId = new \upro\dataModel\DataEntryId('Table1', \Uuid::v4());

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenDeletingADataEntry($entryId);

      $this->thenTheQueryWithParametersShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_AFTER_START,
            'DELETE FROM Table1 WHERE id = ?', array($entryId->getKey()));
   }

   public function testNextInstanceValueIsReported_WhenStarted()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();

      $this->thenTheNextInstanceValueShouldBe($instance + 1);
   }

   public function testProperSelectQuery_WhenFindingEntries()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryType = 'SearchType';
      $contextId = new \upro\dataModel\DataEntryId('TestContext', \Uuid::v4());
      $filter = array('Prop1' => 'Value1', 'Prop2' => 'Value2');

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenFindingEntries($entryType, $contextId, $filter);

      $this->thenTheQueryWithParametersShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_AFTER_START,
            'SELECT * FROM SearchType WHERE'
            . ' (contextId = ?) AND (contextEntryType = ?) AND (Prop1 = ?) AND (Prop2 = ?)',
            array($contextId->getKey(), $contextId->getEntryType(), 'Value1', 'Value2'));
   }

   public function testAccessGranted_WhenQueriedForNothing()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->thenAccessIsGranted(array());
   }

   public function testAccessDenied_WhenNotStarted()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryIds = array(new \upro\dataModel\DataEntryId('Test', \Uuid::v4()), new \upro\dataModel\DataEntryId('Test', \Uuid::v4()));

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->thenAccessIsDenied($entryIds);
   }

   public function testAccessGranted_WhenValid()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryIds = array(new \upro\dataModel\DataEntryId('Test', \Uuid::v4()), new \upro\dataModel\DataEntryId('Test', \Uuid::v4()));

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAnInterest($entryIds[0]->getKey(), 0, null, false, 0, null);
      $this->givenAnInterest($entryIds[1]->getKey(), 0, null, false, 0, null);

      $this->whenContextIsStarted();

      $this->thenAccessIsGranted($entryIds);
   }

   public function testAccessDenied_WhenInvalid()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryIds = array(new \upro\dataModel\DataEntryId('Test', \Uuid::v4()), new \upro\dataModel\DataEntryId('Test', \Uuid::v4()));

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAnInterest($entryIds[0]->getKey(), 0, null, false, 0, null);

      $this->whenContextIsStarted();

      $this->thenAccessIsDenied($entryIds);
   }

   public function testAccessDenied_WhenRevokedJustBefore()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryIds = array(new \upro\dataModel\DataEntryId('Test', \Uuid::v4()));

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAnInterest($entryIds[0]->getKey(), 0, $instance, false, 0, null);

      $this->whenContextIsStarted();

      $this->thenAccessIsDenied($entryIds);
   }

   public function testControlDenied_WhenInvalid()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;
      $entryIds = array(new \upro\dataModel\DataEntryId('Test', \Uuid::v4()), new \upro\dataModel\DataEntryId('Test', \Uuid::v4()));

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAnInterest($entryIds[0]->getKey(), 0, null, false, 0, null);
      $this->givenAnInterest($entryIds[1]->getKey(), 0, null, false, 0, null);

      $this->whenContextIsStarted();

      $this->thenControlIsDenied($entryIds);
   }

   public function testDeleteFromInterestQueryIsPrepared_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryWithParametersShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_DELETE_INTEREST, 'DELETE FROM GroupInterest'
            . ' WHERE (dataModelId = ?) AND (NOT (validToInstance IS NULL)) AND (validToInstance < ?)',
            array($this->modelId, $instance + 1 - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT));
   }

   public function testDeleteFromMembershipQueryIsPrepared_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryWithParametersShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_DELETE_MEMBERSHIP, 'DELETE FROM GroupMembership'
            . ' WHERE (dataModelId = ?) AND (NOT (validToInstance IS NULL)) AND (validToInstance < ?)',
            array($this->modelId, $instance + 1 - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT));
   }

   public function testDeleteFromGroupQueryIsPrepared_WhenCallingStop()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenContextIsStopped();

      $this->thenTheQueryWithParametersShouldHaveBeen(DatabaseWriteContextTest::EXECUTOR_DELETE_GROUP, 'DELETE FROM Group'
            . ' WHERE (dataModelId = ?) AND (NOT (validToInstance IS NULL)) AND (validToInstance < ?)',
            array($this->modelId, $instance + 1 - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT));
   }
}