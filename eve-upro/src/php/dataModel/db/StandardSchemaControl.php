<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../../db/executor/StatementExecutorFactory.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/StatementExecutor.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/SimpleResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../../db/executor/NullResultSetHandler.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/TableControlProvider.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/TableControl.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/ColumnControl.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/SelectQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/InsertQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/sql/UpdateQuery.php';
require_once realpath(dirname(__FILE__)) . '/../../db/SingleCellTableRowReader.php';

require_once realpath(dirname(__FILE__)) . '/SchemaControl.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelDefinition.php';

/**
 * A standard Schema control implementation
 * It handles a simple table named "SchemaControl" with one column: "version" which
 * stores the version of the current data model definition.
 */
class StandardSchemaControl implements \upro\dataModel\db\SchemaControl
{
   /**
    * The table name storing the schema control
    * @var string
    */
   const TABLE_NAME_SCHEMA_CONTROL = 'SchemaControl';

   /**
    * Column name for version
    * @var string
    */
   const COLUMN_NAME_VERSION = 'version';

   /**
    * The provider for table control
    * @var \upro\db\schema\TableControlProvider
    */
   private $tableControlProvider;

   /**
    * executor factory for specific statements
    * @var \upro\db\executor\StatementExecutorFactory
    */
   private $executorFactory;

   /**
    * The expected, up to date, definition
    * @var \upro\dataModel\db\DatabaseDataModelDefinition
    */
   private $definition;

   /**
    * Constructor
    * @param \upro\dataModel\db\DatabaseDataModelDefinition $definition the current definition of the application
    * @param \upro\db\schema\TableControlProvider $tableControlProvider the control provider for accessing the schema
    * @param \upro\db\executor\StatementExecutorFactory $executorFactory executor factory for managment control
    */
   function __construct(\upro\dataModel\db\DatabaseDataModelDefinition $definition,
         \upro\db\schema\TableControlProvider $tableControlProvider,
         \upro\db\executor\StatementExecutorFactory $executorFactory)
   {
      $this->tableControlProvider = $tableControlProvider;
      $this->definition = $definition;
      $this->executorFactory = $executorFactory;
   }

   /** {@inheritDoc} */
   public function isUpToDate()
   {
      $result = false;

      if ($this->tableControlProvider->isTableExisting(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL))
      {
         $version = $this->getSchemaControlVersion();

         if ($version >= $this->definition->getVersionNumber())
         {
            $result = true;
         }
      }

      return $result;
   }

   /** {@inheritDoc} */
   public function update()
   {
      if (!$this->tableControlProvider->isTableExisting(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL))
      {
         $this->createAndInitializeSchemaControlTable();
         $this->updateToDefinition($this->definition);
      }
      else
      {
         $oldVersion = $this->getSchemaControlVersion();
         $definitions = array();
         $definition = $this->definition;

         while (($definition != null) && ($oldVersion < $definition->getVersionNumber()))
         {
            $definitions[] = $definition;
            $definition = $definition->getPreviousVersion();
         }
         for ($i = count($definitions) - 1; $i >= 0; $i--)
         {
            $definition = $definitions[$i];
            $this->updateToDefinition($definition);
         }
      }
   }

   /**
    * Reads the version from the schema control table
    * @return int the version number
    */
   private function getSchemaControlVersion()
   {
      $query = new \upro\db\sql\SelectQuery();
      $reader = new \upro\db\SingleCellTableRowReader(-1);

      $query->selectColumn(\upro\dataModel\db\StandardSchemaControl::COLUMN_NAME_VERSION);
      $query->fromTable(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL);

      $executor = $this->executorFactory->getExecutor($query);
      $executor->execute(new \upro\db\executor\SimpleResultSetHandler($reader));
      $executor->close();

      return $reader->getValue();
   }

   /**
    * Creates the schema control table
    */
   private function createAndInitializeSchemaControlTable()
   {
      {
         $table = new \upro\db\schema\StandardTableControl(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL);

         $table->addColumn(\upro\dataModel\db\StandardSchemaControl::COLUMN_NAME_VERSION, new \upro\db\schema\IntegerDataType())
               ->setNullable(false);
         $this->tableControlProvider->createTable($table);
      }
      {
         $query = new \upro\db\sql\InsertQuery();

         $query->intoTable(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL);
         $query->columnName(\upro\dataModel\db\StandardSchemaControl::COLUMN_NAME_VERSION)->valueConstant(-1);

         $executor = $this->executorFactory->getExecutor($query);
         $executor->execute(new \upro\db\executor\NullResultSetHandler());
         $executor->close();
      }
   }

   /**
    * Updates the schema to the given definition
    * @param \upro\dataModel\db\DatabaseDataModelDefinition $definition the definition to update to
    */
   private function updateToDefinition(\upro\dataModel\db\DatabaseDataModelDefinition $definition)
   {
      $tableNames = $definition->getTableNames();

      foreach ($tableNames as $tableName)
      {
         $newTable = $definition->getTable($tableName);

         if (!$this->tableControlProvider->isTableExisting($tableName))
         {
            $this->tableControlProvider->createTable($newTable);
         }
         else
         {
            $oldTable = $this->tableControlProvider->getTableDefinition($tableName);

            $this->updateTable($oldTable, $newTable);
         }
      }
      $this->setSchemaControlVersion($definition->getVersionNumber());
   }

   /**
    * Requests to set the schema control version
    * @param int $value
    */
   private function setSchemaControlVersion($value)
   {
      $query = new \upro\db\sql\UpdateQuery();

      $query->updateTable(\upro\dataModel\db\StandardSchemaControl::TABLE_NAME_SCHEMA_CONTROL);
      $query->setConstant(\upro\dataModel\db\StandardSchemaControl::COLUMN_NAME_VERSION, $value);

      $executor = $this->executorFactory->getExecutor($query);
      $executor->execute(new \upro\db\executor\NullResultSetHandler());
      $executor->close();
   }

   /**
    * Updates a table from an older version
    * @param \upro\db\schema\TableDefinition $oldTable the old version of the table
    * @param \upro\db\schema\TableDefinition $newTable the new version of the table
    */
   private function updateTable(\upro\db\schema\TableDefinition $oldTable, \upro\db\schema\TableDefinition $newTable)
   {
      $newColumnNames = $newTable->getColumnNames();

      foreach ($newColumnNames as $columnName)
      {
         $newColumn = $newTable->getColumn($columnName);

         if (!$oldTable->hasColumn($columnName))
         {
            $this->tableControlProvider->addColumn($newTable->getTableName(), $newColumn);
         }
      }
   }
}

}