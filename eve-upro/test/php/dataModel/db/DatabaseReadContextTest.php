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
            $this->executorFactory, $this->tableNames, $this->modelId);
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

         $this->executorFactory->setExecutor(0, $executor);
      }
      $this->context->prepare();
   }

   protected function whenContextIsUnprepared()
   {
      $this->context->unprepare();
   }

   protected function whenHistoryIsRead($lastInstance)
   {
      $this->context->readHistoryEntries($lastInstance, $this->historyReader);
   }

   protected function thenReadHistoryEntriesShouldReturn($instance)
   {
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

      $this->thenTheQueryShouldHaveBeen(0, 'SELECT * FROM DataModelChangeHistory WHERE'
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

      $this->thenTheQueryShouldHaveParameter(0, 0, $modelId);
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

      $this->thenTheQueryShouldHaveParameter(0, 1, 5);
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