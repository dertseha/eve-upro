<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/InsertQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/DeleteQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/UpdateQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/NullResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/KeyedBufferResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../WriteContext.php';
require_once realpath(dirname(__FILE__)) . '/../WriteAccess.php';
require_once realpath(dirname(__FILE__)) . '/../DataModelConstants.php';

require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelHelper.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataContext.php';

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
         $this->dataContext->readCurrentInterest($this->newInstance);
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
         $this->deleteOldGroupEntries();

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

	/** {@inheritDoc} */
	public function isAccessGranted($entryIds)
	{
	   $result = true;

	   foreach ($entryIds as $entryId)
	   {
	      if (!$this->dataContext->isAccessGranted($entryId, $this->newInstance + 1))
	      {
	         $result = false;
	      }
	   }

	   return $result;
	}

	/** {@inheritDoc} */
	public function isControlGranted($entryIds)
	{
	   $result = true;

	   foreach ($entryIds as $entryId)
	   {
         if (!$this->dataContext->isControlGranted($entryId, $this->newInstance + 1))
	      {
	         $result = false;
	      }
	   }

	   return $result;
	}

	/** {@inheritDoc} */
	public function getModelId()
	{
	   return $this->dataContext->getModelId();
	}

	/** {@inheritDoc} */
	public function getNextInstanceValue()
	{
	   return $this->newInstance + 1;
	}

   /** {@inheritDoc} */
	function retrieveDataEntry(\upro\dataModel\DataEntryId $entryId)
	{
	   $handler = new \upro\db\executor\KeyedBufferResultSetHandler();
	   $query = new \upro\db\sql\SelectQuery();
	   $entry = null;

	   $query->selectAll()->fromTable($entryId->getEntryType());
	   {
	      $idSubject = new \upro\db\sql\clause\ColumnClauseSubject(DatabaseDataModelConstants::COLUMN_NAME_ID);
	      $clause = $idSubject->equalsParameter(new \upro\db\sql\ParameterBox($entryId->getKey()));

	      $query->where($clause);
	   }

	   $executor = $this->dataContext->getStatementExecutor($query);
	   $executor->execute($handler);
	   $executor->close();

	   $reader = $handler->getReader();
	   if ($reader->getRowCount() == 1)
	   {
	      $entry = \upro\dataModel\db\DatabaseDataModelHelper::extractDataEntry($entryId->getEntryType(), $reader, 0);
	   }

	   return $entry;
	}

   /** {@inheritDoc} */
	function findDataEntries($entryType, \upro\dataModel\DataEntryId $contextId, $filter)
	{
	   $handler = new \upro\db\executor\KeyedBufferResultSetHandler();
	   $query = new \upro\db\sql\SelectQuery();
	   $entries = array();

	   $query->selectAll()->fromTable($entryType);
	   {
	      $idSubject = new \upro\db\sql\clause\ColumnClauseSubject(DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID);
	      $clause = $idSubject->equalsParameter(new \upro\db\sql\ParameterBox($contextId->getKey()));
	      $idSubject = new \upro\db\sql\clause\ColumnClauseSubject(DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE);
	      $clause = $clause->andThat($idSubject->equalsParameter(new \upro\db\sql\ParameterBox($contextId->getEntryType())));

	      foreach ($filter as $filterKey => $filterValue)
	      {
	         $idSubject = new \upro\db\sql\clause\ColumnClauseSubject($filterKey);
	         $nextClause = null;

	         if (is_null($filterValue))
	         {
	            $nextClause = $idSubject->isNull();
	         }
	         else
	         {
	            $nextClause = $idSubject->equalsParameter(new \upro\db\sql\ParameterBox($filterValue));
	         }
	         $clause = $clause->andThat($nextClause);
	      }

	      $query->where($clause);
	   }

	   $executor = $this->dataContext->getStatementExecutor($query);
	   $executor->execute($handler);
	   $executor->close();

	   $reader = $handler->getReader();
	   for ($i = 0; $i < $reader->getRowCount(); $i++)
	   {
	      $entries[] = \upro\dataModel\db\DatabaseDataModelHelper::extractDataEntry($entryType, $reader, $i);
	   }

	   return $entries;
	}

   /** {@inheritDoc} */
	function createDataEntry(\upro\dataModel\DataEntryId $entryId, $data, \upro\dataModel\DataEntryId $contextId)
	{
	   $query = new \upro\db\sql\InsertQuery();

	   $query->intoTable($entryId->getEntryType());
	   $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_ID)->valueConstant($entryId->getKey());
	   $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE)->valueConstant($contextId->getEntryType());
	   $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID)->valueConstant($contextId->getKey());
	   foreach ($data as $key => $value)
	   {
	      $query->columnName($key)->valueConstant($value);
	   }

	   $executor = $this->dataContext->getStatementExecutor($query);
	   $executor->execute(new \upro\db\executor\NullResultSetHandler());
	   $executor->close();
	}

   /** {@inheritDoc} */
	function updateDataEntry(\upro\dataModel\DataEntryId $entryId, $data)
	{
	   $query = new \upro\db\sql\UpdateQuery();

	   $query->updateTable($entryId->getEntryType());
		foreach ($data as $key => $value)
	   {
	      $query->set($key, new \upro\db\sql\ParameterValueExpression(new \upro\db\sql\ParameterBox($value)));
	   }
	   {
	      $idSubject = new \upro\db\sql\clause\ColumnClauseSubject(DatabaseDataModelConstants::COLUMN_NAME_ID);
	      $clause = $idSubject->equalsParameter(new \upro\db\sql\ParameterBox($entryId->getKey()));

	      $query->where($clause);
	   }

	   $executor = $this->dataContext->getStatementExecutor($query);
	   $executor->execute(new \upro\db\executor\NullResultSetHandler());
	   $executor->close();
	}

   /** {@inheritDoc} */
	function deleteDataEntry(\upro\dataModel\DataEntryId $entryId)
	{
	   $query = new \upro\db\sql\DeleteQuery();

	   $query->deleteFromTable($entryId->getEntryType());
	   {
	      $idSubject = new \upro\db\sql\clause\ColumnClauseSubject(DatabaseDataModelConstants::COLUMN_NAME_ID);
	      $clause = $idSubject->equalsParameter(new \upro\db\sql\ParameterBox($entryId->getKey()));

	      $query->where($clause);
	   }

	   $executor = $this->dataContext->getStatementExecutor($query);
	   $executor->execute(new \upro\db\executor\NullResultSetHandler());
	   $executor->close();
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

	/**
	 * Deletes the old group entries
	 */
	private function deleteOldGroupEntries()
	{
	   $this->deleteFromGroupTable(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP,
	         \upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_DATA_MODEL_ID,
	         \upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO);
	   $this->deleteFromGroupTable(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
	         \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_DATA_MODEL_ID,
	         \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO);
	   $this->deleteFromGroupTable(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP,
	         \upro\dataModel\DataModelConstants::GROUP_DATA_DATA_MODEL_ID,
	         \upro\dataModel\DataModelConstants::GROUP_DATA_VALID_TO);
	}

	/**
	 * Deletes old entries from a group related table
	 * @param unknown_type $tableName the name of the table to delete from
	 * @param unknown_type $columnDataModelId the column name for the data model ID
	 * @param unknown_type $columnValidTo the column name storing the validTo value
	 */
	private function deleteFromGroupTable($tableName, $columnDataModelId, $columnValidTo)
	{
	   $query = new \upro\db\sql\DeleteQuery();
	   $query->deleteFromTable($tableName);

	   {
	      $dataModelIdSubject = new \upro\db\sql\clause\ColumnClauseSubject($columnDataModelId);
	      $validToSubject = new \upro\db\sql\clause\ColumnClauseSubject($columnValidTo);

	      $dataModelInstanceBox = new \upro\db\sql\ParameterBox($this->newInstance - DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT);

	      $clause = $dataModelIdSubject->equalsParameter(new \upro\db\sql\ParameterBox($this->dataContext->getModelId()));
	      $clause = $clause->andThat($validToSubject->isNull()->isFalse());
	      $clause = $clause->andThat($validToSubject->isSmallerThanParameter($dataModelInstanceBox));

	      $query->where($clause);
	   }

	   $executor = $this->dataContext->getStatementExecutor($query);
	   $executor->execute(new \upro\db\executor\NullResultSetHandler());
	   $executor->close();
	}
}

}