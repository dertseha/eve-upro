<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../../db/TransactionControl.php';
require_once realpath(dirname(__FILE__)) . '/../../db/SingleCellTableRowReader.php';
require_once realpath(dirname(__FILE__)) . '/../../db/KeyedBufferTableRowReader.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/SimpleResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/KeyedBufferResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/SelectQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/ColumnSelectExpression.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/clause/ColumnClauseSubject.php';

require_once realpath(dirname(__FILE__)) . '/../DataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/../WriteContext.php';
require_once realpath(dirname(__FILE__)) . '/../DataEntryId.php';
require_once realpath(dirname(__FILE__)) . '/../DataEntry.php';

require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelHelper.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelDefinition.php';

/**
 * A basic data context for a database
 */
class DatabaseDataContext
{
   const ALIAS_NAME_MEMBERSHIP_VALID_FROM = 'membershipValidFromInstance';
   const ALIAS_NAME_MEMBERSHIP_VALID_TO = 'membershipValidToInstance';

   /**
    * @var \upro\db\TransactionControl the transaction control
    */
   private $transactionControl;

   /**
    * @var \upro\db\executor\StatementExecutorFactory factory for statement execution
    */
   private $statementExecutorFactory;

   /**
    * The definitoin of the data model
    * @var \upro\dataModel\db\DatabaseDataModelDefinition
    */
   private $definition;

   /**
    * @var string ID of the model
    */
   private $modelId;

   /**
    * @var string ID of the user
    */
   private $userId;

   /**
    * @var array of \upro\dataModel\DataEntry
    */
   private $interests;

   /**
    * Constructor
    * @param \upro\db\TransactionControl $transactionControl to use
    * @param \upro\db\executor\StatementExecutorFactory $statementExecutorFactory to use
    * @param \upro\dataModel\db\DatabaseDataModelDefinition $definition the definition of the data model
    * @param string $modelId UUID of the model
    * @param string $userId UUID of the user for which this context is running
    */
   function __construct(\upro\db\TransactionControl $transactionControl,
         \upro\db\executor\StatementExecutorFactory $statementExecutorFactory,
         \upro\dataModel\db\DatabaseDataModelDefinition $definition, $modelId, $userId)
   {
      $this->transactionControl = $transactionControl;
      $this->statementExecutorFactory = $statementExecutorFactory;
      $this->definition = $definition;
      $this->modelId = $modelId;
      $this->userId = $userId;
      $this->interests = array();
   }

   /**
    * @return string the model ID
    */
   public function getModelId()
   {
      return $this->modelId;
   }

   /**
    * @return \upro\dataModel\DataModelDefinition the abstract definition of the data model
    */
   public function getDataModelDefinition()
   {
      return $this->definition->getDataModelDefinition();
   }

   /**
    * Requests to start a transaction
    * @param boolean $forWrite true if the model shall be locked for writing
    * @return int the current model instance
    */
   public function startTransaction($forWrite)
   {
      $tableNames = $this->definition->getTableNames();
      $tablesForReadLock = $forWrite ? array() : $tableNames;
      $tablesForWriteLock = $forWrite ? $tableNames : array();

      $this->transactionControl->start($tablesForWriteLock, $tablesForReadLock);

      return $this->getCurrentDataModelInstance();
   }

   /**
    * Requests to commit the active transaction
    */
   public function commitTransaction()
   {
      $this->transactionControl->commit();
   }

   /**
    * Requests to roll back the active transaction
    */
   public function rollbackTransaction()
   {
      $this->transactionControl->rollback();
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
      $query = new \upro\db\sql\SelectQuery();

      $query->selectColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_INSTANCE);
      $query->fromTable(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL);
      {
         $columnSubject = new \upro\db\sql\clause\ColumnClauseSubject(DatabaseDataModelConstants::COLUMN_NAME_ID);
         $query->where($columnSubject->equalsParameter(new \upro\db\sql\ParameterBox($this->modelId)));
      }

      $executor = $this->getStatementExecutor($query);
      $executor->execute(new \upro\db\executor\SimpleResultSetHandler($reader));
      $executor->close();

