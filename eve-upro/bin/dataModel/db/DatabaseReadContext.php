<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataContext.php';
require_once realpath(dirname(__FILE__)) . '/DataModelHistoryResultSetHandler.php';

require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../ReadContext.php';
require_once realpath(dirname(__FILE__)) . '/../ReadAccess.php';
require_once realpath(dirname(__FILE__)) . '/../HistoryReader.php';

require_once realpath(dirname(__FILE__)) . '/../../db/sql/SelectQuery.php';

/**
 * A read context for a database
 */
class DatabaseReadContext implements \upro\dataModel\ReadContext, \upro\dataModel\ReadAccess
{
   /**
    * Helper for data actions
    * @var \upro\dataModel\db\DatabaseDataContext
    */
   private $dataContext;

   /**
    * The current instance ID of the model
    * @var int
    */
   private $currentInstance;

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
    * @param \upro\dataModel\db\DatabaseDataContext $dataContext the data context to work in
    */
   function __construct(\upro\dataModel\db\DatabaseDataContext $dataContext)
   {
      $this->dataContext = $dataContext;
      $this->currentInstance = 0;
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
	   $result = 0;

      if ($this->isPrepared())
      {
   	   $this->currentInstance = $result = $this->dataContext->startTransaction(false);

   	   if (($lastInstance <= 0) ||
   	         ($lastInstance <= ($this->currentInstance - \upro\dataModel\db\DatabaseDataModelConstants::CHANGE_HISTORY_ENTRY_LIMIT)))
   	   {
   	      $this->dataContext->readCurrentInterest($this->currentInstance);
   	      $reader->reset($this);
   	   }
   	   else
   	   {
   	      $this->dataContext->readCurrentInterest($lastInstance);
   	      $this->historyEntryModelInstanceBox->setValue($lastInstance);
   	      $this->historySelectExecutor->execute(new \upro\dataModel\db\DataModelHistoryResultSetHandler($this, $reader));
   	   }

   	   $this->dataContext->commitTransaction();
   	   $this->currentInstance = 0;
      }

      return $result;
	}

   /** {@inheritDoc} */
	public function getCurrentInstanceValue()
	{
	   return $this->currentInstance;
	}

   /** {@inheritDoc} */
	public function isAccessGranted(\upro\dataModel\DataEntryId $entryId, $instance)
	{
	   return $this->dataContext->isAccessGranted($entryId, $instance);
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
	      $clause = $dataModelIdSubject->equalsParameter(new \upro\db\sql\ParameterBox($this->dataContext->getModelId()))
	         ->andThat($dataModelInstanceSubject->isGreaterThanParameter($this->historyEntryModelInstanceBox));
	      $this->historySelectQuery->where($clause);
	   }
	   $this->historySelectQuery->orderByColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE);

	   $this->historySelectExecutor = $this->dataContext->getStatementExecutor($this->historySelectQuery);
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