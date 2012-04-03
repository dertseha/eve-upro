<?php
namespace upro\db\schema
{
require_once realpath(dirname(__FILE__)) . '/TableDefinition.php';


/**
 * Controlling a table
 */
interface TableControl extends \upro\db\schema\TableDefinition
{
   /**
    * Adds a new column
    * @param string $columnName name of the column to add
    * @param \upro\db\schema\DataType $dataType type of the column
    * @return \upro\db\schema\ColumnControl the added column
    */
   function addColumn($columnName, $dataType);
}

}