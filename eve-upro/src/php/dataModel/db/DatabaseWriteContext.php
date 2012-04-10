<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataContext.php';

require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../WriteContext.php';
require_once realpath(dirname(__FILE__)) . '/../WriteAccess.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/InsertQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/DeleteQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/UpdateQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/NullResultSetHandler.php';

/**
 * A write context for a database
 */
class DatabaseWriteContext implements \upro\dataModel\WriteContext, \upro\dataModel\WriteAccess
{
   /**
    * Helper for data actions
    * @var \upro\dataModel\db\DatabaseDataContext
    */
   private $dataContext;

   /**
    * @var int the new instance value, valid during an active transaction
    */
   private $newInstance;

   /**
    * @var \upro\db\sql\InsertQuery for a history entry
    */
   private $historyInsertQuery;

   /**
    * @var \upro\db\executor\StatementExecutor executor for the history insert
    */
   private $historyInsertExecutor;

   /**
    * @var \upro\db\sql\ParameterBox for the history entry model instance
    */
   private $historyEntryModelInstanceBox;

   /**
    * @var \upro\db\sql\ParameterBox for the history entry context entry type
    */
   private $historyEntryContextEntryTypeBox;

   /**
    * @var \upro\db\sql\ParameterBox for the history entry context key
    */
   private $historyEntryContextIdBox;

   /**
    * @var \upro\db\sql\ParameterBox for the history entry message
    */
   private $historyEntryMessageBox;

   /**
    * Constructor
    * @param \upro\dataModel\db\DatabaseDataContext $dataContext the data context to work in
    */
   function __construct(\upro\dataModel\db\DatabaseDataContext $dataContext)
   {
      $this->dataContext = $dataContext;
      $this->newInstance = 0;
   }

   /** {@inheritDoc} */
   public function start()
   {
      if (!$this->isContextStarted())
      {
         $this->prepareHistoryInsertQuery();

         $this->newInstance = $this->dataContext->startTransaction(true);
      }

      return $this;
   }

   /** {@inheritDoc} */
   public function stop()
   {
      if ($this->isContextStarted())
      {
         $this->newInstance++; // ensures any undocumented change is also covered
         $this->updateNewInstanceValue();
         $this->deleteOldHistoryEntries();

         $this->dataContext->commitTransaction();

         $this->newInstance = 0;
         $this->cleanupHistoryInsertQuery();
      }
   }

   /** {@inheritDoc} */
   public function cancel()
   {
      if ($this->isContextStarted())
      {
         $this->dataContext->rollbackTransaction();

         $this->newInstance = 0;
         $this->cleanupHistoryInsertQuery();
      }
   }

   /** {@inheritDoc} */
	public function addHistoryEntry($message, $contextId)
	{
	   $result = 0;

	   if ($this->isContextStarted())
	   {
   	   $result = $this->newInstance + 1;
         $this->historyEntryModelInstanceBox->setValue($result);
   	   $this->historyEntryContextEntryTypeBox->setValue($contextId->getEntryType());
         $this->historyEntryContextIdBox->setValue($contextId->getKey());
   	   $this->historyEntryMessageBox->setValue($message);

   	   $this->historyInsertExecutor->execute(new \upro\db\executor\NullResultSetHandler());
   	   $this->newInstance = $result;
	   }

	   return $result;
	}

	/**
	 * @return boolean true if the context currently started
	 */
	private function isContextStarted()
	{
	   return ($this->historyInsertQuery !== null);
	}

	/**
	 * Prepares the insert query for history entries
	 */
	private function prepareHistoryInsertQuery()
	{
	   $query = new \upro\db\sql\InsertQuery();

	   $query->intoTable(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL_CHANGE_HISTORY);
	   $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_ID)
	      ->valueConstant($this->dataContext->getModelId());

	   $this->historyEntryModelInstanceBox = new \upro\db\sql\ParameterBox(null);
	   $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE)
	      ->value(new \upro\db\sql\ParameterValueExpression($this->historyEntryModelInstanceBox));

	   $this->historyEntryContextEntryTypeBox = new \upro\db\sql\ParameterBox(null);
	   $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ENTRY_TYPE)
	      ->value(new \upro\db\sql\ParameterValueExpression($this->historyEntryContextEntryTypeBox));

	   $this->historyEntryContextIdBox = new \upro\db\sql\ParameterBox(\Uuid::EMPTY_UUID);
	   $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ID)
	      ->value(new \upro\db\sql\ParameterValueExpression($this->historyEntryContextIdBox));

	   $this->historyEntryMessageBox = new \upro\db\sql\ParameterBox('');
	   $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_MESSAGE)
	      ->value(new \upro\db\sql\ParameterValueExpression($this->historyEntryMessageBox));

	   $this->historyInsertQuery = $query;
	   $this->historyInsertExecutor = $this->dataContext->getStatementExecutor($this->historyInsertQuery);
	}

	/**
	 * Drops the insert query and related helper
	 */
	private function cleanupHistoryInsertQuery()
	{
	   $this->historyInsertExecutor->close();
	   $this->historyInsertExecutor = null;
	   $this->historyInsertQuery = null;

	   $this->historyEntryMessageBox = null;
	   $this->historyEntryContextIdBox = null;
	   $this->historyEntryIdBox = null;
	   $this->historyEntryModelInstanceBox = null;
	}

	/**
	 * Updates the instance value of the model
	 */
	private function updateNewInstanceValue()
	{
	   $query = new \upro\db\sql\UpdateQuery();
	   $query->updateTable(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL);
	   $query->set(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_INSTANCE,
	         new \upro\db\sql\ParameterValueExpression(new \upro\db\sql\ParameterBox($this->newInstance)));

	   {
	      $dataModelIdSubject = new \upro\db\sql\clause\ColumnClauseSubject(
	            DatabaseDataModelConstants::COLUMN_NAME_ID);

	      $clause = $dataModelIdSubject->equalsParameter(new \upro\db\sql\ParameterBox($this->dataContext->getModelId()));
	      $query->where($clause);
	   }

	   $executor = $this->dataContext->getStatementExecutor($query);
	   $executor->execute(new \upro\db\executor\NullResultSetHandler());
	   $executor->close();
	}

	/**
	 * Deletes the old history entries
	 */
	private function deleteOldHistoryEntries()
	{
	   $query = new \upro\db\sql\DeleteQuery();
	   $query->deleteFromTable(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL_CHANGE_HISTORY);

	   {
	      $dataModelIdSubject = new \upro\db\sql\clause\ColumnClauseSubject(
	            DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_ID);
	      $dataModelInstanceSubject = new \upro\db\sql\clause\ColumnClauseSubject(
	            DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE);

	      $dataModelInstanceBox = new \upro\db\sql\ParameterBox($this->newInstance - DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT);
	      $clause = $dataModelIdSubject->equalsParameter(new \upro\db\sql\ParameterBox($this->dataContext->getModelId()))
	         ->andThat($dataModelInstanceSubject->isSmallerThanParameter($dataModelInstanceBox));
	      $query->where($clause);
	   }

	   $executor = $this->dataContext->getStatementExecutor($query);
	   $executor->execute(new \upro\db\executor\NullResultSetHandler());
	   $executor->close();
	}
}

}