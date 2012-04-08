<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../../db/schema/TableControl.php';


/**
 * A definition of a data model
 */
interface DatabaseDataModelDefinition
{
   /**
    * Adds given table to the definition
    * @param \upro\db\schema\TableControl $control to add
    */
   function addTable(\upro\db\schema\TableControl $control);

   /**
    * Retrieves the table control for given name
    * @param string $tableName to look for
    * @return \upro\db\schema\TableControl
    */
   function getTable($tableName);

   /**
    * Returns the list of table names
    * @return array of table names
    */
   function getTableNames();
}

}