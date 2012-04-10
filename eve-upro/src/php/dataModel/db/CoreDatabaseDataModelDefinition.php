<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . 'DatabaseDataModelConstants.php';
require_once realpath(dirname(__FILE__)) . 'DatabaseDataModelDefinition.php';

require_once realpath(dirname(__FILE__)) . '../../db/schema/TableControl.php';
require_once realpath(dirname(__FILE__)) . '../../db/schema/StringDataType.php';
require_once realpath(dirname(__FILE__)) . '../../db/schema/IntegerDataType.php';
require_once realpath(dirname(__FILE__)) . '../../db/schema/UuidDataType.php';


/**
 * The core definition of a database based data model
 */
class CoreDatabaseDataModelDefinition implements DatabaseDataModelDefinition
{
   /**
    * @var string:\upro\db\schema\TableControl tables of the model
    */
   private $tables;

   /**
    * Constructor
    */
   function __construct()
   {
      $this->addTable($this->defineDataModel());
      $this->addTable($this->defineDataModelChangeHistory());
   }

   /** {@inheritDoc} */
   public function addTable(\upro\db\schema\TableControl $control)
   {
      $this->tables[$control->getTableName()] = $control;
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
    * Defines the DataModel table
    * @return \upro\db\schema\TableControl the table control
    */
   private function defineDataModel()
   {
      $table = new \upro\db\schema\TableControl(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL);

      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_NAME, new \upro\db\schema\StringDataType(40));
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_INSTANCE, new \upro\db\schema\IntegerDataType())->setDefaultValue(0);

      return $table;
   }

   /**
    * Defines the DataModelChangeHistory table
    * @return \upro\db\schema\TableControl the table control
    */
   private function defineDataModelChangeHistory()
   {
      $table = new \upro\db\schema\TableControl(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL_CHANGE_HISTORY);

      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE, new \upro\db\schema\IntegerDataType());

      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ID, new \upro\db\schema\StringDataType(32));
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_MESSAGE, new \upro\db\schema\StringDataType(1024));

      return $table;
   }
}

}