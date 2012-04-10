<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataContext.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseWriteContext.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseReadContext.php';

require_once realpath(dirname(__FILE__)) . '/../../Uuid.php';
require_once realpath(dirname(__FILE__)) . '/../DataModelProvider.php';

require_once realpath(dirname(__FILE__)) . '/../../db/SingleCellTableRowReader.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/ParameterBox.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/SelectQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/InsertQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/clause/ColumnClauseSubject.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/ParameterValueExpression.php';

require_once realpath(dirname(__FILE__)) . '/../../db/executor/StatementExecutorFactory.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/SimpleResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/NullResultSetHandler.php';

/**
 * A DataModel provider based on database
 */
class DatabaseDataModelProvider implements \upro\dataModel\DataModelProvider
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
    * Constructor
    * @param \upro\db\TransactionControl $transactionControl to use
    * @param \upro\db\executor\StatementExecutorFactory $statementExecutorFactory to use
    * @param array $tableNames list of table names the model consists of
    */
   function __construct(\upro\db\TransactionControl $transactionControl,
         \upro\db\executor\StatementExecutorFactory $statementExecutorFactory, $tableNames)
   {
      $this->transactionControl = $transactionControl;
      $this->statementExecutorFactory = $statementExecutorFactory;
      $this->tableNames = $tableNames;
   }

   /** {@inheritDoc} */
   public function isModelExisting($name)
   {
      $id = $this->getDataModelId($name);

      return DatabaseDataModelProvider::isDataModelIdValid($id);
   }

   /** {@inheritDoc} */
   public function createDataModel($name)
   {
      $query = new \upro\db\sql\InsertQuery();
      $id = \Uuid::v4();

      $query->intoTable(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL);
      $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_ID)->valueConstant($id);
      $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_NAME)->valueConstant($name);
      $query->columnName(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_INSTANCE)->valueConstant(0);

      $executor = $this->statementExecutorFactory->getExecutor($query);
      $executor->execute(new \upro\db\executor\NullResultSetHandler());
      $executor->close();
   }

   /** {@inheritDoc} */
   public function getWriteContext($name)
   {
      $modelId = $this->getDataModelId($name);
      $context = null;

      if (DatabaseDataModelProvider::isDataModelIdValid($modelId))
      {
         $context = new \upro\dataModel\db\DatabaseWriteContext($this->getDataContext($modelId));
      }

      return $context;
   }

   /** {@inheritDoc} */
   public function getReadContext($name)
   {
      $modelId = $this->getDataModelId($name);
      $context = null;

      if (DatabaseDataModelProvider::isDataModelIdValid($modelId))
      {
         $context = new \upro\dataModel\db\DatabaseReadContext($this->getDataContext($modelId));
      }

      return $context;
   }

   /**
    * Retrieves the data model ID by given name
    * @param string $name name of the model
    * @return string UUID of the found model or Uuid::EMPTY_UUID
    */
   private function getDataModelId($name)
   {
      $query = new \upro\db\sql\SelectQuery();
      $columnSubject = new \upro\db\sql\clause\ColumnClauseSubject(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_NAME);
      $reader = new \upro\db\SingleCellTableRowReader(\Uuid::EMPTY_UUID);

      $query->selectColumn(DatabaseDataModelConstants::COLUMN_NAME_ID);
      $query->fromTable(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL);
      $query->where($columnSubject->equalsParameter(new \upro\db\sql\ParameterBox($name)));

      $executor = $this->statementExecutorFactory->getExecutor($query);
      $executor->execute(new \upro\db\executor\SimpleResultSetHandler($reader));
      $executor->close();

      return $reader->getValue();
   }

   /**
    * Creates a data context instance
    * @param string $modelId the model ID to use
    * @return \upro\dataModel\db\DatabaseDataContext data context instance
    */
   private function getDataContext($modelId)
   {
      return new \upro\dataModel\db\DatabaseDataContext($this->transactionControl,
               $this->statementExecutorFactory, $this->tableNames, $modelId);
   }

   /**
    * Returns true if the given ID is a valid data model ID
    * @param string $id
    * @return boolean true if valid
    */
   private static function isDataModelIdValid($id)
   {
      return strcmp($id, \Uuid::EMPTY_UUID) !== 0;
   }
}

}