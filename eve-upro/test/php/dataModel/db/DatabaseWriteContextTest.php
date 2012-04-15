<?php
require_once 'db/sql/StandardSqlDictionary.php';

require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/db/DatabaseWriteContext.php';

require_once 'TestStatementExecutorFactory.php';
require_once 'TestStatementExecutor.php';
require_once 'BufferResultSet.php';

class DatabaseWriteContextTest extends PHPUnit_Framework_TestCase
{
   /**
    * @var \upro\dataModel\db\DatabaseWriteContext
    */
   private $context;

   private $tableNames;

   private $modelId;

   private $transactionControl;

   private $executorFactory;

   /**
    * @var \upro\dataModel\WriteAccess
    */
   private $access;

   protected function givenAModel($tableNames, $id)
   {
      $this->tableNames = $tableNames;
      $this->modelId = $id;
   }

   protected function givenADatabaseWriteContext()
   {
      $this->transactionControl = $this->getMock('\upro\db\TransactionControl');
      $dataContext = new \upro\dataModel\db\DatabaseDataContext($this->transactionControl,
            $this->executorFactory, $this->tableNames, $this->modelId);
      $this->context = new \upro\dataModel\db\DatabaseWriteContext($dataContext);
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

         $this->executorFactory->setExecutor(0, $executor);
      }
      $this->access = $this->context->start();
   }

   protected function whenContextIsStopped()
   {
      {   // UPDATE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(2, $executor);
      }
      {   // DELETE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(3, $executor);
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

      $this->executorFactory->setExecutor(1, $executor);
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

         $this->executorFactory->setExecutor(2, $executor);
      }
      $this->access->retrieveDataEntry($entryId);
   }

   protected function whenCreatingADataEntry($entryId, $data, $contextId)
   {
      {   // INSERT query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(2, $executor);
      }
      $this->access->createDataEntry($entryId, $data, $contextId);
   }

   protected function whenUpdatingADataEntry($entryId, $data)
   {
      {   // UPDATE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(2, $executor);
      }
      $this->access->updateDataEntry($entryId, $data);
   }

   protected function whenDeletingADataEntry($entryId)
   {
      {   // DELETE query preparation
         $resultSet = new BufferResultSet();
         $executor = new TestStatementExecutor($resultSet);

         $this->executorFactory->setExecutor(2, $executor);
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

      $this->executorFactory->setExecutor(2, $executor);
      }
      $this->access->findDataEntries($entryType, $contextId, $filter);
   }

   public function setUp()
   {
      parent::setUp();

      $this->executorFactory = new TestStatementExecutorFactory();
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

      $this->thenTheQueryShouldHaveBeen(1, 'SELECT instance FROM DataModels WHERE id = ?');
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

      $this->thenTheQueryShouldHaveParameter(1, 0, $modelId);
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

      $this->thenTheQueryShouldHaveBeen(0, 'INSERT INTO DataModelChangeHistory'
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

      $this->thenTheQueryShouldHaveParameter(0, 0, $modelId);
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

      $this->thenTheQueryShouldHaveParameter(0, 1, $instance + 1);
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

      $this->thenTheQueryShouldHaveParameter(0, 1, $instance + 2);
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

      $this->thenTheQueryShouldHaveParameter(0, 1, $instance + 3);
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

      $this->thenTheQueryShouldHaveParameter(0, 2, $contextId->getEntryType());
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

      $this->thenTheQueryShouldHaveParameter(0, 3, $contextId->getKey());
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

      $this->thenTheQueryShouldHaveParameter(0, 4, $message);
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

      $this->thenTheQueryShouldHaveBeen(2, 'UPDATE DataModels SET instance = ? WHERE id = ?');
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

      $this->thenTheQueryShouldHaveParameter(2, 0, $instance + 1);
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

      $this->thenTheQueryShouldHaveParameter(2, 0, $instance + 2);
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

      $this->thenTheQueryShouldHaveParameter(2, 1, $modelId);
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

      $this->thenTheQueryShouldHaveBeen(3, 'DELETE FROM DataModelChangeHistory'
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

      $this->thenTheQueryShouldHaveParameter(3, 0, $modelId);
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

      $this->thenTheQueryShouldHaveParameter(3, 1, $instance + 1 - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT);
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

      $this->thenTheQueryShouldHaveBeen(2, 'SELECT * FROM Table1 WHERE id = ?');
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

      $this->thenTheQueryWithParametersShouldHaveBeen(2, 'INSERT INTO Table1'
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

      $this->thenTheQueryWithParametersShouldHaveBeen(2, 'UPDATE Table1'
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

      $this->thenTheQueryWithParametersShouldHaveBeen(2, 'DELETE FROM Table1 WHERE id = ?', array($entryId->getKey()));
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

      $this->thenTheQueryWithParametersShouldHaveBeen(2, 'SELECT * FROM SearchType WHERE'
            . ' (((contextId = ?) AND (contextEntryType = ?)) AND (Prop1 = ?)) AND (Prop2 = ?)',
            array($contextId->getKey(), $contextId->getEntryType(), 'Value1', 'Value2'));
   }
}