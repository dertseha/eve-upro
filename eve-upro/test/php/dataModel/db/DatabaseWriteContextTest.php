<?php
require_once 'db/sql/StandardSqlDictionary.php';

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

   protected function givenAModel($tableNames, $id)
   {
      $this->tableNames = $tableNames;
      $this->modelId = $id;
   }

   protected function givenADatabaseWriteContext()
   {
      $this->transactionControl = $this->getMock('\upro\db\TransactionControl');
      $this->context = new \upro\dataModel\db\DatabaseWriteContext($this->transactionControl,
            $this->executorFactory, $this->tableNames, $this->modelId);
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
      $this->context->start();
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
      $this->context->addHistoryEntry($message, $contextId);
   }

   protected function thenAddHistoryEntryShouldReturn($expected)
   {
      $result = $this->context->addHistoryEntry('test', \Uuid::EMPTY_UUID);

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
            . ' (dataModelId, dataModelInstance, contextId, message)'
            . ' VALUES (?, ?, ?, ?)');
   }

   public function testHistoryEntryHasProperModelId_WhenAddingHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = \Uuid::EMPTY_UUID;
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
      $contextId = \Uuid::EMPTY_UUID;
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
      $contextId = \Uuid::EMPTY_UUID;
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
      $contextId = \Uuid::EMPTY_UUID;
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

   public function testHistoryEntryHasProperContextId_WhenAddingHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = \Uuid::v4();
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(0, 2, $contextId);
   }

   public function testHistoryEntryHasProperMessage_WhenAddingHistoryEntry()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = \Uuid::EMPTY_UUID;
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsStarted();
      $this->whenAddingHistoryEntry($message, $contextId);

      $this->thenTheQueryShouldHaveParameter(0, 3, $message);
   }

   public function testAddHistoryEntryShouldReturnZero_WhenStopped()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = \Uuid::EMPTY_UUID;
      $message = 'History Entry Message';
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseWriteContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->thenAddHistoryEntryShouldReturn(0);
   }

   public function testAddHistoryEntryShouldReturnNextInstance_WhenStarted()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $contextId = \Uuid::EMPTY_UUID;
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
      $contextId = \Uuid::EMPTY_UUID;
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
}