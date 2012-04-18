<?php
namespace upro\db\schema
{

/**
 * Defining a table
 */
interface TableDefinition
{
   /**
    * @return string the name of the table
    */
   function getTableName();

   /**
    * Checks wheter a specific column exists
    * @param string $columnName the name of the column to query
    * @return boolean true if a column with given name exists
    */
   function hasColumn($columnName);

   /**
    * @return array names of registered columns
    */
   function getColumnNames();

   /**
    * Retrieves the column definition of given column
    * @param string $columnName of the column to get
    * @return \upro\db\schema\ColumnDefinition
    */
   function getColumn($columnName);
}

}