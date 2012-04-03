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