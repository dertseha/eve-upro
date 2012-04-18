<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../StandardDataModelDefinition.php';

/**
 * An abstract database data model definition, implementing the basic functions
 */
abstract class AbstractDatabaseDataModelDefinition implements DatabaseDataModelDefinition
{
   /**
    * The previous version preceeding this definition
    * @var \upro\dataModel\db\DatabaseDataModelDefinition
    */
   private $previousVersion;

   /**
    * @var string:\upro\db\schema\TableControl tables of the model
    */
   private $tables;

   /**
    * The abstract data model definition
    * @var \upro\dataModel\StandardDataModelDefinition
    */
   private $dataModelDefinition;

   /**
    * Constructor
    */
   function __construct()
   {
      $this->tables = array();
      $dataModelDefinition = new \upro\dataModel\StandardDataModelDefinition();
   }

   /** {@inheritDoc} */
   public function getTable($tableName)
   {
      return $this->tables[$tableName];
   }

   /** {@inheritDoc} */
   public function getTableNames()
   {
      return array_keys($this->tables);
   }

   /**
    * Adds given table to the definition
    * @param \upro\db\schema\TableControl $control to add
    */
   public function addTable(\upro\db\schema\TableControl $control)
   {
      $this->tables[$control->getTableName()] = $control;
   }

   /**
    * Adds a database table and registers its name in the data model definition, along with a context type
    * @param \upro\db\schema\TableControl $table the table to add
    * @param string $contextType the corresponding context type
    */
   public function addContextTable(\upro\db\schema\TableControl $table, $contextType)
   {
      $this->dataModelDefinition->registerEntryType($table->getTableName(), $contextType);
      $this->addTable($table);
   }
}

}