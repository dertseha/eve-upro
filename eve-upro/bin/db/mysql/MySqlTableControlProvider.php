<?php
namespace upro\db\mysql
{
require_once realpath(dirname(__FILE__)) . '/../schema/TableControlProvider.php';
require_once realpath(dirname(__FILE__)) . '/../schema/StandardTableControl.php';
require_once realpath(dirname(__FILE__)) . '/../schema/ColumnDefinition.php';
require_once realpath(dirname(__FILE__)) . '/../schema/SchemaHelper.php';

require_once realpath(dirname(__FILE__)) . '/MySqlConnection.php';

/**
 * A MySQL table control provider
 */
class MySqlTableControlProvider implements \upro\db\schema\TableControlProvider
{
   /**
    * @var \upro\db\mysql\MySqlConnection the connection for the provider
    */
   private $connection;

   /**
    * Constructor
    * @param \upro\db\mysql\MySqlConnection $connection the connection for the provider
    */
   function __construct(\upro\db\mysql\MySqlConnection $connection)
   {
      $this->connection = $connection;
   }

   /** {@inheritDoc} */
   public function isTableExisting($tableName)
   {
      $lowerTableName = strtolower($tableName);
      $queryText = 'SHOW TABLES LIKE "' . $this->connection->escapeString($tableName) . '"';
      $reader = $this->getResultTable($queryText);
      $existing = false;

      $rowCount = $reader->getRowCount();
      for ($i = 0; !$existing && ($i < $rowCount); $i++)
      {
         $row = $reader->getRow($i);

         if (strtolower($row[0]) == $lowerTableName)
         {
            $existing = true;
         }
      }

      return $existing;
   }

   /** {@inheritDoc} */
   function createTable(\upro\db\schema\TableDefinition $definition)
   {
      $statement = 'CREATE TABLE ' . $definition->getTableName() . ' (';
      $columnNames = $definition->getColumnNames();
      $first = true;

      foreach ($columnNames as $columnName)
      {
         if ($first)
         {
            $first = false;
         }
         else
         {
            $statement .= ', ';
         }
         $statement .= $this->getColumnStatement($definition->getColumn($columnName));
      }
      $statement .= ') ENGINE InnoDB';

      $this->connection->executeIgnoreResult($statement);
   }

   /** {@inheritDoc} */
   public function getTableDefinition($tableName)
   {
      $queryText = 'DESCRIBE ' . $tableName;
      $reader = $this->getResultTable($queryText);
      $table = new \upro\db\schema\StandardTableControl($tableName);

      $rowCount = $reader->getRowCount();
      for ($i = 0; $i < $rowCount; $i++)
      {
         $row = $reader->getRow($i);
         $dataType = \upro\db\schema\SchemaHelper::parseDataType($row[1]);
         $columnName = $row[0];
         $column = $table->addColumn($columnName, $dataType);

         if (strcasecmp($row[2], 'NO') == 0)
         {
            $column->setNullable(false);
         }
         $column->setDefaultValue($row[4]);
      }

      return $table;
   }

   /** {@inheritDoc} */
   public function dropTable($tableName)
   {
      $statement = 'DROP TABLE ' . $tableName;

      $this->connection->executeIgnoreResult($statement);
   }

   /** {@inheritDoc} */
   public function addColumn($tableName, $column)
   {
      $statement = 'ALTER TABLE ' . $tableName . ' ADD COLUMN ' . $this->getColumnStatement($column);

      $this->connection->executeIgnoreResult($statement);
   }

   /**
    * Executes a statement and extracts the resultset data
    * @param string $queryText query to execute
    * @throws \upro\db\DatabaseException on error
    * @return \upro\db\BufferTableRowReader result table
    */
   private function getResultTable($queryText)
   {
      $statement = $this->connection->prepareStatement($queryText);
      $reader = new \upro\db\BufferTableRowReader();
      $result = null;
      $existing = false;

      try
      {
         $result = $statement->execute();
         $result->read($reader);
         $result->close();
         $result = null;
         $statement->close();
      }
      catch (\upro\db\DatabaseException $ex)
      {
         if ($result)
         {
            $result->close();
         }
         $statement->close();
         throw $ex;
      }

      return $reader;
   }

   /**
    * Creates the column definition statement as string
    * @param \upro\db\schema\ColumnDefinition $column to generate the string for
    * @return string substatement for the column
    */
   private function getColumnStatement(\upro\db\schema\ColumnDefinition $column)
   {
      $statement = $column->getColumnName() . ' ';
      $statement .= $column->getDataType()->getSqlText();
      if ($column->isNullable())
      {
         $statement .= ' NULL';
      }
      else
      {
         $statement .= ' NOT NULL';
      }
      if (($column->getDefaultValue() != null) || $column->isNullable())
      {
         $statement .= ' DEFAULT ' . $this->connection->getTypeBasedString($column->getDefaultValue());
      }

      return $statement;
   }
}

}