      return $reader->getValue();
   }

   /**
    * Reads the current interest, starting from given instance value
    * @param int $fromInstance from which instance to check
    */
   public function readCurrentInterest($fromInstance)
   {
      $query = $this->getCurrentInterestSelectQuery($fromInstance);
      $handler = new \upro\db\executor\KeyedBufferResultSetHandler();

      $executor = $this->getStatementExecutor($query);
      $executor->execute($handler);
      $executor->close();

      $reader = $handler->getReader();
      $this->interests = array();
      for ($i = 0; $i < $reader->getRowCount(); $i++)
      {
         $entry = \upro\dataModel\db\DatabaseDataModelHelper::extractDataEntry('FilteredInterest', $reader, $i);

         $this->interests[] = $entry;
      }
   }

   /**
    * Determines whether given interest ID may be accessed
    * @param \upro\dataModel\DataEntryId $interestId the ID to check
    * @param int $instance within which instance to test this
    * @return boolean true if access is allowed for given ID
    */
   public function isAccessGranted(\upro\dataModel\DataEntryId $interestId, $instance)
   {
      return $this->existsInterest($interestId, $instance, false);
   }

   /**
    * Determines whether given interest ID may be controlled
    * @param \upro\dataModel\DataEntryId $interestId the ID to check
    * @param int $instance within which instance to test this
    * @return boolean true if control is allowed for given ID
    */
   public function isControlGranted(\upro\dataModel\DataEntryId $interestId, $instance)
   {
      return $this->existsInterest($interestId, $instance, true);
   }

   /**
    * Returns the SELECT query for the current interest
    * @param int $fromInstance the oldest data model instance of relevance for this query
    * @return \upro\db\sql\SelectQuery the query to run
    */
   private function getCurrentInterestSelectQuery($fromInstance)
   {
      $query = new \upro\db\sql\SelectQuery();

      $query->selectColumn(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST . '.*');

      $baseName = \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP . '.' . \upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_FROM;
      $expression = new \upro\db\sql\ColumnSelectExpression($baseName);
      $query->select($expression->alias(DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_FROM));

      $baseName = \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP . '.' . \upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO;
      $expression = new \upro\db\sql\ColumnSelectExpression($baseName);
      $query->select($expression->alias(DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_TO));

      $query->fromTables(array(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST,
            \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP));
      {
         $fromInstanceParam = new \upro\db\sql\ParameterBox($fromInstance);

         $subjectInterestContextId = new \upro\db\sql\clause\ColumnClauseSubject(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST
               . '.' . \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID);
         $subjectMembershipContextId = new \upro\db\sql\clause\ColumnClauseSubject(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP
               . '.' . \upro\dataModel\db\DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID);
         $subjectInterestFromInstance = new \upro\db\sql\clause\ColumnClauseSubject(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST
               . '.' . \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_FROM);
         $subjectInterestToInstance = new \upro\db\sql\clause\ColumnClauseSubject(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST
               . '.' . \upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO);
         $subjectMembershipFromInstance = new \upro\db\sql\clause\ColumnClauseSubject(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP
               . '.' . \upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_FROM);
         $subjectMembershipToInstance = new \upro\db\sql\clause\ColumnClauseSubject(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP
               . '.' . \upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO);

         // match proper interest and membership entries
         $clause = $subjectInterestContextId->equals($subjectMembershipContextId);
         // match proper user ID
         $subjectUserId = new \upro\db\sql\clause\ColumnClauseSubject(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP
               . '.' . \upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID);
         $clause = $clause->andThat($subjectUserId->equalsParameter(new \upro\db\sql\ParameterBox($this->userId)));
         // match the interest TO is either unlimited or in the future and matching the membership range
         $interestToClause = $subjectInterestToInstance->isGreaterThanParameter($fromInstanceParam);
         $interestToClause = $interestToClause->andThat($subjectMembershipFromInstance->isSmallerThan($subjectInterestToInstance));
         $clause = $clause->andThat($subjectInterestToInstance->isNull()->orThat($interestToClause));
         // match the membership TO is either unlimited or in the future and matching the interest range
         $membershipToClause = $subjectMembershipToInstance->isGreaterThanParameter($fromInstanceParam);
         $membershipToClause = $membershipToClause->andThat($subjectInterestFromInstance->isSmallerThan($subjectMembershipToInstance));
         $clause = $clause->andThat($subjectMembershipToInstance->isNull()->orThat($membershipToClause));

         $query->where($clause);
      }

      return $query;
   }

   /**
    * Determines whether interest (access or controlled) exists for given ID in given instance
    * @param \upro\dataModel\DataEntryId $interestId the ID to check
    * @param int $instance within which instance to test this
    * @param boolean $controlled whether the interest should be a controlling one
    */
   private function existsInterest(\upro\dataModel\DataEntryId $interestId, $instance, $controlled)
   {
      $result = false;

      foreach ($this->interests as $entry)
      {
         $data = $entry->getData();
         $entryType = $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE];
         $id = $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID];
         $interestFrom = $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_FROM];
         $interestTo = $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO];
         $membershipFrom = $data[DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_FROM];
         $membershipTo = $data[DatabaseDataContext::ALIAS_NAME_MEMBERSHIP_VALID_TO];
         $isControlled = $data[\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_CONTROLLED];
         $minimumTo = $interestTo;

         if (is_null($minimumTo) || (!is_null($membershipTo) && ($membershipTo < $minimumTo)))
         {
            $minimumTo = $membershipTo;
         }
         if (($id === $interestId->getKey()) && ($entryType === $interestId->getEntryType())
               && ($interestFrom <= $instance) && ($membershipFrom < $instance)
               && ((is_null($minimumTo)) || ($instance <= $minimumTo))
               && ($isControlled || !$controlled))
         {
            $result = true;
         }
      }

      return $result;
   }
}

}