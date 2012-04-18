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
    * @return int the version number of this definition
    */
   function getVersionNumber();

   /**
    * Returns the previous version of this definition
    * @return \upro\dataModel\db\DatabaseDataModelDefintion the previous version or null if first
    */
   function getPreviousVersion();

   /**
    * Returns the abstract data model definition
    * @return \upro\dataModel\DataModelDefinition the abstract data model definition
    */
   function getDataModelDefinition();

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