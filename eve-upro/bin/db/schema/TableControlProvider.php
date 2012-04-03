<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/TableControl.php';

/**
 * A provider for table control
 */
interface TableControlProvider
{
   /**
    * @param mixed $tableName the name of the table
    * @return boolean true if the table exists in the database
    */
   function isTableExisting($tableName);

   /**
    * Requests to create a table
    * @param \upro\db\schema\TableDefinition $definition upon which the table shall be created
    */
   function createTable(\upro\db\schema\TableDefinition $definition);

   /**
    * Retrieves the table definition for an existing table.
    * @param mixed $tableName the name of the table
    * @return \upro\db\scheme\TableDefinition a table control
    */
   function getTableDefinition($tableName);

   /**
    * Drops the table.
    * @param mixed $tableName the name of the table
    */
   function dropTable($tableName);

   /**
    * Adds a column to given table
    * @param string $tableName to which to add the column
    * @param \upro\db\schema\ColumnDefinition $column to add
    */
   function addColumn($tableName, $column);
}

}