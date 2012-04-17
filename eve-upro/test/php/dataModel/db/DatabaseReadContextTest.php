<?php
require_once 'db/sql/StandardSqlDictionary.php';

require_once 'dataModel/DataEntryId.php';
require_once 'dataModel/db/DatabaseDataModelConstants.php';
require_once 'dataModel/db/DatabaseReadContext.php';

require_once 'TestStatementExecutorFactory.php';
require_once 'TestStatementExecutor.php';
require_once 'BufferResultSet.php';

class DatabaseReadContextTest extends PHPUnit_Framework_TestCase
{
   const EXECUTOR_SELECT_HISTORY = 0;
   const EXECUTOR_SELECT_INSTANCE = 1;
   const EXECUTOR_SELECT_INTERESTS = 2;

   /**
    * @var \upro\dataModel\db\DatabaseReadContext
    */
   private $context;

   private $tableNames;

   private $modelId;

   private $transactionControl;

   private $executorFactory;

   private $historyReader;

   private $dataModelHistory;

   private $interestResultSet;

   protected function givenAModel($tableNames, $id)
   {
      $this->tableNames = $tableNames;
      $this->modelId = $id;
   }

   protected function givenAModelHistoryEntry($dataModelInstance, $context, $message)
   {
      $this->dataModelHistory->addRow(array($this->modelId, $dataModelInstance, $context->getEntryType(), $context->getKey(), $message));
   }

   protected function givenADatabaseReadContext()
   {
      $this->transactionControl = $this->getMock('\upro\db\TransactionControl');
      $dataContext = new \upro\dataModel\db\DatabaseDataContext($this->transactionControl,
            $this->executorFactory, $this->tableNames, $this->modelId, \Uuid::v4());
      $this->context = new \upro\dataModel\db\DatabaseReadContext($dataContext);
   }

   protected function givenAHistoryReader()
   {
      $this->historyReader = $this->getMock('\upro\dataModel\HistoryReader');
   }

   protected function expectingHistoryReaderToBeReset($dataModelInstance)
   {
      $this->historyReader->expects($this->once())->method('reset')
         ->with($this->isInstanceOf('\upro\dataModel\ReadAccess'));
   }

   protected function expectingHistoryReaderToBeGivenEntry($instance, $contextId, $message)
   {
      $this->historyReader->expects($this->once())->method('receive')
         ->with($this->isInstanceOf('\upro\dataModel\ReadAccess'), $this->equalTo($instance), $this->equalTo($message), $this->equalTo($contextId));
   }

   protected function expectingHistoryReaderToBeGivenNoEntry()
   {
      $this->historyReader->expects($this->never())->method('receive');
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

   protected function whenContextIsPrepared()
   {
      {   // SELECT query preparation
         $executor = new TestStatementExecutor($this->dataModelHistory);

         $this->executorFactory->setExecutor(DatabaseReadContextTest::EXECUTOR_SELECT_HISTORY, $executor);
      }
      $this->context->prepare();
   }

   protected function whenContextIsUnprepared()
   {
      $this->context->unprepare();
   }

   protected function whenHistoryIsRead($lastInstance)
   {
      {   // SELECT query preparation
         $executor = new TestStatementExecutor($this->interestResultSet);

         $this->executorFactory->setExecutor(DatabaseReadContextTest::EXECUTOR_SELECT_INTERESTS, $executor);
      }
      $this->context->readHistoryEntries($lastInstance, $this->historyReader);
   }

   protected function thenReadHistoryEntriesShouldReturn($instance)
   {
      {   // SELECT query preparation
         $executor = new TestStatementExecutor($this->interestResultSet);

         $this->executorFactory->setExecutor(DatabaseReadContextTest::EXECUTOR_SELECT_INTERESTS, $executor);
      }

      $result = $this->context->readHistoryEntries($instance, $this->historyReader);

      $this->assertEquals($instance, $result);
   }

   protected function givenTheCurrentDataModelInstanceIs($instance)
   {
      $resultSet = new BufferResultSet();
      $resultSet->addRow(array($instance));
      $executor = new TestStatementExecutor($resultSet);

      $this->executorFactory->setExecutor(1, $executor);
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
      $this->dataModelHistory = new BufferResultSet(array(
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_ID,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ENTRY_TYPE,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ID,
            \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_MESSAGE));

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
            \upro\dataModel\db\DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_TO));
   }

   public function testSelectQueryForHistoryEntryIsPrepared_WhenCallingPrepare()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);

      $this->whenContextIsPrepared();

      $this->thenTheQueryShouldHaveBeen(DatabaseReadContextTest::EXECUTOR_SELECT_HISTORY,
            'SELECT * FROM DataModelChangeHistory WHERE'
            . ' (dataModelId = ?) AND (dataModelInstance > ?)'
            . ' ORDER BY dataModelInstance ASC');
   }

   public function testTransactionShouldBeStarted_WhenReadingHistory()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();

      $this->expectingTransactionToBeStarted(array(), $tableNames);

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead(5);
   }

   public function testTransactionShouldBeCommitted_WhenReadingHistory()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();

      $this->expectingTransactionToBeCommitted();

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead(5);
   }

   public function testHistorySelectQueryShouldHaveProperModelId_WhenReadingHistory()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead(5);

      $this->thenTheQueryShouldHaveParameter(DatabaseReadContextTest::EXECUTOR_SELECT_HISTORY, 0, $modelId);
   }

   public function testHistorySelectQueryShouldHaveProperModelInstance_WhenReadingHistory()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead(5);

      $this->thenTheQueryShouldHaveParameter(DatabaseReadContextTest::EXECUTOR_SELECT_HISTORY, 1, 5);
   }

   public function testHistoryReaderShouldBeProvidedWithEntry_WhenReadingHistory()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'Test Message';

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();
      $this->givenAModelHistoryEntry($instance, $contextId, $message);

      $this->expectingHistoryReaderToBeGivenEntry($instance, $contextId, $message);

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead($instance - 1);
   }

   public function testHistoryReaderShouldBeReset_WhenCalledWithInstance0()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 100000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();

      $this->expectingHistoryReaderToBeReset($instance);

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead(0);
   }

   public function testHistoryReaderShouldNotBeProvidedWithEntry_WhenResetFrom0()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'Test Message';

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();
      $this->givenAModelHistoryEntry($instance, $contextId, $message);

      $this->expectingHistoryReaderToBeGivenNoEntry();

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead(0);
   }

   public function testHistoryReaderShouldBeReset_WhenLastInstanceIsTooOld()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 100000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();

      $this->expectingHistoryReaderToBeReset($instance);

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead($instance - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT);
   }

   public function testHistoryReaderShouldNotBeProvidedWithEntry_WhenLastInstanceIsTooOld()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 100000;

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();

      $this->expectingHistoryReaderToBeGivenNoEntry();

      $this->whenContextIsPrepared();
      $this->whenHistoryIsRead($instance - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT);
   }

   public function testReadHistoryEntriesShouldReturnInstance()
   {
      $tableNames = array('Table1', 'Table2');
      $modelId = \Uuid::v4();
      $instance = 10;
      $contextId = new \upro\dataModel\DataEntryId('testType', \Uuid::v4());
      $message = 'Test Message';

      $this->givenAModel($tableNames, $modelId);
      $this->givenADatabaseReadContext();
      $this->givenTheCurrentDataModelInstanceIs($instance);
      $this->givenAHistoryReader();
      $this->givenAModelHistoryEntry($instance, $contextId, $message);

      $this->whenContextIsPrepared();

      $this->thenReadHistoryEntriesShouldReturn($instance);
   }
}