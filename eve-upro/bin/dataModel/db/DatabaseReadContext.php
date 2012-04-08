<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataContext.php';
require_once realpath(dirname(__FILE__)) . '/DataModelHistoryResultSetHandler.php';

require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../ReadContext.php';
require_once realpath(dirname(__FILE__)) . '/../HistoryReader.php';

require_once realpath(dirname(__FILE__)) . '/../../db/sql/SelectQuery.php';

/**
 * A read context for a database
 */
class DatabaseReadContext extends \upro\dataModel\db\DatabaseDataContext implements \upro\dataModel\ReadContext
{
   /**
    * @var \upro\db\sql\SelectQuery for a history entry
    */
   private $historySelectQuery;

   /**
    * @var \upro\db\executor\StatementExecutor for the history selection
    */
   private $historySelectExecutor;

   /**
    * @var \upro\db\sql\ParameterBox for the history entry model instance
    */
   private $historyEntryModelInstanceBox;

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
      parent::__construct($transactionControl, $statementExecutorFactory, $tableNames, $modelId);
   }

   /** {@inheritDoc} */
   public function prepare()
   {
      if (!$this->isPrepared())
      {
         $this->prepareHistorySelectQuery();
      }
   }


   /** {@inheritDoc} */
   public function unprepare()
   {
      if ($this->isPrepared())
      {
         $this->cleanupHistorySelectQuery();
      }
   }

   /** {@inheritDoc} */
	public function readHistoryEntries($lastInstance, \upro\dataModel\HistoryReader $reader)
	{
      if ($this->isPrepared())
      {
   	   $this->startTransaction(false);

   	   $currentInstance = $this->getCurrentDataModelInstance();

   	   if (($lastInstance <= 0) ||
   	         ($lastInstance <= ($currentInstance - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT)))
   	   {
   	      $reader->reset($currentInstance);
   	   }
   	   else
   	   {
   	      $this->historyEntryModelInstanceBox->setValue($lastInstance);
   	      $this->historySelectExecutor->execute(new \upro\dataModel\db\DataModelHistoryResultSetHandler($reader));
   	   }

   	   $this->commitTransaction();
      }
	}

	/**
	 * @return boolean true if context is prepared
	 */
	private function isPrepared()
	{
	   return $this->historySelectExecutor !== null;
	}

	/**
	 * Prepares the select query for history entries
	 */
	private function prepareHistorySelectQuery()
	{
	   $this->historySelectQuery = new \upro\db\sql\SelectQuery();
	   $this->historySelectQuery->selectAll()->fromTable(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL_CHANGE_HISTORY);

	   {
	      $dataModelIdSubject = new \upro\db\sql\clause\ColumnClauseSubject(
	            DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_ID);
	      $dataModelInstanceSubject = new \upro\db\sql\clause\ColumnClauseSubject(
	            DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE);

	      $this->historyEntryModelInstanceBox = new \upro\db\sql\ParameterBox(null);
	      $clause = $dataModelIdSubject->equalsParameter(new \upro\db\sql\ParameterBox($this->getModelId()))
	         ->andThat($dataModelInstanceSubject->isGreaterThanParameter($this->historyEntryModelInstanceBox));
	      $this->historySelectQuery->where($clause);
	   }
	   $this->historySelectQuery->orderByColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE);

	   $this->historySelectExecutor = $this->getStatementExecutor($this->historySelectQuery);
	}

	/**
	 * Drops the select query and related helper
	 */
	private function cleanupHistorySelectQuery()
	{
	   $this->historySelectExecutor->close();
	   $this->historySelectExecutor = null;
	   $this->historySelectQuery = null;

	   $this->historyEntryModelInstanceBox = null;
	}
}

}