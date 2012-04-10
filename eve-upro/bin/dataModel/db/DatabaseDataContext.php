<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';

require_once realpath(dirname(__FILE__)) . '/../WriteContext.php';

require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../../db/TransactionControl.php';
require_once realpath(dirname(__FILE__)) . '/../../db/SingleCellTableRowReader.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/SimpleResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/SelectQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/clause/ColumnClauseSubject.php';

/**
 * A basic data context for a database
 */
class DatabaseDataContext
{
   /**
    * @var \upro\db\TransactionControl the transaction control
    */
   private $transactionControl;

   /**
    * @var \upro\db\executor\StatementExecutorFactory factory for statement execution
    */
   private $statementExecutorFactory;

   /**
    * @var array list of table names the model consists of
    */
   private $tableNames;

   /**
    * @var string ID of the model
    */
   private $modelId;

   /**
    * @var \upro\db\sql\SelectQuery for selecting the current data model instance
    */
   private $dataModelInstanceSelectQuery;

   /**
    * @var \upro\db\executor\StatementExecutor for the data model instance selection
    */
   private $dataModelInstanceExecutor;

   /**
    * Constructor
    * @param \upro\db\TransactionControl $transactionControl to use
    * @param \upro\db\executor\StatementExecutorFactory $statementExecutorFactory to use
    * @param array $tableNames list of table names the model consists of
    * @param string $modelId UUID of the model
    */
   function __construct(\upro\db\TransactionControl $transactionControl,
         \upro\db\executor\StatementExecutorFactory $statementExecutorFactory, $tableNames, $modelId)
   {
      $this->transactionControl = $transactionControl;
      $this->statementExecutorFactory = $statementExecutorFactory;
      $this->tableNames = $tableNames;
      $this->modelId = $modelId;
   }

   /**
    * @return string the model ID
    */
   public function getModelId()
   {
      return $this->modelId;
   }

   /**
    * Requests to start a transaction
    * @param boolean $forWrite true if the model shall be locked for writing
    * @return int the current model instance
    */
   public function startTransaction($forWrite)
   {
      $tablesForReadLock = $forWrite ? array() : $this->tableNames;
      $tablesForWriteLock = $forWrite ? $this->tableNames : array();

      $this->prepareDataModelInstanceQuery();
      $this->transactionControl->start($tablesForWriteLock, $tablesForReadLock);

      return $this->getCurrentDataModelInstance();
   }

   /**
    * Requests to commit the active transaction
    */
   public function commitTransaction()
   {
      $this->transactionControl->commit();
      $this->cleanupDataModelInstanceQuery();
   }

   /**
    * Requests to roll back the active transaction
    */
   public function rollbackTransaction()
   {
      $this->transactionControl->rollback();
      $this->cleanupDataModelInstanceQuery();
   }

   /**
    * Returns a statement executor for given query
    * @param \upro\db\sql\Query $query for which to create the executor
    * @return \upro\db\executor\StatementExecutor for the query
    */
   public function getStatementExecutor(\upro\db\sql\Query $query)
   {
      return $this->statementExecutorFactory->getExecutor($query);
   }

   /**
    * Retrieves the current data model instance.
    * Must be called while during an active transaction context
    * @return int the current instance value
    */
   private function getCurrentDataModelInstance()
   {
      $reader = new \upro\db\SingleCellTableRowReader(-1);

      $this->dataModelInstanceExecutor->execute(new \upro\db\executor\SimpleResultSetHandler($reader));

      return $reader->getValue();
   }

   /**
    * Prepares the select statement for the current model instance
    */
   private function prepareDataModelInstanceQuery()
   {
      $columnSubject = new \upro\db\sql\clause\ColumnClauseSubject(DatabaseDataModelConstants::COLUMN_NAME_ID);

      $this->dataModelInstanceSelectQuery = new \upro\db\sql\SelectQuery();

      $this->dataModelInstanceSelectQuery->selectColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_INSTANCE);
      $this->dataModelInstanceSelectQuery->fromTable(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL);
      $this->dataModelInstanceSelectQuery->where($columnSubject->equalsParameter(new \upro\db\sql\ParameterBox($this->modelId)));

      $this->dataModelInstanceExecutor = $this->getStatementExecutor($this->dataModelInstanceSelectQuery);
   }

   /**
    * Cleans up the data model instance query and related resources
    */
   private function cleanupDataModelInstanceQuery()
   {
      $this->dataModelInstanceExecutor->close();
      $this->dataModelInstanceExecutor = null;
      $this->dataModelInstanceSelectQuery = null;
   }
}

}