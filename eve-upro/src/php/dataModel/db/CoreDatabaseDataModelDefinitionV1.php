<?php
namespace upro\dataModel\db
{
require_once realpath(dirname(__FILE__)) . '/../../db/schema/TableControl.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/StringDataType.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/IntegerDataType.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/BooleanDataType.php';
require_once realpath(dirname(__FILE__)) . '/../../db/schema/UuidDataType.php';

require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelConstants.php';
require_once realpath(dirname(__FILE__)) . '/DatabaseDataModelDefinition.php';
require_once realpath(dirname(__FILE__)) . '/AbstractDatabaseDataModelDefinition.php';

/**
 * The core definition of a database based data model
 */
abstract class CoreDatabaseDataModelDefinitionV1 extends AbstractDatabaseDataModelDefinition
{
   /**
    * Length of an entry type string
    * @var int
    */
   const ENTRY_TYPE_LENGTH = 32;

   /**
    * Constructor
    */
   function __construct()
   {
      parent::__construct();

      $this->defineDataModel();
      $this->defineDataModelChangeHistory();

      $this->defineGroup();
      $this->defineInterest();
      $this->defineMembership();
   }

   /** {@inheritDoc} */
   public function getDataModelDefinition()
   {
      return $this->dataModelDefinition;
   }

   /**
    * Creates a basic table control for given entry name
    * @param string $entryName name of the entry
    * @return \upro\db\schema\TableControl the created table control
    */
   protected function createDataEntryTableDefinition($entryName)
   {
      $table = new \upro\db\schema\TableControl($entryName);

      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_ID, new \upro\db\schema\UuidDataType())
            ->setNullable(false);
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ID, new \upro\db\schema\UuidDataType())
            ->setNullable(false);
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_CONTEXT_ENTRY_TYPE,
            new \upro\db\schema\StringDataType(\upro\dataModel\db\CoreDatabaseDataModelDefinition::ENTRY_TYPE_LENGTH))
            ->setNullable(false);

      return $table;
   }

   /**
    * Defines the DataModel table
    */
   private function defineDataModel()
   {
      $table = new \upro\db\schema\TableControl(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL);

      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_NAME, new \upro\db\schema\StringDataType(40));
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_INSTANCE, new \upro\db\schema\IntegerDataType())->setDefaultValue(0);

      $this->addTable($table);
   }

   /**
    * Defines the DataModelChangeHistory table
    */
   private function defineDataModelChangeHistory()
   {
      $table = new \upro\db\schema\TableControl(DatabaseDataModelConstants::TABLE_NAME_DATA_MODEL_CHANGE_HISTORY);

      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_DATA_MODEL_INSTANCE, new \upro\db\schema\IntegerDataType());

      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ENTRY_TYPE, new \upro\db\schema\StringDataType(32));
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_CONTEXT_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(DatabaseDataModelConstants::COLUMN_NAME_DATA_MODEL_CHANGE_HISTORY_MESSAGE, new \upro\db\schema\StringDataType(1024));

      $this->addTable($table);
   }

   /**
    * Defines the Group main table
    */
   private function defineGroup()
   {
      $table = $this->createDataEntryTableDefinition(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP);

      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_DATA_GROUP_TYPE, new \upro\db\schema\StringDataType(32));
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_DATA_DATA_MODEL_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_FROM, new \upro\db\schema\IntegerDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_DATA_VALID_TO, new \upro\db\schema\IntegerDataType());

      $this->addContextTable($table, \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP);
   }

   /**
    * Defines group interest table
    */
   private function defineGroupInterest()
   {
      $table = $this->createDataEntryTableDefinition(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_INTEREST);

      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_DATA_MODEL_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_FROM, new \upro\db\schema\IntegerDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_VALID_TO, new \upro\db\schema\IntegerDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_CONTROLLED, new \upro\db\schema\BooleanDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ENTRY_TYPE,
            new \upro\db\schema\StringDataType(\upro\dataModel\db\CoreDatabaseDataModelDefinition::ENTRY_TYPE_LENGTH));
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_INTEREST_DATA_INTEREST_ID, new \upro\db\schema\UuidDataType());

      $this->addContextTable($table, \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP);
   }

   /**
    * Defines group membership table
    */
   private function defineGroupMembership()
   {
      $table = $this->createDataEntryTableDefinition(\upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP_MEMBERSHIP);

      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_DATA_MODEL_ID, new \upro\db\schema\UuidDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_FROM, new \upro\db\schema\IntegerDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_VALID_TO, new \upro\db\schema\IntegerDataType());
      $table->addColumn(\upro\dataModel\DataModelConstants::GROUP_MEMBERSHIP_DATA_USER_ID, new \upro\db\schema\UuidDataType());

      $this->addContextTable($table, \upro\dataModel\DataModelConstants::ENTRY_TYPE_GROUP);
   }
}

}